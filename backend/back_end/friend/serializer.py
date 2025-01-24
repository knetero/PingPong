from rest_framework import serializers
from authapp.models import User
from .models import Friendship, Notification
from django.db.models import F, Q
from drf_spectacular.utils import extend_schema_field

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'is_on','image_field')

class FriendshipSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    is_user_from = serializers.SerializerMethodField()
    blocked = serializers.SerializerMethodField()
    class Meta:
        model = Friendship
        fields = ('user', 'freindship_id', 'is_accepted', 'blocked', 'is_user_from')

    @extend_schema_field(UserSerializer())
    def get_user(self, obj) -> list:
        user_id = obj.user_from.id if obj.user_from.id != obj.user_is_logged_in else obj.user_to.id
        user_data = User.objects.get(id=user_id)
        serializer = UserSerializer(user_data)
        return serializer.data

    @extend_schema_field(serializers.BooleanField())
    def get_blocked(self, obj) -> bool:
        if obj.user_from.id == self.context['id']:
            blocked = obj.u_one_is_blocked_u_two
        else:
            blocked = obj.u_two_is_blocked_u_one
        return blocked

    @extend_schema_field(serializers.BooleanField())
    def get_is_user_from(self, obj) -> bool:
        return obj.user_from.id == self.context['id']

class FriendsSerializer(serializers.ModelSerializer):
    friends = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ('id', 'friends')

    @extend_schema_field(serializers.ListField(child=FriendshipSerializer()))
    def get_friends(self, obj) -> list:
        friends_data = Friendship.objects.filter((Q(user_from = obj)| Q(user_to= obj)) &
                                                 Q(u_one_is_blocked_u_two = False) &
                                                 Q(u_two_is_blocked_u_one = False))
        serializer = FriendshipSerializer(friends_data, many=True, context = {'id': obj.id})
        return serializer.data

class BlockedFriendshipSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    blocked = serializers.SerializerMethodField()
    is_user_from = serializers.SerializerMethodField()

    class Meta:
        model = Friendship
        fields = ('user', 'is_accepted', 'blocked', 'is_user_from')

    @extend_schema_field(UserSerializer())
    def get_user(self, obj) -> dict:
        user_id = obj.user_to.id
        user_data = User.objects.get(id=user_id)
        serializer = UserSerializer(user_data)
        return serializer.data

    @extend_schema_field(serializers.BooleanField())
    def get_blocked(self, obj) -> bool:
        if obj.user_from.id == self.context['id']:
            blocked = obj.u_one_is_blocked_u_two
        else:
            blocked = obj.u_two_is_blocked_u_one
        return blocked

    @extend_schema_field(serializers.BooleanField())
    def get_is_user_from(self, obj) -> bool:
        return obj.user_from.id == self.context['id']

class BlockedFriendsSerializer(serializers.ModelSerializer):
    friends = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ('id', 'username', 'friends')

    @extend_schema_field(serializers.ListField(child=BlockedFriendshipSerializer()))
    def get_friends(self, obj) -> list:
        friends_data = Friendship.objects.filter(Q(user_from = obj)| Q(user_to= obj))
        serializer = BlockedFriendshipSerializer(friends_data, many=True,
                                                 context = {'id': obj.id})
        return serializer.data


# class NotificationSerializer(serializers.ModelSerializer):
#     count = serializers.SerializerMethodField()
#     class Meta:
#         model = Notification
#         fields = '__all__'

#     @extend_schema_field(serializers.IntegerField())
#     def get_count(self, obj) -> int:
#         return Notification.objects.filter(user = self.context.get('user')).count()

# class NotificationUserSerializer(serializers.ModelSerializer):
#     notifications = serializers.SerializerMethodField()
#     class Meta:
#         model = User
#         fields = ('id', 'username', 'notifications')

#     @extend_schema_field(serializers.ListField(child=NotificationSerializer()))
#     def get_notifications(self, obj) -> list:
#         notifications_data = Notification.objects.filter(user = obj)
#         serializer = NotificationSerializer(notifications_data, many = True, context={'user': obj})
#         return serializer.data

class FriendsRequestSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    class Meta:
        model = Friendship
        fields = ('user', 'freindship_id', 'is_accepted', 'user_from', 'user_to', 'user_is_logged_in')

    @extend_schema_field(UserSerializer())
    def get_user(self, obj) -> dict:
        user_id = obj.user_from.id
        print("user_id********     ", user_id)
        user_data = User.objects.get(id=user_id)
        serializer = UserSerializer(user_data)
        return serializer.data

class FSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    class Meta:
        model = Friendship
        fields = ('user', 'freindship_id', 'is_accepted', 'user_from', 'user_to', 'user_is_logged_in')

    @extend_schema_field(UserSerializer())
    def get_user(self, obj) -> dict:
        logged_in_user_id = self.context.get('user_is_logged_in')
        # Return the other user's data (not the logged-in user)
        user_id = obj.user_to.id if obj.user_from.id == logged_in_user_id else obj.user_from.id
        print("user_id********     ", user_id)
        user_data = User.objects.get(id=user_id)
        serializer = UserSerializer(user_data)
        return serializer.data

class BSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    
    class Meta:
        model = Friendship
        fields = ('user', 'freindship_id', 'is_accepted', 'user_from', 'user_to', 'user_is_logged_in')

    @extend_schema_field(UserSerializer())
    def get_user(self, obj) -> dict:
        if not hasattr(obj, 'user_is_logged_in'):
            return None
            
        logged_in_user_id = obj.user_is_logged_in
        # Get the other user in the friendship
        other_user = obj.user_to if obj.user_from.id == logged_in_user_id else obj.user_from
        serializer = UserSerializer(other_user)
        return serializer.data