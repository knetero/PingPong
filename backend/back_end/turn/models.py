from django.db import models

class Match(models.Model):
    player1_username = models.CharField(max_length=150)
    player2_username = models.CharField(max_length=150)
    player1_score = models.IntegerField()
    player2_score = models.IntegerField()
    winner = models.CharField(max_length=150)
    date = models.DateTimeField()

    def __str__(self):
        return f"{self.player1_username} vs {self.player2_username} on {self.date}"

class Tournament(models.Model):
    winner = models.CharField(max_length=150)
    date = models.DateTimeField()
    matches = models.JSONField()

    def __str__(self):
        return f"Tournament on {self.date} won by {self.winner}"


class ActiveTournament(models.Model):
    room_name = models.CharField(max_length=255, unique=True)
    is_tournament = models.BooleanField(default=False)
    end_tournament = models.BooleanField(default=False)
    num_players = models.IntegerField(default=0)
    players = models.JSONField(default=dict)  # Store players as JSON data

    def __str__(self):
        return f'Tournament {self.room_name}'