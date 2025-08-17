from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    phone = models.CharField(_('phone number'), max_length=20, blank=True, null=True)
    
    class Meta:
        db_table = 'auth_user'
        verbose_name = _('user')
        verbose_name_plural = _('users')
    
    def __str__(self):
        return self.username

    @property
    def is_farmer(self):
        return self.groups.filter(name='farmer').exists()
    
    @property
    def is_agronomist(self):
        return self.groups.filter(name='agronomist').exists()
    
    @property
    def is_supplier(self):
        return self.groups.filter(name='supplier').exists()
    
    @property
    def is_extension_officer(self):
        return self.groups.filter(name='extension_officer').exists()


class UserProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile'
    )
    bio = models.TextField(_('bio'), blank=True)
    profile_picture = models.ImageField(
        _('profile picture'),
        upload_to='profile_pics/',
        blank=True,
        null=True
    )
    address = models.TextField(_('address'), blank=True)
    date_of_birth = models.DateField(_('date of birth'), null=True, blank=True)
    
    class Meta:
        verbose_name = _('user profile')
        verbose_name_plural = _('user profiles')
    
    def __str__(self):
        return f"{self.user.username}'s profile"
