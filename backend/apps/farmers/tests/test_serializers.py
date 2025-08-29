from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError

from ..models import FarmerProfile, FarmType
from ..serializers import (
    FarmerProfileListSerializer,
    FarmerProfileDetailSerializer,
    FarmerProfileCreateUpdateSerializer,
    FarmTypeSerializer
)

User = get_user_model()


class FarmerProfileSerializerTests(TestCase):
    """Test cases for FarmerProfile serializers."""

    def setUp(self):
        # Create test user
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        
        # Create farm type
        self.farm_type = FarmType.objects.create(
            name='Organic Farm',
            description='Organic farming practices',
            is_active=True
        )
        
        # Create farmer profile
        self.farmer_profile = FarmerProfile.objects.create(
            user=self.user,
            gender='M',
            phone='+255712345678',
            region='Arusha',
            district='Meru',
            farm_type=self.farm_type,
            farm_size_ha=5.5,
            is_lead_farmer=True,
            is_verified=True
        )
        
        # Test data for creating/updating
        self.valid_data = {
            'user': {
                'email': 'newfarmer@example.com',
                'first_name': 'New',
                'last_name': 'Farmer',
                'password': 'testpass123'
            },
            'gender': 'F',
            'phone': '+255712345679',
            'region': 'Kilimanjaro',
            'district': 'Moshi',
            'farm_type': self.farm_type.id,
            'farm_size_ha': 3.2,
            'is_lead_farmer': False,
            'is_verified': False
        }
    
    def test_farmer_profile_list_serializer(self):
        """Test the list serializer includes the correct fields."""
        serializer = FarmerProfileListSerializer(instance=self.farmer_profile)
        data = serializer.data
        
        self.assertEqual(set(data.keys()), {
            'id', 'full_name', 'phone', 'region', 'district', 'farm_type',
            'farm_size_ha', 'is_lead_farmer', 'is_verified', 'created_at'
        })
        self.assertEqual(data['full_name'], 'Test User')
        self.assertEqual(data['phone'], '+255712345678')
        self.assertEqual(data['farm_type'], 'Organic Farm')
    
    def test_farmer_profile_detail_serializer(self):
        """Test the detail serializer includes all fields."""
        serializer = FarmerProfileDetailSerializer(instance=self.farmer_profile)
        data = serializer.data
        
        self.assertIn('id', data)
        self.assertIn('user', data)
        self.assertIn('gender', data)
        self.assertIn('phone', data)
        self.assertIn('region', data)
        self.assertIn('district', data)
        self.assertIn('ward', data)
        self.assertIn('village', data)
        self.assertIn('farm_type', data)
        self.assertIn('farm_size_ha', data)
        self.assertIn('is_lead_farmer', data)
        self.assertIn('is_verified', data)
        self.assertIn('verification_notes', data)
        self.assertIn('created_at', data)
        self.assertIn('updated_at', data)
    
    def test_create_farmer_profile_serializer(self):
        """Test creating a farmer profile with nested user data."""
        serializer = FarmerProfileCreateUpdateSerializer(data=self.valid_data)
        self.assertTrue(serializer.is_valid())
        
        farmer = serializer.save()
        self.assertEqual(farmer.user.email, 'newfarmer@example.com')
        self.assertEqual(farmer.phone, '+255712345679')
        self.assertEqual(farmer.region, 'Kilimanjaro')
        self.assertEqual(farmer.farm_type, self.farm_type)
        self.assertFalse(farmer.is_verified)
    
    def test_update_farmer_profile_serializer(self):
        """Test updating a farmer profile."""
        update_data = {
            'gender': 'F',
            'phone': '+255712345680',
            'region': 'Tanga',
            'district': 'Pangani',
            'farm_type': self.farm_type.id,
            'farm_size_ha': 4.5,
            'is_lead_farmer': False
        }
        
        serializer = FarmerProfileCreateUpdateSerializer(
            instance=self.farmer_profile,
            data=update_data,
            partial=True
        )
        self.assertTrue(serializer.is_valid())
        
        farmer = serializer.save()
        self.assertEqual(farmer.gender, 'F')
        self.assertEqual(farmer.phone, '+255712345680')
        self.assertEqual(farmer.region, 'Tanga')
        self.assertEqual(farmer.district, 'Pangani')
        self.assertEqual(farmer.farm_size_ha, 4.5)
        self.assertFalse(farmer.is_lead_farmer)
    
    def test_validate_phone_number_format(self):
        """Test phone number validation."""
        invalid_data = self.valid_data.copy()
        invalid_data['phone'] = 'invalid-phone'
        
        serializer = FarmerProfileCreateUpdateSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('phone', serializer.errors)
    
    def test_validate_farm_size_positive(self):
        """Test farm size must be positive."""
        invalid_data = self.valid_data.copy()
        invalid_data['farm_size_ha'] = -1.0
        
        serializer = FarmerProfileCreateUpdateSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('farm_size_ha', serializer.errors)


class FarmTypeSerializerTests(TestCase):
    """Test cases for FarmType serializer."""
    
    def setUp(self):
        self.valid_data = {
            'name': 'Dairy Farm',
            'description': 'Dairy farming operations',
            'is_active': True
        }
    
    def test_serialize_farm_type(self):
        """Test serializing a farm type."""
        farm_type = FarmType.objects.create(**self.valid_data)
        serializer = FarmTypeSerializer(instance=farm_type)
        
        self.assertEqual(set(serializer.data.keys()), {
            'id', 'name', 'description', 'is_active', 'created_at', 'updated_at'
        })
        self.assertEqual(serializer.data['name'], 'Dairy Farm')
        self.assertEqual(serializer.data['description'], 'Dairy farming operations')
        self.assertTrue(serializer.data['is_active'])
    
    def test_create_farm_type(self):
        """Test creating a farm type."""
        serializer = FarmTypeSerializer(data=self.valid_data)
        self.assertTrue(serializer.is_valid())
        
        farm_type = serializer.save()
        self.assertEqual(farm_type.name, 'Dairy Farm')
        self.assertEqual(farm_type.description, 'Dairy farming operations')
        self.assertTrue(farm_type.is_active)
    
    def test_update_farm_type(self):
        """Test updating a farm type."""
        farm_type = FarmType.objects.create(
            name='Old Name',
            description='Old description',
            is_active=False
        )
        
        update_data = {
            'name': 'Updated Name',
            'description': 'Updated description',
            'is_active': True
        }
        
        serializer = FarmTypeSerializer(
            instance=farm_type,
            data=update_data,
            partial=True
        )
        self.assertTrue(serializer.is_valid())
        
        updated = serializer.save()
        self.assertEqual(updated.name, 'Updated Name')
        self.assertEqual(updated.description, 'Updated description')
        self.assertTrue(updated.is_active)
    
    def test_validate_name_required(self):
        ""Test name is required."""
        invalid_data = self.valid_data.copy()
        invalid_data.pop('name')
        
        serializer = FarmTypeSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('name', serializer.errors)
