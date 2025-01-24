
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
from rest_framework import status
from .serializers import UserSerializer
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from authapp.models import User
from django.shortcuts import redirect, render
from django.http import JsonResponse
from django.core.mail import send_mail
import random
import string

class Send2FAcode(APIView):
    permission_classes = [IsAuthenticated]
    def get (self , request):
        code = "".join(map(str, random.sample(range(0, 10), 6)))
        send_mail("2FA AUTHENTICATION", " THE 2 FACTORS AUTHENTICATION  CODE IS :  "+code, settings.EMAIL_HOST_USER, [request.user], fail_silently=False,)
        useremail = request.user
        user = User.objects.get(email=useremail)
        user._2fa_code = code
        user.save()
        if user is None:
            return Response("user null")
        return  Response("")


class CodeVerification(APIView):
    permission_classes = [IsAuthenticated]
    def post (self , request):
        user = request.user
        if user._2fa_code == request.data.get('code') and len(request.data.get('code')) == 6:
            if user.is_2fa == False :
                user.is_2fa = True
                user.redirect_to = True
                user.save()
            user._2fa_code = ""
            user.save()
            return Response({"message":"2fa is done"})
            printf("2fa is done ***********", user.redirect_to)
        else:
            return Response({"message":"2fa code not correct"})


class _2fa_verification(APIView):
    permission_classes = [AllowAny]
    def post (self , request):
        user = request.user
        if user._2fa_code == request.data.get('code') and len(request.data.get('code')) == 6:
            user._2fa_code = ""
            user.redirect_to = True
            user.save()
            userserializer = UserSerializer(user)
            return Response({"message":"2fa is done", "data": userserializer.data})
        else:
            return Response({"message":"2fa code not correct", "data":None})
        
        
class _42_generated_password(APIView):
    permission_classes = [IsAuthenticated]
    def get (self , request):
        code = "".join(map(str, random.sample(range(0, 10), 10)))
        user.set_password(code)
        user.save() 
        send_mail("PONGS APPLICATION PASSWORD","This is your pong website password  :  "+code, settings.EMAIL_HOST_USER, [request.user,], fail_silently=False,)
        useremail = request.user
        user = User.objects.get(email=useremail)
        if user is None:
            return Response({"code":code})
        return  Response({"message": "password generated succefully"})