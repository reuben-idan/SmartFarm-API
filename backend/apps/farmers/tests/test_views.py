"""
Tests for the FarmerProfileViewSet API endpoints.
"""
import os
import django
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.test_settings')
django.setup()

from apps.farmers.models import FarmerProfile
from apps.api.permissions import IsAdminOrReadOnly

User = get_user_model()


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

        # Create test farmer profiles
        self.farmer1 = FarmerProfile.objects.create(
            user=self.regular_user,
            phone_number='+1234567890',
            region='Test Region',
            district='Test District',
            village='Test Village',
            farm_size=5.5,
            is_verified=True
        )

        self.farmer2 = FarmerProfile.objects.create(
            user=self.admin_user,
            phone_number='+1987654321',
            region='Test Region',
            district='Another District',
            village='Another Village',
            farm_size=10.0,
            is_verified=False
        )

        # URL for the API
        self.list_url = reverse('farmerprofile-list')

    def test_list_farmers_authenticated(self):
        ""Test that authenticated users can list farmers.""
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)

    def test_list_farmers_unauthenticated(self):
        ""Test that unauthenticated users cannot list farmers.""
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_retrieve_farmer(self):
        ""Test retrieving a farmer profile.""
        self.client.force_authenticate(user=self.regular_user)
        url = reverse('farmerprofile-detail', args=[self.farmer1.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['phone_number'], self.farmer1.phone_number)

    def test_create_farmer_admin_only(self):
        ""Test that only admins can create farmer profiles.""
        self.client.force_authenticate(user=self.regular_user)
        data = {
            'user': self.regular_user.id,
            'phone_number': '+1122334455',
            'region': 'New Region',
            'district': 'New District',
            'village': 'New Village',
            'farm_size': 7.5
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_farmer_admin_only(self):
        ""Test that only admins can update farmer profiles.""
        self.client.force_authenticate(user=self.regular_user)
        url = reverse('farmerprofile-detail', args=[self.farmer1.id])
        data = {'phone_number': '+1987654321'}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_farmer_admin_only(self):
        ""Test that only admins can delete farmer profiles.""
        self.client.force_authenticate(user=self.regular_user)
        url = reverse('farmerprofile-detail', args=[self.farmer1.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_filter_farmers_by_region(self):
        ""Test filtering farmers by region.""
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.get(f"{self.list_url}?region=Test%20Region")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)

    def test_search_farmers(self):
        ""Test searching farmers.""
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.get(f"{self.list_url}?search=Test%20Village")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['village'], 'Test Village')

    def test_ordering_farmers(self):
        ""Test ordering farmers by farm size.""
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.get(f"{self.list_url}?ordering=farm_size")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(float(response.data['results'][0]['farm_size']), 5.5)
        self.assertEqual(float(response.data['results'][1]['farm_size']), 10.0)

        # Test descending order
        response = self.client.get(f"{self.list_url}?ordering=-farm_size")
        self.assertEqual(float(response.data['results'][0]['farm_size']), 10.0)
        self.assertEqual(float(response.data['results'][1]['farm_size']), 5.5)
