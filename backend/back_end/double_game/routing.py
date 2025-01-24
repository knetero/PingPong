from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'wss/game/invite/$', consumers.GameInvitationConsumer.as_asgi()),
]
