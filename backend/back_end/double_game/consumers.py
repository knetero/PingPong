import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

class GameInvitationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        if self.scope["user"].is_authenticated:
            print(f"User {self.scope['user'].id} connected")
            self.user = self.scope["user"]
            await self.accept()

            # Create a unique room for the user
            self.room_name = f"game_invite_{self.user.id}"
            await self.channel_layer.group_add(self.room_name, self.channel_name)
            print(f"User {self.user.id} joined game invite room")
        else:
            print("Unauthenticated user tried to connect")
            await self.close()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_name'):
            await self.channel_layer.group_discard(self.room_name, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')

            if message_type == 'game_invitation':
                # Get receiver's user ID from username
                receiver_username = data.get('receiver_username')
                receiver = await self.get_user_by_username(receiver_username)
                
                if receiver:
                    print(f" Sending game invitation to {receiver.username}")
                    print(f" Sender username: {data.get('sender_username')}")
                    print(f" Sender image: {str(self.scope['user'].image_field.url) if self.scope['user'].image_field else ''}")
                    print(f" Map: {data.get('map')}")
                    
                    # Send game invitation to receiver
                    receiver_room = f"game_invite_{receiver.id}"
                    print(f"🎮 Sending invitation to room: {receiver_room}")
                    
                    message = {
                        'type': 'game_invitation_received',
                        'sender_username': data.get('sender_username'),
                        'sender_image': str(self.scope["user"].image_field.url) if self.scope["user"].image_field else '',
                        'map': data.get('map'),
                        'friendship_id': data.get('friendship_id'),
                        'timestamp': data.get('timestamp')
                    }
                    print(f"🎮 Sending message: {message}")
                    await self.channel_layer.group_send(receiver_room, message)
            
            elif message_type == 'accept_invitation':
                # Handle invitation acceptance
                sender_username = data.get('player1')  # player1 is the original sender
                sender = await self.get_user_by_username(sender_username)
                
                if sender:
                    sender_room = f"game_invite_{sender.id}"
                    print(f"🎮 Sending acceptance to room {sender_room} with data:", data)
                    message = {
                        'type': 'invitation_accepted',
                        'player1': data.get('player1'),  # Original sender
                        'player2': data.get('player2'),  # Receiver who accepted
                        'map': data.get('map'),
                        'friendship_id': data.get('friendship_id')
                    }
                    print(f"🎮 Acceptance message:", message)
                    await self.channel_layer.group_send(sender_room, message)
            
            elif message_type == 'decline_invitation':
                # Handle invitation decline
                sender_username = data.get('sender')
                sender = await self.get_user_by_username(sender_username)
                
                if sender:
                    sender_room = f"game_invite_{sender.id}"
                    await self.channel_layer.group_send(
                        sender_room,
                        {
                            'type': 'invitation_declined',
                            'decliner': self.user.username,
                            'friendship_id': data.get('friendship_id')
                        }
                    )

        except json.JSONDecodeError:
            pass
        except Exception as e:
            print(f"Error in receive: {str(e)}")

    async def game_invitation_received(self, event):
        """Send game invitation to the receiver"""
        await self.send(text_data=json.dumps(event))

    async def invitation_accepted(self, event):
        """Send invitation acceptance to the original sender"""
        await self.send(text_data=json.dumps(event))

    async def invitation_declined(self, event):
        """Send invitation decline to the original sender"""
        await self.send(text_data=json.dumps(event))

    @database_sync_to_async
    def get_user_by_username(self, username):
        User = get_user_model()
        try:
            return User.objects.get(username=username)
        except User.DoesNotExist:
            return None
