from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from suppliers.models import Supplier
from apps.users.models import User

class Command(BaseCommand):
    help = 'Seed database with sample supplier data'

    def handle(self, *args, **options):
        User = get_user_model()
        
        # Create supplier users
        suppliers = [
            {
                'username': 'agro_enterprise',
                'email': 'info@agroenterprise.co.ke',
                'company_name': 'Agro Enterprise Ltd',
                'contact_person': 'John Mwangi',
                'phone_number': '+254712345678',
                'address': 'P.O. Box 12345, Nairobi',
                'products_services': 'Fertilizers, Seeds, Pesticides',
                'is_active': True
            },
            {
                'username': 'farm_supplies',
                'email': 'sales@farmsupplies.co.ke',
                'company_name': 'Farm Supplies Kenya',
                'contact_person': 'Sarah Atieno',
                'phone_number': '+254723456789',
                'address': 'P.O. Box 67890, Eldoret',
                'products_services': 'Farm Equipment, Irrigation Systems',
                'is_active': True
            },
            {
                'username': 'organic_seeds',
                'email': 'info@organicseeds.africa',
                'company_name': 'Organic Seeds Africa',
                'contact_person': 'David Kimani',
                'phone_number': '+254734567890',
                'address': 'P.O. Box 45678, Nakuru',
                'products_services': 'Organic Seeds, Organic Fertilizers',
                'is_active': True
            }
        ]

        created_count = 0
        for supplier_data in suppliers:
            # Create user
            user, created = User.objects.get_or_create(
                username=supplier_data.pop('username'),
                email=supplier_data.pop('email'),
                defaults={
                    'is_active': True,
                    'role': 'supplier',
                    'password': 'defaultpassword123'  # Should be changed after first login
                }
            )
            
            if created:
                user.set_password('defaultpassword123')
                user.save()
                created_count += 1
            
            # Create supplier profile
            Supplier.objects.get_or_create(
                user=user,
                defaults=supplier_data
            )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully seeded {created_count} suppliers')
        )
