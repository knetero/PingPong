from django.db import models

class Messages(models.Model):
    messages_id = models.AutoField(primary_key=True)
    user_one = models.ForeignKey('authapp.User', models.DO_NOTHING)
    user_two = models.ForeignKey('authapp.User', models.DO_NOTHING, related_name='user_2')
    message_content = models.CharField(max_length=512)   
    message_date = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = 'Messages'
        ordering = ['-message_date']