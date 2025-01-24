from django.urls import path
from .views import MatchListCreate, fetch_match_history

urlpatterns = [
    path('matches/', MatchListCreate.as_view(), name='match-list-create'),
    path('fetch_history/<str:username>/', fetch_match_history, name='fetch_match_history'),
]