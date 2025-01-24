# from allauth.socialaccount.providers.oauth2.provider import OAuth2Provider

# class Intra42Provider(OAuth2Provider):
#     id = 'intra42'
#     name = 'Intra42'
#     package = 'intra42_provider'

#     def extract_uid(self, data):
#         return str(data['id'])

#     def extract_common_fields(self, data):
#         return dict(username=data.get('login'), email=data.get('email'))

# provider_classes = [Intra42Provider]
