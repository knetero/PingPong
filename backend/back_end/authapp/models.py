from django.db import models
from django.contrib.auth.models import AbstractBaseUser
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.base_user import BaseUserManager
    

class UserManager(BaseUserManager):
    def create_user(self, email,username,password, **extra_fields):
        if not id:
            raise ValueError(_("The id must be set "))
        if not email:
            raise ValueError(_("The Email must be set "))
        if not username:
            raise ValueError(_("The username must be set "))
        if not password:
            raise ValueError(_("The password must be set "))
        email = self.normalize_email(email)
        user = self.model (email=email,username=username,**extra_fields)
        user.set_password (password)
        user.save() 
        return (user)
    
  
class User(AbstractBaseUser):
    id = models.AutoField(primary_key=True)
    password = models.CharField()
    username = models.CharField(max_length=20, unique=True)
    fullname = models.CharField(max_length=40, blank=True)
    email = models.EmailField(unique=True)
    image_name = models.CharField(max_length=50, default= "profilepng.png")
    image_field = models.ImageField(upload_to='images/', default='images/profilepng.png', null=True, blank=True)
    is_2fa = models.BooleanField(default=False)
    _2fa_code =  models.CharField(max_length=6, default="")
    state = models.CharField(max_length=255, default="no state assigned")
    redirect_to = models.BooleanField(default=False)
    first_name = None
    last_name = None
    date_joined = None
    is_superuser = None
    is_staff = None
    is_on = models.IntegerField(default=0)
    last_login=None
    USERNAME_FIELD ='email'
    # EMAIL_FIELD = 'email'
    objects = UserManager()
