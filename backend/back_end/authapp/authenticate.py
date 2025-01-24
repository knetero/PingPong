from rest_framework_simplejwt.authentication import JWTAuthentication
from django.conf import settings
from django.http import JsonResponse
from rest_framework.authentication import CSRFCheck
from rest_framework import exceptions
from authapp.models import User
from rest_framework.response import Response
import requests
def enforce_csrf(request):
    check = CSRFCheck()
    check.process_request(request)
    reason = check.process_view(request, None, (), {})
    if reason:
        raise exceptions.PermissionDenied('CSRF Failed: %s' % reason)

class CustomAuthentication(JWTAuthentication):
   def authenticate(self, request):
        raw_token = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE'])
        if raw_token is None :
            return None
        else:
            url = "https://api.intra.42.fr/v2/me"
            headers = {
                "Authorization": f"Bearer {raw_token}",  # Pass the token in the Authorization header
            }
            response = requests.get(url, headers=headers)
            data = response.json()
        if response.status_code == 200 :
            user_data = User.objects.get(email = data['email'])
            print(user_data)
            return user_data, raw_token
        else:
            validated_token = self.get_validated_token(raw_token)
            print ("validated_token " ,validated_token )
            user = (self.get_user(validated_token))
            print ("self.get_user(validated_token) " ,user)
            return user, validated_token

# from rest_framework_simplejwt.authentication import JWTAuthentication
# from django.conf import settings
# from rest_framework.exceptions import AuthenticationFailed
# import requests
# class CustomAuthentication(JWTAuthentication):
#     def authenticate(self, request):
#         # Attempt to retrieve the Intra token from cookies
#         intra_token = request.COOKIES.get('oauth_token')

#         # If no token is found, raise authentication failure
#         if intra_token is None:
#             raise AuthenticationFailed("No authentication credentials were provided.")

#         # Verify the Intra token with the Intra API
#         user_info = self.verify_intra(intra_token)
#         # user_info = {
#         #     'password': ''
#         # }
#         print(user_info)
#         user = User.objects.create_user(
#         username=user_info['login'],
#         password='aucunpass',
#         email="ewoekssk"+user_info['email'], # Optional
#         )
#         # User = get_user_model()
#         # user, created = User.objects.get_or_create(username=user_info['username'])  # Adjust based on your user model
#         # Return the user information and the Intra token
#         return  intra_token.json()

#     def verify_intra(self, token):
#         """Verify the Intra token with the Intra API to ensure it's valid."""
#         user_info_url = settings.FORTY_TWO_USER_PROFILE_URL  # URL to fetch user profile
#         headers = {
#             'Authorization': f'Bearer {token}',
#         }
        
#         # Send a GET request to the Intra API to verify the token
#         response = requests.get(user_info_url, headers=headers)
        
#         # Check the response status
#         if response.status_code == 200:
#             return response.json()  # Return user info if the token is valid
#         else:
#             raise AuthenticationFailed("Intra token is invalid.")