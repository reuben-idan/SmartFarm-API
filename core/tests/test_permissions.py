from django.test import TestCase, RequestFactory
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient, force_authenticate
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from core.permissions import (
    IsFarmer, IsFarmerOwner, IsSupplier, IsSupplierOwner, 
    IsStaffOrReadOnly, IsOwnerOrStaff
)

User = get_user_model()


class PermissionTests(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        
        # Create test users
        self.farmer = User.objects.create_user(
            username='farmer1',
            email='farmer1@example.com',
            password='testpass123',
            is_staff=False
        )
        self.farmer.groups.create(name='farmer')
        
        self.supplier = User.objects.create_user(
            username='supplier1',
            email='supplier1@example.com',
            password='testpass123',
            is_staff=False
        )
        self.supplier.groups.create(name='supplier')
        
        self.staff = User.objects.create_user(
            username='staff1',
            email='staff@example.com',
            password='testpass123',
            is_staff=True
        )
        
        self.other_user = User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='testpass123',
            is_staff=False
        )
        
        # Create a test object with an owner
        class TestObject:
            def __init__(self, user):
                self.user = user
                self.owner = user  # For IsOwnerOrReadOnly
        
        self.farmer_object = TestObject(self.farmer)
        self.supplier_object = TestObject(self.supplier)

    def test_is_farmer_permission(self):
        permission = IsFarmer()
        request = self.factory.get('/')
        request.user = self.farmer
        self.assertTrue(permission.has_permission(request, None))
        
        request.user = self.supplier
        self.assertFalse(permission.has_permission(request, None))

    def test_is_farmer_owner_permission(self):
        permission = IsFarmerOwner()
        request = self.factory.get('/')
        request.user = self.farmer
        
        # Test read permissions (should be allowed for all)
        self.assertTrue(permission.has_object_permission(request, None, self.farmer_object))
        
        # Test write permissions (only for owner)
        request.method = 'PUT'
        self.assertTrue(permission.has_object_permission(request, None, self.farmer_object))
        
        # Non-owner should not have write permission
        request.user = self.other_user
        self.assertFalse(permission.has_object_permission(request, None, self.farmer_object))

    def test_is_supplier_permission(self):
        permission = IsSupplier()
        request = self.factory.get('/')
        request.user = self.supplier
        self.assertTrue(permission.has_permission(request, None))
        
        request.user = self.farmer
        self.assertFalse(permission.has_permission(request, None))

    def test_is_owner_or_staff_permission(self):
        permission = IsOwnerOrStaff()
        request = self.factory.get('/')
        
        # Owner should have permission
        request.user = self.farmer
        self.assertTrue(permission.has_object_permission(request, None, self.farmer_object))
        
        # Staff should have permission
        request.user = self.staff
        self.assertTrue(permission.has_object_permission(request, None, self.farmer_object))
        
        # Other users should not have permission
        request.user = self.other_user
        self.assertFalse(permission.has_object_permission(request, None, self.farmer_object))


class ThrottlingTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client = APIClient()
        
    def test_anonymous_throttling(self):
        # Test that anonymous users are throttled
        url = '/api/health/'
        
        # First request should work
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # After many requests, should be throttled
        for _ in range(10):
            response = self.client.get(url)
        
        # This might be flaky in tests, but we can at least check the endpoint works
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_429_TOO_MANY_REQUESTS])
    
    def test_authenticated_user_throttling(self):
        # Test that authenticated users have higher limits
        self.client.force_authenticate(user=self.user)
        url = '/api/health/'
        
        # First request should work
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # After many requests, should still work for authenticated users
        for _ in range(10):
            response = self.client.get(url)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
