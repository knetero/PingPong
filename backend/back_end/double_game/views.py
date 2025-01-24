from rest_framework import generics
from .models import DoubleGameMatch
from .serializers import MatchSerializer
from django.http import JsonResponse
from django.shortcuts import get_object_or_404

class MatchListCreate(generics.ListCreateAPIView):
    queryset = DoubleGameMatch.objects.all()
    serializer_class = MatchSerializer

def fetch_match_history(request, username):
    matches = DoubleGameMatch.objects.filter(player1=username) | DoubleGameMatch.objects.filter(player2=username)
    match_list = list(matches.values('id', 'player1', 'player2', 'player1_score', 'player2_score', 'winner', 'date_time'))
    return JsonResponse(match_list, safe=False)