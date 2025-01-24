import os
import django
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
# from channels.auth import AuthMiddlewareStack
from django_channels_jwt_auth_middleware.auth import JWTAuthMiddlewareStack
from django.core.asgi import get_asgi_application
import  chat.routing 
import friend.routing
import double_game.routing
# from tournament.routing import websocket_urlpatterns
from friend.routing import websocket_urlpatterns
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
import jwt
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'back_end.settings')
django.setup()
from back_end.routing import websocket_urlpatterns as game_websocket_urlpatterns
from turn.routing import websocket_urlpatterns as turn_websocket_urlpatterns

# class UserStatusConsumer(JWTAuthentication):
    
User = get_user_model()

@database_sync_to_async
def get_user_from_jwt_token(token_key):
    try:
        if not token_key:
            print("No token provided")
            return AnonymousUser()
        payload = jwt.decode(token_key, settings.SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get('user_id')
        user = User.objects.get(id=user_id)
        return user
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, User.DoesNotExist) as e:
        return AnonymousUser()

class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        token_key = None
        headers = dict(scope['headers'])
        print("Headers received:", headers)
        
        # First try to get token from cookies
        cookie_header = headers.get(b'cookie', b'').decode()
        if cookie_header:
            try:
                cookies = dict(cookie.split('=') for cookie in cookie_header.split('; '))
                token_key = cookies.get('access_token')  # Using the AUTH_COOKIE name from SIMPLE_JWT settings
                if token_key:
                    print(f"Found token in cookies: {token_key[:50]}...")
            except Exception as e:
                print(f"Error parsing cookies: {str(e)}")
        
        # If no token in cookies, try Authorization header
        if not token_key:
            auth_header = headers.get(b'authorization', b'').decode()
            if auth_header and auth_header.startswith('Bearer '):
                token_key = auth_header.split(' ')[1]
                print(f"Found token in Authorization header: {token_key[:50]}...")
        
        # Finally try query string as last resort
        if not token_key and scope['query_string']:
            try:
                query_string = dict((x.split('=') for x in scope['query_string'].decode().split('&')))
                token_key = query_string.get('token')
                if token_key:
                    print(f"Found token in query string: {token_key[:50]}...")
            except Exception as e:
                print(f"Error parsing query string: {str(e)}")

        user = await get_user_from_jwt_token(token_key)
        print(f"Setting user in scope: {user} (authenticated: {user.is_authenticated})")
        scope['user'] = user
        return await super().__call__(scope, receive, send)
   
application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": JWTAuthMiddleware(
        URLRouter(
            websocket_urlpatterns +  # assuming it's a list or iterable
            chat.routing.websocket_urlpatterns +
            friend.routing.websocket_urlpatterns +
            double_game.routing.websocket_urlpatterns +
            game_websocket_urlpatterns +
            turn_websocket_urlpatterns
        )
    ),
})