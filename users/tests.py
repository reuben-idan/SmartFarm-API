from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class UserModelTest(TestCase):
    def test_create_user(self):
        """Test creating a new user"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            phone='+1234567890'
        )
        self.assertEqual(user.username, 'testuser')
        self.assertEqual(user.email, 'test@example.com')
        self.assertEqual(user.phone, '+1234567890')
        self.assertTrue(user.check_password('testpass123'))
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

    def test_create_superuser(self):
        """Test creating a new superuser"""
        admin_user = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='adminpass123'
        )
        self.assertEqual(admin_user.username, 'admin')
        self.assertTrue(admin_user.is_staff)
        self.assertTrue(admin_user.is_superuser)


class AuthenticationAPITest(APITestCase):
    def setUp(self):
        self.register_url = reverse('users:register')
        self.login_url = reverse('users:login')
        self.profile_url = reverse('users:profile')
        self.check_auth_url = reverse('users:check_auth')
        
        # Create a test user
        self.user = User.objects.create_user(
            username='existinguser',
            email='existing@example.com',
            password='testpass123',
            phone='+1234567890'
        )
        
        # Create tokens for the test user
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
        self.refresh_token = str(refresh)

    def test_register_user(self):
        """Test registering a new user"""
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'newpass123',
            'password2': 'newpass123',
            'first_name': 'New',
            'last_name': 'User',
            'phone': '+1987654321',
            'role': 'farmer'
        }
        
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 2)  # 1 existing + 1 new
        self.assertEqual(response.data['user']['username'], 'newuser')
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])
        self.assertIn('refresh', response.data['tokens'])

    def test_login_user(self):
        """Test user login"""
        data = {
            'username': 'existinguser',
            'password': 'testpass123'
        }
        
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['username'], 'existinguser')

    def test_retrieve_user_profile(self):
        """Test retrieving user profile"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        response = self.client.get(self.profile_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'existinguser')
        self.assertEqual(response.data['email'], 'existing@example.com')

    def test_update_user_profile(self):
        """Test updating user profile"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        data = {
            'first_name': 'Updated',
            'last_name': 'Name',
            'email': 'updated@example.com',
            'phone': '+1987654321'
        }
        
        response = self.client.patch(self.profile_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, 'Updated')
        self.assertEqual(self.user.last_name, 'Name')
        self.assertEqual(self.user.email, 'updated@example.com')
        self.assertEqual(self.user.phone, '+1987654321')

    def test_check_auth(self):
        """Test checking if user is authenticated"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        response = self.client.get(self.check_auth_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'existinguser')

    def test_protected_endpoint_unauthorized(self):
        """Test that protected endpoints require authentication"""
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class RoleBasedAccessTest(APITestCase):
    def setUp(self):
        from django.contrib.auth.models import Group, Permission
        from django.contrib.contenttypes.models import ContentType
        
        # Create test users for each role
        self.farmer = User.objects.create_user(
            username='farmer1',
            email='farmer@example.com',
            password='testpass123'
        )
        
        self.agronomist = User.objects.create_user(
            username='agro1',
            email='agro@example.com',
            password='testpass123'
        )
        
        # Create groups and assign users
        farmer_group, _ = Group.objects.get_or_create(name='farmer')
        agronomist_group, _ = Group.objects.get_or_create(name='agronomist')
        
        self.farmer.groups.add(farmer_group)
        self.agronomist.groups.add(agronomist_group)
        
        # Create tokens
        self.farmer_token = str(RefreshToken.for_user(self.farmer).access_token)
        self.agronomist_token = str(RefreshToken.for_user(self.agronomist).access_token)
    
    def test_user_has_correct_role(self):
        """Test that users have the correct role properties"""
        self.assertTrue(self.farmer.is_farmer)
        self.assertTrue(self.agronomist.is_agronomist)
        self.assertFalse(self.farmer.is_agronomist)
        self.assertFalse(self.agronomist.is_farmer)

    def test_role_based_api_access(self):
        """Test that API endpoints can be protected by role"""
        # This is a placeholder for role-based endpoint tests
        # In a real application, you would test your role-based views here
        pass
