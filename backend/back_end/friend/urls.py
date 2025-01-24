from django.urls import path
from .views import (FriendsView,
                    UserSearchView,
                    RemoveFriendshipView,
                    AcceptFriendshipView,
                    AddFriendshipView,
                    BlockFriendshipView,
                    UnblockFriendshipView,
                    BlockedFriendsView,
                    sendchat,
                  #   NotificationsView,
                  #   NotificationDetailView,
                    FriendsRequestsView,

                   )

urlpatterns = [

   path('friends', FriendsView.as_view(), name='friends'),
#    path('user-search', UserSearchView.as_view(), name='user-search'),
   path('friends-remove/', RemoveFriendshipView.as_view(), name="friends-remove"),
   path('friends-accept/', AcceptFriendshipView.as_view(), name="friends-accept"),
   path('friends-add/', AddFriendshipView.as_view(), name="friends-add"),
   path('friends-block/', BlockFriendshipView.as_view(), name="friends-block"),
   path('friends-unblock/', UnblockFriendshipView.as_view(), name="friends-unblock"),
   path('blocked-friends/', BlockedFriendsView.as_view(), name="friends-unblock"),
   # path('notifications/', NotificationsView.as_view(), name="notifications"),
   # path('notification-delete/<int:notification_id>', NotificationDetailView.as_view(), name='notification-delete'),
   path('friend-request/', FriendsRequestsView.as_view(), name='friend-request'),
   path('sendchat/', sendchat.as_view(), name='sendchat'),
]
