from django.test import TestCase
from django.contrib.auth import get_user_model
from ..models import FarmerProfile, FarmType

User = get_user_model()

class FarmerProfileModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='farmer@example.com',
            password='testpass123',
            first_name='John',
            last_name='Doe'
        )
        self.farm_type = FarmType.objects.create(
            name='Organic Farm',
            description='Organic farming practices',
            is_active=True
        )
        
    def test_create_farmer_profile(self):
        """Test creating a farmer profile."""
        profile = FarmerProfile.objects.create(
            user=self.user,
            gender='M',
            phone='+255712345678',
            region='Arusha',
            district='Meru',
            farm_type=self.farm_type,
            farm_size_ha=5.5,
            is_lead_farmer=True
        )
        
        self.assertEqual(str(profile), f"{self.user.get_full_name()}'s Profile")
        self.assertEqual(profile.region, 'Arusha')
        self.assertTrue(profile.is_lead_farmer)
        self.assertEqual(profile.farm_type, self.farm_type)


class FarmTypeModelTest(TestCase):
    def test_create_farm_type(self):
        """Test creating a farm type."""
        farm_type = FarmType.objects.create(
            name='Dairy Farm',
            description='Specializes in milk production',
            is_active=True
        )
        
        self.assertEqual(str(farm_type), 'Dairy Farm')
        self.assertTrue(farm_type.is_active)
