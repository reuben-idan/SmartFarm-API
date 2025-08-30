from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import FarmerProfile, FarmType

User = get_user_model()

def get_or_create_default_farm_type():
    """Get or create a default farm type."""
    farm_type, _ = FarmType.objects.get_or_create(
        name='Mixed Farming',
        defaults={
            'description': 'Default farm type for system users',
            'is_active': True
        }
    )
    return farm_type

@receiver(post_save, sender=User)
def create_or_update_farmer_profile(sender, instance, created, **kwargs):
    """
    Create or update the FarmerProfile when a User is created or updated.
    """
    if created:
        # Get or create default farm type
        farm_type = get_or_create_default_farm_type()
        
        # Create farmer profile with required fields
        FarmerProfile.objects.get_or_create(
            user=instance,
            defaults={
                'phone': '+255700000000',  # Default Tanzania number
                'region': 'Dodoma',
                'district': 'Dodoma Urban',
                'ward': 'Chang\'ombe',
                'village': 'Mlimwa',
                'farm_size_ha': 1.0,
                'farm_name': f"{instance.get_full_name() or instance.email.split('@')[0]}'s Farm",
                'farm_type': farm_type,
                'country': 'Tanzania',
                'is_verified': instance.is_superuser,  # Auto-verify superusers
                'verified_at': timezone.now() if instance.is_superuser else None,
                'created_by': instance if instance.is_superuser else None,
                'updated_by': instance if instance.is_superuser else None,
            }
        )
    elif hasattr(instance, 'farmer_profile'):
        # Update the related profile if it exists
        instance.farmer_profile.save()
