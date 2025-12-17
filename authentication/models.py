from django.db import models
from django.utils import timezone
from datetime import timedelta
import random

class OTP(models.Model):
    phone_number = models.CharField(max_length=15)
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)
    
    def is_valid(self):
        return timezone.now() < self.created_at + timedelta(minutes=10)
    
    @staticmethod
    def generate_otp():
        return str(random.randint(100000, 999999))
    
    class Meta:
        ordering = ['-created_at']