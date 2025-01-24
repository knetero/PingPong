from django.db import models
from authapp.models import User

class Friendship(models.Model):
    freindship_id = models.AutoField(primary_key=True)
    user_from = models.ForeignKey(
        "authapp.User", models.DO_NOTHING, db_column="user_from"
    )
    user_to = models.ForeignKey(
        "authapp.User",
        models.DO_NOTHING,
        db_column="user_to",
        related_name="user_to_set",
    )
    is_accepted = models.BooleanField(default=False)
    u_one_is_blocked_u_two = models.BooleanField(default=False)
    u_two_is_blocked_u_one = models.BooleanField(default=False)
    user_is_logged_in = models.IntegerField(default=0)
    just_test = models.IntegerField(default=0)

    class Meta:
        db_table = "Friendship"
        unique_together = (("user_from", "user_to"),)


class Notification(models.Model):
    notification_id = models.AutoField(primary_key=True)
    user = models.ForeignKey("authapp.User", models.DO_NOTHING, db_column="user")
    message = models.CharField(max_length=200)
    is_tourn_notif = models.BooleanField(default=False)
    notification_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "Notification"
        ordering = ["-notification_date"]
