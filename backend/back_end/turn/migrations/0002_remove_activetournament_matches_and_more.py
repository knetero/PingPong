# Generated by Django 5.1.4 on 2024-12-10 14:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('turn', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='activetournament',
            name='matches',
        ),
        migrations.AlterField(
            model_name='activetournament',
            name='players',
            field=models.JSONField(default=dict),
        ),
    ]
