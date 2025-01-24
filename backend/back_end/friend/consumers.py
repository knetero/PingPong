import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from channels.layers import get_channel_layer
from django.contrib.auth.models import AnonymousUser
from django.db.models import F, Q

from authapp.models import User
from friend.models import Friendship
from asgiref.sync import sync_to_async
#JWTAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication


@database_sync_to_async
def get_user(user_id):
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return AnonymousUser()

@database_sync_to_async
def update_user_status(user_id, online):
    print(f"Updating user {user_id} status to {'online' if online else 'offline'}")
    try:
        user = User.objects.get(id=user_id)
        user.is_on = 1 if online else 0
        user.save(update_fields=['is_on'])
        print(f"Updated user {user_id} is_on to {user.is_on}")
        return user
    except User.DoesNotExist:
        print(f"User {user_id} not found")
        return None

@database_sync_to_async
def get_friends(user):
    return list(Friendship.objects.filter(Q(user_from=user) | Q(user_to=user)).select_related('user_from', 'user_to'))


class UserStatusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        if self.scope["user"].is_authenticated:
            self.user = await get_user(self.scope["user"].id)
            await self.accept()

            self.group_name = f'user_{self.user.id}'
            await self.channel_layer.group_add(self.group_name, self.channel_name)

            await self.update_user_online_status(True)
        else:
            await self.close()

    async def disconnect(self, close_code):
        if self.scope["user"].is_authenticated:
            await self.update_user_online_status(False)
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def update_user_online_status(self, is_on):
        if is_on:
            await update_user_status(self.user.id, True)
            await self.notify_friends(True)
        else:
            await update_user_status(self.user.id, False)
            await self.notify_friends(False)

    async def notify_friends(self, is_on):
        friends = await get_friends(self.user)
        for friendship in friends:
            friend = friendship.user_to if friendship.user_from == self.user else friendship.user_from
            group_name = f'user_{friend.id}'
            await self.channel_layer.group_send(
                group_name,
                {
                    'type': 'user_status',
                    'id': self.user.id,
                    'is_on': is_on
                }
            )

    async def user_status(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_status',
            'id': event['id'],
            'is_on': event['is_on']
        }))

    async def send_notification(self, event):
        print("************3", event)
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'notification_id': event['notification_id'],
            'count': event['count']
        }))
        await self.send(text_data=json.dumps({
                    'status': 'success',
                    'message': 'Invitation status updated successfully.',
        }))


@database_sync_to_async
def get_friendship(freindship_id):
    try:
        return Friendship.objects.get(freindship_id=freindship_id)
    except Friendship.DoesNotExist:
        return None

@database_sync_to_async
def get_friendship_by_user(user_from, user_to):
    print("User from:", user_from)  # Debug log
    print("User to:", user_to)  # Debug log
    try:
        friendship = Friendship.objects.filter(Q(user_from=user_from, user_to=user_to)
        | Q(user_from=user_to, user_to=user_from)).exists()
        print("----------Friendship:", friendship)  # Debug log  
        return friendship
    except Friendship.DoesNotExist:
        print("Friendship not found")  # Debug log
        return None
@database_sync_to_async
def get_friendship_by_userone(user_from, user_to):
    print("User from:", user_from)  # Debug log
    print("User to:", user_to)  # Debug log
    try:
        friendship = Friendship.objects.get(Q(user_from=user_from, user_to=user_to)
        | Q(user_from=user_to, user_to=user_from)) # Debug log  
        return friendship
    except Friendship.DoesNotExist:
        print("Friendship not found")  # Debug log
        return None

@database_sync_to_async
def get_userby_username(username):
    try:
        return User.objects.get(username=username)
    except User.DoesNotExist:
        return None
@database_sync_to_async
def get_user(user_id):
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return None
@database_sync_to_async
def get_user_from(friendship):
    try:
        return User.objects.get(id=friendship.user_from.id)
    except User.DoesNotExist:
        return None
@database_sync_to_async
def get_user_to(friendship):
    try:
        return User.objects.get(id=friendship.user_to.id)
    except User.DoesNotExist:
        return None
@database_sync_to_async
def is_same(user_id, user_id2):
    return user_id == user_id2
@database_sync_to_async
def get_id(user):
    print("User ID:", user.id)  # Debug log
    return user.id
@database_sync_to_async
def save_friendship(friendship):
    return friendship.save()

class FriendRequestConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        if self.scope["user"].is_authenticated:
            print(f"User {self.scope['user'].id} connected")
            self.user = self.scope["user"]
            await self.accept()

            # Create a personal group for the user to receive friend-related notifications
            self.group_name = f'user_{self.user.id}'
            await self.channel_layer.group_add(self.group_name, self.channel_name)

            # Set user as online and notify friends
            await self.update_user_online_status(True)
            print(f"User {self.user.id} set to online")
        else:
            print("Unauthenticated user tried to connect")
            await self.close()

    async def disconnect(self, close_code):
        print(f"Disconnect called with code {close_code}")
        if hasattr(self, 'user') and self.user.is_authenticated:
            print(f"User {self.user.id} disconnected")
            # First leave the group
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
            # Then update status and notify friends
            await self.update_user_online_status(False)
            print(f"User {self.user.id} set to offline")
        else:
            print("Disconnect called but no authenticated user found")

    async def update_user_online_status(self, is_on):
        print(f"Updating online status for user {self.user.id} to {'online' if is_on else 'offline'}")
        # Update user status in database
        user = await update_user_status(self.user.id, is_on)
        if user:
            # Get all friends to notify them about status change
            friends = await get_friends(user)
            print(f"Found {len(friends)} friends to notify")
            
            # Notify all friends about the status change
            for friendship in friends:
                friend_id = friendship.user_to.id if friendship.user_from.id == user.id else friendship.user_from.id
                print(f"Notifying friend {friend_id} about status change")
                message = {
                    'type': 'user_status',
                    'id': user.id,
                    'is_on': 0 if not is_on else 1
                }
                print(f"Sending message: {message}")
                await self.channel_layer.group_send(f'user_{friend_id}', message)
                print(f"Sent status update to friend {friend_id}")

    async def user_status(self, event):
        print(f"Sending status update: {event}")
        message = {
            'type': 'user_status',
            'id': event['id'],
            'is_on': event['is_on']
        }
        print(f"Sending WebSocket message: {message}")
        await self.send(text_data=json.dumps(message))
        print("Status update sent")

    async def receive(self, text_data):
        data = json.loads(text_data)
        print("Received WebSocket message:", data)  # Debug log
        
        if data['type'] == 'friends-add':
            await self.handle_friend_add(data)
        elif data['type'] == 'friend-accept':  # Changed from 'friends-accept'
            print("Handling friend accept request")  # Debug log
            await self.handle_friend_accept(data)
        elif data['type'] == 'friends-block':
            await self.handle_friend_block(data)
        elif data['type'] == 'friends-reject':
            await self.handle_friend_remove(data)
        elif data['type'] == 'friends-unblock':
            await self.handle_friend_unblock(data)
        elif data['type'] == 'friends-list':
            await self.get_friends_list(data)

    async def handle_friend_add(self, data):
        try:
            username = data.get('username')
            if not username:
                await self.send(text_data=json.dumps({
                    'status': 'error',
                    'message': 'Invalid user ID'
                }))
                return
            user = await get_userby_username(username)
            id_user = user.id
            friendship = await get_friendship_by_user(self.user, user)
            if not friendship:
                friendshipcreate = await sync_to_async(Friendship.objects.create)(
                    user_from=self.user,
                    user_to=user,
                    is_accepted=False
                )
                if not friendshipcreate:
                    await self.send(text_data=json.dumps({
                        'status': 'error',
                        'message': 'Friend request not sent'
                    }))
                    return
                # Notify the target user about the friend request
                await self.channel_layer.group_send(
                    f'user_{user.id}',
                    {
                        'type': 'friends-add',
                        'freindship_id': friendshipcreate.freindship_id,
                        'user': {
                            'username': self.user.username,
                            'image_field': self.user.image_field or ''
                        }
                    }
                )

                await self.send(text_data=json.dumps({
                    'status': 'success',
                    'message': 'Friend request sent',
                    'friendship_id': friendshipcreate.freindship_id,
                    'user': {
                        'username': self.user.username,
                        'image_field': self.user.image_field or ''
                    }
                }))
                await self.send(text_data=json.dumps({
                    'status': 'success',
                    'message': 'Friend request sent'
                }))
            else:
                await self.send(text_data=json.dumps({
                    'status': 'error',
                    'message': 'Friend request already sent'
                }))
                return
        except Exception as e:
            await self.send(text_data=json.dumps({
                'status': 'error',
                'message': str(e)
            }))

    async def handle_friend_accept(self, data):
        try:
            print("Received accept request:", data)  # Debug log
            freindship_id = data.get('freindship_id')
            if not freindship_id:
                print("No friendship_id provided")  # Debug log
                await self.send(text_data=json.dumps({
                    'type': 'friends_accept_error',
                    'status': 'error',
                    'message': 'Invalid friendship ID'
                }))
                return

            # Get the friendship
            friendship = await get_friendship(freindship_id)
            if not friendship:
                print("Friendship not found:", freindship_id)  # Debug log
                await self.send(text_data=json.dumps({
                    'type': 'friends_accept_error',
                    'status': 'error',
                    'message': 'Friend request not found'
                }))
                return

            # Get the users
            user_from = await get_user_from(friendship)
            user_to = await get_user_to(friendship)
            print(f"Processing request - from: {user_from.id}, to: {user_to.id}, current user: {self.user.id}")  # Debug log

            # Verify that the current user is the recipient
            if user_to.id != self.user.id:
                print(f"Authorization failed - user_to: {user_to.id}, current user: {self.user.id}")  # Debug log
                await self.send(text_data=json.dumps({
                    'type': 'friends_accept_error',
                    'status': 'error',
                    'message': 'Not authorized to accept this request'
                }))
                return

            # Accept the request
            print("Accepting friendship request")  # Debug log
            friendship.is_accepted = True
            await save_friendship(friendship)

            # Prepare user data for both users
            user_from_data = {
                'username': user_from.username,
                'image_field': str(user_from.image_field.url) if user_from.image_field else '',
                'id': user_from.id,
                'is_on': user_from.is_on
            }
            
            user_to_data = {
                'username': user_to.username,
                'image_field': str(user_to.image_field.url) if user_to.image_field else '',
                'id': user_to.id,
                'is_on': user_to.is_on
            }

            # Send friend list update to both users
            friend_data = {
                'freindship_id': friendship.freindship_id,
                'is_accepted': True,
                'user_from': user_from.id,
                'user_to': user_to.id,
                'user_is_logged_in': user_from.is_on
            }

            # Update sender's friend list
            await self.channel_layer.group_send(
                f'user_{user_from.id}',
                {
                    'type': 'friends_list_update',
                    'action': 'add',
                    'friend': {**friend_data, 'user': user_to_data}
                }
            )

            # Update recipient's friend list
            await self.channel_layer.group_send(
                f'user_{user_to.id}',
                {
                    'type': 'friends_list_update',
                    'action': 'add',
                    'friend': {**friend_data, 'user': user_from_data}
                }
            )

            # Only notify the sender about the acceptance
            await self.channel_layer.group_send(
                f'user_{user_from.id}',
                {
                    'type': 'friends_accept',
                    'freindship_id': friendship.freindship_id,
                    'user': user_to_data,
                    'user_from': user_from.id,
                    'user_to': user_to.id,
                    'user_is_logged_in': user_to.is_on
                }
            )

            # Send a simple success response to the person who accepted the request
            # await self.send(text_data=json.dumps({
            #     'type': 'friends_accept_success',
            #     'status': 'success',
            #     'message': 'Friend request accepted'
            # }))

        except Exception as e:
            print("Error in handle_friend_accept:", str(e))  # Debug log
            await self.send(text_data=json.dumps({
                'type': 'friends_accept_error',
                'status': 'error',
                'message': str(e)
            }))

    async def friends_list_update(self, event):
        """
        Handler for friends_list_update messages
        """
        await self.send(text_data=json.dumps({
            'type': 'friends_list_update',
            'action': event['action'],
            'friend': event['friend']
        }))

    async def handle_friend_block(self, data):
        try:
            # Extract data from the frontend structure
            freindship_id = data.get('freindship_id')
            user_data = data.get('user', {})
            user_from = data.get('user_from')
            user_to = data.get('user_to')
            user_is_logged_in = data.get('user_is_logged_in')

            if not freindship_id:
                await self.send(text_data=json.dumps({
                    'type': 'friends_block_error',
                    'status': 'error',
                    'message': 'Invalid friendship ID'
                }))
                return

            # Get friendship directly by ID
            friendship = await get_friendship(freindship_id)
            if not friendship:
                await self.send(text_data=json.dumps({
                    'type': 'friends_block_error',
                    'status': 'error',
                    'message': 'Friend request not found'
                }))
                return

            user_from_obj = await get_user_from(friendship)
            if not user_from_obj:
                await self.send(text_data=json.dumps({
                    'type': 'friends_block_error',
                    'status': 'error',
                    'message': 'User not found'
                }))
                return

            user_to_obj = await get_user_to(friendship)
            if not user_to_obj:
                await self.send(text_data=json.dumps({
                    'type': 'friends_block_error',
                    'status': 'error',
                    'message': 'User not found'
                }))
                return

            # Verify current user is part of the friendship
            same1 = await is_same(user_from_obj.id, self.user.id)
            same2 = await is_same(user_to_obj.id, self.user.id)
            same = same1 or same2

            if same:
                if same1:
                    friendship.u_one_is_blocked_u_two = True
                else:
                    friendship.u_two_is_blocked_u_one = True
                friendship.is_accepted = False
                await save_friendship(friendship)

                # Send success response with all the data frontend sent
                response_data = {
                    'type': 'friends_block_success',
                    'status': 'success',
                    'message': 'Friend request blocked',
                    'freindship_id': freindship_id,
                    'user': user_data,
                    'user_from': user_from,
                    'user_to': user_to,
                    'user_is_logged_in': user_is_logged_in
                }
                await self.send(text_data=json.dumps(response_data))

                # Also notify the other user about being blocked
                other_user_id = user_to if same1 else user_from
                await self.channel_layer.group_send(
                    f'user_{other_user_id}',
                    {
                        'type': 'friends_list_update',
                        'action': 'block',
                        'friend': response_data
                    }
                )
                return
            else:
                await self.send(text_data=json.dumps({
                    'type': 'friends_block_error',
                    'status': 'error',
                    'message': 'Not authorized to block this request'
                }))
                return

        except Exception as e:
            print("Error in block: ", str(e))
            await self.send(text_data=json.dumps({
                'type': 'friends_block_error',
                'status': 'error',
                'message': str(e)
            }))

    async def handle_friend_unblock(self, data):
        try:
            # Extract data from the frontend structure
            freindship_id = data.get('freindship_id')
            user_data = data.get('user', {})
            username = user_data.get('username')

            if not freindship_id:
                await self.send(text_data=json.dumps({
                    'type': 'friends_unblock_error',
                    'status': 'error',
                    'message': 'Invalid friendship ID'
                }))
                return

            # Get friendship directly by ID
            friendship = await get_friendship(freindship_id)
            if not friendship:
                await self.send(text_data=json.dumps({
                    'type': 'friends_unblock_error',
                    'status': 'error',
                    'message': 'Friend request not found'
                }))
                return

            user_from = await get_user_from(friendship)
            if not user_from:
                await self.send(text_data=json.dumps({
                    'type': 'friends_unblock_error',
                    'status': 'error',
                    'message': 'User not found'
                }))
                return

            user_to = await get_user_to(friendship)
            if not user_to:
                await self.send(text_data=json.dumps({
                    'type': 'friends_unblock_error',
                    'status': 'error',
                    'message': 'User not found'
                }))
                return

            # Verify current user is part of the friendship
            same1 = await is_same(user_from.id, self.user.id)
            same2 = await is_same(user_to.id, self.user.id)
            same = same1 or same2

            if same:
                if same1:
                    friendship.u_one_is_blocked_u_two = False
                else:
                    friendship.u_two_is_blocked_u_one = False
                await sync_to_async(friendship.delete)()

                # Send success response with the data frontend expects
                await self.send(text_data=json.dumps({
                    'type': 'friends_unblock_success',
                    'status': 'success',
                    'message': 'Friend request unblocked',
                    'freindship_id': freindship_id,
                    'user': user_data
                }))
                return
            else:
                await self.send(text_data=json.dumps({
                    'type': 'friends_unblock_error',
                    'status': 'error',
                    'message': 'Not authorized to unblock this request'
                }))
                return

        except Exception as e:
            print("Error in unblock: ", str(e))
            await self.send(text_data=json.dumps({
                'type': 'friends_unblock_error',
                'status': 'error',
                'message': str(e)
            }))

    async def get_friends_list(self, data):
        try:
            friends = await get_friends(self.user)
            friends_list = []
            for friendship in friends:
                same1 = await is_same(friendship.user_from.id, self.user.id)
                same2 = await is_same(friendship.user_to.id, self.user.id)
                same = same1 or same2
                if not same:
                    continue
                if same1:
                    friend = await get_user_from(friendship)
                else:
                    friend = await get_user_to(friendship)
                user = await get_user(friend.id)
                friends_list.append({
                    'freindship_id': friendship.freindship_id,
                    'username': friend.username,
                    'image_field': str(friend.image_field.url) if friend.image_field else '',
                    'id': friend.id,
                    'is_on': friend.is_on
                })
            await self.send(text_data=json.dumps({
                'type': 'friends_list',
                'friends': friends_list
            }))
        except Exception as e:
            print("Error in get_friends_list:", str(e))
            await self.send(text_data=json.dumps({
                'type': 'friends_list_error',
                'status': 'error',
                'message': str(e)
            }))
    async def friends_accept(self, event):
        """
        Handler for friends_accept messages from channel layer
        """
        print("Handling friends_accept message:", event)  # Debug log
        await self.send(text_data=json.dumps({
            'type': 'friends_accept',
            'freindship_id': event['freindship_id'],
            'user': event['user'],
            'user_from': event['user_from'],
            'user_to': event['user_to'],
            'user_is_logged_in': event['user_is_logged_in']
        }))

    async def friend_rejected(self, event):
        """
        Handler for friend-rejected event
        """
        message = event['message']
        await self.send(text_data=json.dumps(message))

    async def handle_friend_remove(self, data):
        try:
            freindship_id = data.get('freindship_id')
            if not freindship_id:
                await self.send(text_data=json.dumps({
                    'type': 'friends_remove_error',
                    'status': 'error',
                    'message': 'Invalid friendship ID'
                }))
                return
            friendship = await get_friendship(freindship_id)
            if not friendship:
                await self.send(text_data=json.dumps({
                    'type': 'friends_remove_error',
                    'status': 'error',
                    'message': 'Friend request not found'
                }))
                return
            user_from = await get_user_from(friendship)
            if not user_from:
                await self.send(text_data=json.dumps({
                    'type': 'friends_remove_error',
                    'status': 'error',
                    'message': 'User not found'
                }))
                return
            user_to = await get_user_to(friendship)
            if not user_to:
                await self.send(text_data=json.dumps({
                    'type': 'friends_remove_error',
                    'status': 'error',
                    'message': 'User not found'
                }))
                return
            if friendship:
                same1 = await is_same(user_to.id, self.user.id)
                same2 = await is_same(user_from.id, self.user.id)
                same = same1 or same2
                if same:
                    await sync_to_async(friendship.delete)()
                    # Send friend-rejected event to both users
                    await self.channel_layer.group_send(
                        f'user_{user_from.id}',
                        {
                            'type': 'friend_rejected',
                            'message': {
                                'type': 'friend-rejected',
                                'status': 'success',
                                'user_from': user_from.id,
                                'user_to': user_to.id
                            }
                        }
                    )
                    await self.channel_layer.group_send(
                        f'user_{user_to.id}',
                        {
                            'type': 'friend_rejected',
                            'message': {
                                'type': 'friend-rejected',
                                'status': 'success',
                                'user_from': user_from.id,
                                'user_to': user_to.id
                            }
                        }
                    )
                    await self.send(text_data=json.dumps({
                        'type': 'friends_remove_success',
                        'status': 'success',
                        'message': 'Friend request removed'
                    }))
                    return
        except Exception as e:
            print("Error: ", e)
            await self.send(text_data=json.dumps({
                'type': 'friends_remove_error',
                'status': 'error',
                'message': 'An error occurred'
            }))