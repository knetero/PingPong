from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'wss/user_data/$', consumers.FriendRequestConsumer.as_asgi()),
    re_path(r'wss/user_status/$', consumers.UserStatusConsumer.as_asgi()),
]
