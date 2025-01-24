from rest_framework import serializers
from .models import User
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class UserSerializer(serializers.ModelSerializer):
    class Meta :
        model = User
        fields=['id','username','password', 'email', 'is_2fa', '_2fa_code', 'fullname', 'image_field', 'redirect_to']
        extra_kwargs = {
            'password':{'write_only':True} 
        }
    #errors should be handled in front : field empty or password and password confirm doesnt match
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        instance = self.Meta.model(**validated_data)
        if password is not None :
            instance.set_password(password)
        else :
            raise serializers.ValidationError("Passwords is empty.")
        instance.save()
        return(instance)
    
    def get_image_url(self, obj):
        return obj.image_field.url if obj.image_field else None