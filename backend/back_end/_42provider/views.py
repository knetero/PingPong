import requests
from django.shortcuts import redirect
from django.conf import settings
from django.http import JsonResponse
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django.conf import settings
from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
import jwt
from authapp.models import User
import random
import string
from django.shortcuts import redirect, render
from django.http import JsonResponse
from authapp.serializers import UserSerializer
from authapp.authenticate import CustomAuthentication
from django.http import HttpResponseRedirect
import requests
from django.core.files.base import ContentFile
from authapp.views import _42_generated_password
from django.core.mail import send_mail
from rest_framework_simplejwt.tokens import RefreshToken
from friend.models import Friendship

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class login (APIView):
    permission_classes=[AllowAny]
    def get(self, request):
        authorization_url = f"https://api.intra.42.fr/oauth/authorize?client_id={settings.FORTY_TWO_CLIENT_ID}&redirect_uri={settings.FORTY_TWO_REDIRECT_URI}&response_type=code&"f"scope=public projects&"f"prompt=consent"
        return redirect(authorization_url)

def getbot(username):
    try:
        bot = User.objects.get(username=username)
    except User.DoesNotExist:
        bot = None
    except Exception as e:
        bot = None
    return bot

class callback(APIView):
    permission_classes=[AllowAny]
    def get(self, request):
        code = request.GET.get('code')
        if not code:
            return JsonResponse({'message': 'No code provided', "data":None}, status=400)
        # Exchange code for access token
        to_page = "https://10.13.7.8/Dashboard"
        resp = HttpResponseRedirect(to_page)
        token_url = "https://api.intra.42.fr/oauth/token"
        response = requests.post(settings.FORTY_TWO_ACCESS_TOKEN_URL, data={
            'grant_type': 'authorization_code',
            'client_id': settings.FORTY_TWO_CLIENT_ID,
            'client_secret': settings.FORTY_TWO_CLIENT_SECRET,
            'redirect_uri': settings.FORTY_TWO_REDIRECT_URI,
            'code': code,
        })

        if response.status_code != 200:
            return JsonResponse({'message': 'Failed to obtain token', "data" :response.json() })
        token_data = response.json()
        access_token = token_data.get('access_token')
        user_response = requests.get(settings.FORTY_TWO_USER_PROFILE_URL, headers={'Authorization': f'Bearer {access_token}'})
        if user_response.status_code != 200:
            return JsonResponse({'message': 'Failed to fetch user info', "data": None}, status=400)
        user_data = user_response.json()
        existeduser = User.objects.filter(email = user_data['email']).first()
        otheruser = User.objects.filter(username = user_data['login']).first()
        if otheruser  is not None and otheruser.email != user_data['email']:
            to_page = "https://10.13.7.8/login"
            resp = HttpResponseRedirect(to_page)
            return resp
        if existeduser is not None:
            authenticate(email = existeduser.email, password = existeduser.password)
            data = get_tokens_for_user(existeduser)
            userserialize = UserSerializer(existeduser)
            if existeduser.is_2fa == True and existeduser.redirect_to == False:
                to_page = "https://10.13.7.8/authLogin"
            resp = HttpResponseRedirect(to_page)
            if data["access"] :
                resp.set_cookie(
                    key = settings.SIMPLE_JWT['AUTH_COOKIE'],
                    value = data["access"],
                    expires = settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
                    secure = settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                    httponly = settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                    samesite = settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
                    path='/',
                    max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds())
                resp.data = {"message" : "Login successfully","data":{"user": userserialize.data , "tokens":data }}
            serializer = UserSerializer(instance = existeduser)
            resp.data = {"message": "user exist in database and now he is logged in succefully", "data": serializer.data }
            return resp
        else:
            image_response = requests.get(user_data['image']['link'])
            user = User.objects.create(username=user_data['login'], email=user_data['email'], password="")
            user.image_field.save(user_data['login'], ContentFile(image_response.content))
            user.save()
            code = "".join(map(str, random.sample(range(0, 10), 10)))
            user.set_password(code)
            user.save() 
            send_mail("PONGS APPLICATION PASSWORD","This is your pong website password  :  "+code, settings.EMAIL_HOST_USER, [user_data['email'],], fail_silently=False,)
            authenticate(email = user.email, password = user.password)
            data = get_tokens_for_user(user)
            if data["access"] :
                resp.set_cookie(
                    key = settings.SIMPLE_JWT['AUTH_COOKIE'],
                    value = data["access"],
                    expires = settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
                    secure = settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                    httponly = settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                    samesite = settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
                    path='/',
                    max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds())
            serializer = UserSerializer(instance=user)
            bot = getbot('bot')
            if not bot:
                bot = UserSerializer(data={"username": "bot", "email": "bot1234@gmail.com", "password": "bot12345" })
                try:
                    if bot.is_valid():
                        bot.save()
                        bot = getbot('bot')
                        user_id = User.objects.get(id=serializer.data['id'])
                        bot_id = User.objects.get(id=bot.id)
                        friendbot= Friendship.objects.create(user_from=user_id , user_to=bot_id,is_accepted=True ,u_one_is_blocked_u_two=False, u_two_is_blocked_u_one=False)
                        friendbot.save()
                except Exception as e:
                    print("bot error", e)
            else:
                try:
                    user_id = User.objects.get(id=serializer.data['id'])
                    bot_id = User.objects.get(id=bot.id)
                    friendbot= Friendship.objects.create(user_from=user_id , user_to=bot_id,is_accepted=True ,u_one_is_blocked_u_two=False, u_two_is_blocked_u_one=False)
                    friendbot.save()
                except Exception as e:
                    print("bot error", e)
            resp.data ={"message": "user added succefully", "data": serializer.data}
            return resp

class profile(APIView):
    permission_classes=[IsAuthenticated]
    def get(self, request):
        # access_token = request.COOKIES.get('intra_token') 
        # # print("access ____" + access_token)
        # if access_token is None:
        #     return JsonResponse({'error': 'Failed to fetch user info'}, status=400)
        # else :
            token = request.COOKIES.get('intra_token')
            user_response = requests.get(settings.FORTY_TWO_USER_PROFILE_URL, headers={'Authorization': f'Bearer {token}'})
            user_data = user_response.json()
            return JsonResponse(user_data)
        
        
class logout_intra(APIView):
    permission_classes=[AllowAny]
    def post (self, request):
        access_token = request.COOKIES.get('intra_token')
        user_response = requests.get(settings.FORTY_TWO_USER_PROFILE_URL, headers={'Authorization': f'Bearer {access_token}'})
        if access_token is None:
            return JsonResponse({'error': 'Failed to get access token'}, status=400)
        else:
            response = Response()
            response.delete_cookie('intra_token')
            response.data = {
                'message': 'Logged out successfully'
            }
            request.session.flush()
            return response
        
