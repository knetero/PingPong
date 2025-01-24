from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application
from django.urls import path
from turn import consumers

websocket_urlpatterns = [
    path("wss/tournament/<str:room_name>/", consumers.PingPongConsumer.as_asgi()),
    path("wss/tournament/<str:room_name>/<str:tournament_room_name>/", consumers.PingPongConsumer.as_asgi()),
]

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})