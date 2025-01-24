from rest_framework import serializers
from .models import DoubleGameMatch

class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoubleGameMatch
        fields = '__all__'