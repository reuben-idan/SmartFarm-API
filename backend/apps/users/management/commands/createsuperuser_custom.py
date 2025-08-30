from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from apps.farmers.models import FarmType, FarmerProfile
from django.utils import timezone

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a superuser with required farmer profile fields'

    def handle(self, *args, **options):
        email = ' admin1@smartfarm.com'
        username = 'admin1'
        password = 'Hello.22'  # Change this to a secure password in production
        
        # Create or get the superuser
        user, created = User.objects.get_or_create(
            email=email,
            username=username,
            defaults={
                'is_staff': True,
                'is_superuser': True,
                'is_active': True,
                'first_name': 'Admin',
                'last_name': 'User',
            }
        )
        
        if created:
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS(f'Superuser {email} created successfully'))
        else:
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS(f'Superuser {email} password updated'))
        
        # Create a default farm type if none exists
        farm_type, _ = FarmType.objects.get_or_create(
            name='Mixed Farming',
            defaults={
                'description': 'Default farm type for system users',
                'is_active': True
            }
        )
        
        # Create or update farmer profile with all required fields
        FarmerProfile.objects.update_or_create(
            user=user,
            defaults={
                'phone': '+255700000000',
                'region': 'Dodoma',
                'district': 'Dodoma Urban',
                'ward': 'Chang\'ombe',
                'village': 'Mlimwa',
                'farm_size_ha': 1.0,
                'farm_name': 'Admin Farm',
                'farm_type': farm_type,
                'country': 'Tanzania',
                'is_verified': True,
                'verified_at': timezone.now(),
                'created_by': user,
                'updated_by': user,
            }
        )
        
        self.stdout.write(self.style.SUCCESS('Superuser created/updated successfully'))
        self.stdout.write(self.style.SUCCESS(f'Email: {email}'))
        self.stdout.write(self.style.SUCCESS('Password: admin123'))