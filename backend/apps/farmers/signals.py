from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import FarmerProfile

User = get_user_model()

@receiver(post_save, sender=User)
def create_or_update_farmer_profile(sender, instance, created, **kwargs):
    """
    Create or update the FarmerProfile when a User is created or updated.
    """
    if created:
        FarmerProfile.objects.get_or_create(user=instance)
    else:
        # Update the related profile if it exists
        if hasattr(instance, 'farmer_profile'):
            instance.farmer_profile.save()
