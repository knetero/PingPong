from django_cron import CronJobBase, Schedule
from django.utils import timezone
from .models import User

class ResetExpiredCodesJob(CronJobBase):
    schedule = Schedule(run_every_mins=60)  
    code = 'your_app.reset_expired_codes_job'

    def do(self):
        User.objects.filter(
            code_expiry_time__lt=timezone.now(),
            otp__isnull=False
        ).update(otp='', otp_expiry_time=None)