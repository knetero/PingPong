from django.urls import path
from . import views
from rest_framework_simplejwt import views as jwt_views

urlpatterns = [
    path('available/', views.GetAvailableTournamentsView.as_view(), name='get_available_tournaments'),
    path('tournaments/<str:username>/', views.GetTournamentsByPlayerView.as_view(), name='get_tournaments_by_player'),
    path('matches/<str:username>/', views.GetMatchByPlayerView.as_view(), name='get_match_by_player'),
    # get the bracket updates fron the redis cache using the spicific room_name
    path('bracket/<str:room_name>/', views.GetBracketView.as_view(), name='get_bracket'),
]