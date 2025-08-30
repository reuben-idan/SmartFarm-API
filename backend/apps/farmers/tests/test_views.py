"""
Tests for the Farmers API endpoints.
"""
import json
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.farmers.models import FarmerProfile, FarmType

User = get_user_model()


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class FarmerProfileViewSetTests(APITestCase):
    """Test cases for FarmerProfileViewSet."""

    def setUp(self):
        # Create test users
        self.admin_user = User.objects.create_superuser(
            email='admin@example.com',
            password='testpass123',
            first_name='Admin',
            last_name='User'
        )
        self.regular_user = User.objects.create_user(
            email='user@example.com',
            password='testpass123',
            first_name='Regular',
            last_name='User'
        )
        
        # Create farm type
        self.farm_type = FarmType.objects.create(
            name='Organic Farm',
            description='Organic farming practices',
            is_active=True
        )

        # Create test farmer profiles
        self.farmer1 = FarmerProfile.objects.create(
            user=self.regular_user,
            phone='+255712345678',
            region='Arusha',
            district='Meru',
            farm_type=self.farm_type,
            farm_size_ha=5.5,
            is_verified=True,
            is_lead_farmer=True
        )
        
        # Create another user and farmer profile
        self.other_user = User.objects.create_user(
            email='other@example.com',
            password='testpass123',
            first_name='Other',
            last_name='User'
        )
        self.farmer2 = FarmerProfile.objects.create(
            user=self.other_user,
            phone='+255712345679',
            region='Kilimanjaro',
            district='Moshi',
            farm_type=self.farm_type,
            farm_size_ha=3.2,
            is_verified=False
        )
        
        # Get tokens for authentication
        self.admin_token = get_tokens_for_user(self.admin_user)['access']
        self.user_token = get_tokens_for_user(self.regular_user)['access']
        self.other_token = get_tokens_for_user(self.other_user)['access']
        
        # Set up URLs
        self.list_url = reverse('farmers:farmerprofile-list')
        self.detail_url = reverse('farmers:farmerprofile-detail', args=[self.farmer1.pk])
        self.me_url = reverse('farmers:farmer-me')
        self.stats_url = reverse('farmers:farmer-stats')
        self.verify_url = reverse('farmers:farmer-verify', args=[self.farmer2.pk])
        self.reject_url = reverse('farmers:farmer-reject', args=[self.farmer2.pk])

    def test_list_farmers_authenticated(self):
        """Test listing farmers as an authenticated user."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.user_token}')
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)

    def test_retrieve_farmer(self):
        """Test retrieving a single farmer profile."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.user_token}')
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['phone'], '+255712345678')

    def test_me_endpoint(self):
        """Test the /me/ endpoint returns the current user's farmer profile."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.user_token}')
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['phone'], '+255712345678')

    def test_stats_endpoint(self):
        """Test the /stats/ endpoint returns statistics."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.user_token}')
        response = self.client.get(self.stats_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_farmers', response.data)
        self.assertEqual(response.data['total_farmers'], 2)

    def test_verify_farmer_as_admin(self):
        """Test verifying a farmer as an admin."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        data = {'notes': 'Verified by admin'}
        response = self.client.post(self.verify_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.farmer2.refresh_from_db()
        self.assertTrue(self.farmer2.is_verified)

    def test_reject_farmer_as_admin(self):
        """Test rejecting a farmer as an admin."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        data = {'notes': 'Additional information required'}
        response = self.client.post(self.reject_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.farmer2.refresh_from_db()
        self.assertFalse(self.farmer2.is_verified)

    def test_create_farmer_as_admin(self):
        """Test creating a new farmer as an admin."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        data = {
            'user': {
                'email': 'newfarmer@example.com',
                'first_name': 'New',
                'last_name': 'Farmer',
                'password': 'testpass123'
            },
            'phone': '+255712345680',
            'region': 'Arusha',
            'district': 'Arusha',
            'farm_type': self.farm_type.id,
            'farm_size_ha': 4.2,
            'is_lead_farmer': False,
            'is_verified': True
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(FarmerProfile.objects.count(), 3)
        self.assertTrue(User.objects.filter(email='newfarmer@example.com').exists())


class FarmTypeViewSetTests(APITestCase):
    """Test cases for FarmTypeViewSet."""
    
    def setUp(self):
        # Create admin user
        self.admin_user = User.objects.create_superuser(
            email='admin@example.com',
            password='testpass123',
            first_name='Admin',
            last_name='User'
        )
        
        # Create regular user
        self.regular_user = User.objects.create_user(
            email='user@example.com',
            password='testpass123',
            first_name='Regular',
            last_name='User'
        )
        
        # Create test farm types
        self.farm_type1 = FarmType.objects.create(
            name='Organic Farm',
            description='Organic farming practices',
            is_active=True
        )
        self.farm_type2 = FarmType.objects.create(
            name='Dairy Farm',
            description='Dairy production',
            is_active=True
        )
        
        # Get tokens for authentication
        self.admin_token = get_tokens_for_user(self.admin_user)['access']
        self.user_token = get_tokens_for_user(self.regular_user)['access']
        
        # Set up URLs
        self.list_url = reverse('farmers:farmtype-list')
        self.detail_url = reverse('farmers:farmtype-detail', args=[self.farm_type1.pk])
        self.active_url = reverse('farmers:farmtype-active')
    
    def test_list_farm_types_authenticated(self):
        """Test listing farm types as an authenticated user."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.user_token}')
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)
    
    def test_retrieve_farm_type(self):
        """Test retrieving a single farm type."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.user_token}')
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Organic Farm')
    
    def test_active_farm_types(self):
        """Test that only active farm types are returned."""
        # Deactivate one farm type
        self.farm_type2.is_active = False
        self.farm_type2.save()
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.user_token}')
        response = self.client.get(self.active_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Organic Farm')

    def test_create_farm_type_as_admin(self):
        """Test creating a farm type as an admin."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        data = {
            'name': 'New Farm Type',
            'description': 'A new type of farm',
            'is_active': True
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(FarmType.objects.count(), 3)  # 2 from setUp + 1 new
        self.assertEqual(FarmType.objects.get(name='New Farm Type').is_active, True)

    def test_create_farm_type_unauthorized(self):
        """Test that non-admin users cannot create farm types."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.user_token}')
        data = {
            'name': 'Unauthorized Farm',
            'description': 'Should not be created',
            'is_active': True
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_toggle_farm_type_active_status(self):
        """Test toggling the active status of a farm type."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        url = f"{self.detail_url}?action=toggle_active"
        
        # Toggle active status to False
        response = self.client.patch(url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.farm_type1.refresh_from_db()
        self.assertFalse(self.farm_type1.is_active)
        
        # Toggle back to True
        response = self.client.patch(url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.farm_type1.refresh_from_db()
        self.assertTrue(self.farm_type1.is_active)
