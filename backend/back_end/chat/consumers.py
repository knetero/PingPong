import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from authapp.models import User
from .models import Messages
from friend.models import Notification

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f"chat_{self.room_name}"

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )
        self.accept()

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        chat_id = text_data_json["chat_id"]
        message = text_data_json["message"]
        send = text_data_json["send"]
        receive = text_data_json["receive"]
        timestamp = text_data_json["timestamp"]


        try:
            receive_obj = User.objects.get(username=receive)
        except User.DoesNotExist:
            return

        try:
            send_obj = User.objects.get(username=send)
        except User.DoesNotExist:
            return

        if len(message) > 512:
            self.send(text_data=json.dumps({
                "error": "Message is too long, must be less than 512 characters."
            }))
            return
        Messages.objects.create(
            user_one=send_obj, user_two=receive_obj,
            message_content=message, message_date=timestamp
        )
        receiver_group = f"chat_{receive_obj.id}"
        async_to_sync(self.channel_layer.group_add)(
            receiver_group,
            self.channel_name 
        )
        async_to_sync(self.channel_layer.group_send)(
            receiver_group,
            {
                "type": "chat_message",
                "message": message,
                "send": send,
                "receive": receive,
                "timestamp": timestamp,
                "chat_id": chat_id
            }
        )

    def chat_message(self, event):

        chat_id = event["chat_id"]
        message = event["message"]
        send = event["send"]
        receive = event["receive"]
        timestamp = event["timestamp"]

        self.send(text_data=json.dumps({
            "message": message,
            "send": send,
            "receive": receive,
            "timestamp": timestamp,
            "chat_id": chat_id
        }))