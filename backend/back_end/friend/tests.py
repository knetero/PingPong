# from django.test import TestCase

# # Create your tests here.
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Friendship, Notification
from channels.testing import WebsocketCommunicator
from channels.layers import get_channel_layer
from asgiref.sync import sync_to_async
from authapp.models import User
from friend.models import Friendship

from .models import Friendship, Notification
#You need to import your ASGI application
from back_end.asgi import application as back_end
import asyncio

User = get_user_model()

class AddFriendshipViewTest(APITestCase):
    def setUp(self):
        """Set up test data before each test method"""
        # Create test users
        self.user1 = User.objects.create_user(
            username='testuser1',
            password='testpass123',
            email='test1@example.com'
        )
        self.user2 = User.objects.create_user(
            username='testuser2',
            password='testpass123',
            email='test2@example.com'
        )
        Friendship.objects.create(
            user_from=self.user1,  # Ensure self.user1 is a User instance
            user_to=self.user2
 )
        # user_from = User.objects.get(username="username")
        # user_to = User.objects.get(username="other_username")
        
        # Friendship = Friendship(user_from=user_from, user_to=user_to)
        # Friendship.save()
        
        # Set up the API client
        self.client = APIClient()
        
        # Get the endpoint URL
        self.url = reverse('friends-add')

    def get_token(self, user):
        """Helper method to get JWT token for a user"""
        response = self.client.post(reverse('token_obtain_pair'), {
            'username': user.username,
            'password': 'testpass123'
        })
        return response.data['access']

    def test_unauthorized_request(self):
        """Test that unauthorized requests are rejected"""
        response = self.client.post(self.url, {'username': 'testuser2'})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_add_friendship_success(self):
        """Test successful friendship request"""
        # Authenticate user1
        token = self.get_token(self.user1)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        # Send friend request
        response = self.client.post(self.url, {'username': 'testuser2'})
        
        # Check response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['success'], 'Friendship Added')

        # Check database
        friendship = Friendship.objects.filter(
            user_from=self.user1,
            user_to=self.user2
        ).first()
        self.assertIsNotNone(friendship)
        self.assertFalse(friendship.is_accepted)

        # Check notification
        notification = Notification.objects.filter(
            user=self.user2,
            action_by=self.user1.username
        ).first()
        self.assertIsNotNone(notification)
        self.assertTrue(notification.is_friend_notif)

    def test_add_self_as_friend(self):
        """Test that users cannot add themselves as friends"""
        token = self.get_token(self.user1)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        response = self.client.post(self.url, {'username': 'testuser1'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'wach nta wa7id t ajoute rassk?')

    def test_add_nonexistent_user(self):
        """Test adding a nonexistent user as friend"""
        token = self.get_token(self.user1)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        response = self.client.post(self.url, {'username': 'nonexistentuser'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'User does not exist')

    def test_add_existing_friendship(self):
        """Test adding an already existing friendship"""
        # Create existing friendship
        Friendship.objects.create(
            user_from=self.user1,
            user_to=self.user2,
            is_accepted=False
        )

        token = self.get_token(self.user1)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        response = self.client.post(self.url, {'username': 'testuser2'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Friendship alrady exist')

    def test_missing_username(self):
        """Test request with missing username"""
        token = self.get_token(self.user1)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        response = self.client.post(self.url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    async def test_notification_websocket(self):
        """Test websocket notification is sent"""
        # This requires additional setup for testing async code
        channel_layer = get_channel_layer()
        
        # Connect to websocket
        communicator = WebsocketCommunicator(
            application=back_end,  # You need to import your ASGI application
            path=f'/wss/notifications/{self.user2.id}/'
        )
        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        # Send friend request
        token = self.get_token(self.user1)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        await sync_to_async(self.client.post)(self.url, {'username': 'testuser2'})

        # Check notification received
        response = await communicator.receive_json_from()
        self.assertTrue(response['is_friend_notif'])
        self.assertEqual(response['action_by'], self.user1.username)

        await communicator.disconnect()

    def tearDown(self):
        """Clean up after each test"""
        User.objects.all().delete()
        Friendship.objects.all().delete()
        Notification.objects.all().delete()

