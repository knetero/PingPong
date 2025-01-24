from django.shortcuts import render
from .models import Messages
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializer import UserMessageSerializer


# Create your views here.

class MessagesView(APIView):
    # authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = UserMessageSerializer

    def get(self, request):
        user = request.user
        serializer = self.serializer_class(instance=user)
        return Response(serializer.data)


 