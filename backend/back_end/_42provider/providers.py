from allauth.socialaccount.providers.oauth2.provider import OAuth2Provider
from authapp.models import User
from django.conf import settings

class Intra42Provider(OAuth2Provider):
