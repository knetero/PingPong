from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Tournament, Match, ActiveTournament
import redis
import json
from rest_framework.permissions import IsAuthenticated

class GetBracketView(APIView):
    permission_classes = [IsAuthenticated]  # Modify as per your needs

    def get(self, request, room_name):
        r = redis.Redis(host='redis', port=6379, db=0)
        bracket = r.get(room_name)

        if bracket:
            bracket = bracket.decode('utf-8')
            json_object = json.loads(bracket)
            return Response(json_object)
        else:
            return Response({}, status=404)  # Return empty dict if no bracket found


# Get Tournaments by Player
class GetTournamentsByPlayerView(APIView):
    permission_classes = [IsAuthenticated]  # Modify as per your needs

    def get(self, request, username):
        tournaments = Tournament.objects.all()
        data = []

        for tournament in tournaments:
            matches = tournament.matches  # Already a Python dict

            # Iterate over match entries only (exclude ball entries)
            for key, match in matches.items():
                if isinstance(match, dict) and ('p1_username' in match or 'p2_username' in match):
                    if match.get('p1_username') == username or match.get('p2_username') == username:
                        data.append({
                            'winner': tournament.winner,
                            'date': tournament.date,
                            'matches': matches,
                        })
                        break  # Avoid duplicate entries
        
        return Response(data)


# Get Match by Player
class GetMatchByPlayerView(APIView):
    permission_classes = [IsAuthenticated]  # Modify as per your needs

    def get(self, request, username):
        matches = Match.objects.filter(player1_username=username) | Match.objects.filter(player2_username=username)
        matches = matches.distinct()

        data = []
        for match in matches:
            data.append({
                'player1_username': match.player1_username,
                'player2_username': match.player2_username,
                'player1_score': match.player1_score,
                'player2_score': match.player2_score,
                'winner': match.winner,
                'date': match.date,
            })

        return Response(data)


# Get Available Tournaments
class GetAvailableTournamentsView(APIView):
    permission_classes = [IsAuthenticated]  # Modify as per your needs

    def get(self, request):
        tournaments = ActiveTournament.objects.filter(
            is_tournament=True,
            end_tournament=False,
            num_players__lt=4
        )

        data = []
        for tournament in tournaments:
            players = tournament.players
            player_usernames = [player['username'] for player in players.values() if player.get('full')]
            data.append({
                'room_name': tournament.room_name,
                'num_players': tournament.num_players,
                'players': player_usernames,
            })

        return Response(data)