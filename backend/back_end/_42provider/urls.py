from django.urls import path
from rest_framework_simplejwt import views as jwt_views
from . import views
urlpatterns = [
    path('login/', views.login.as_view(), name='login'),
    path('user_data/', views.callback.as_view(), name='user_data'),
    path('profile/', views.profile.as_view(), name='profile'),
    path('logout/', views.logout_intra.as_view(), name='logout'),
]