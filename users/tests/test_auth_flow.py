""
Comprehensive test suite for SmartFarm authentication system.
"""
import json
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth import get_user_model
from django.core import mail
from django.core.management import call_command
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.contrib.auth.tokens import default_token_generator

User = get_user_model()

class AuthFlowTests(APITestCase):
    """Test the complete authentication flow."""
    
    @classmethod
    def setUpTestData(cls):
        """Set up test data for all test methods."""
        # Create test user
        cls.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User',
            is_active=True
        )
        
        # Create another user for testing
        cls.other_user = User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='otherpass123',
            first_name='Other',
            last_name='User',
            is_active=True
        )
        
        # Create admin user
        cls.admin = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='adminpass123',
            first_name='Admin',
            last_name='User'
        )
        
        # API endpoints
        cls.register_url = reverse('users:register')
        cls.login_url = reverse('users:login')
        cls.token_refresh_url = reverse('users:token_refresh')
        cls.verify_email_url = 'users:verify_email'
        cls.password_reset_request_url = reverse('users:password_reset_request')
        cls.password_reset_confirm_url = reverse('users:password_reset_confirm')
        cls.password_change_url = reverse('users:password_change')
        cls.profile_url = reverse('users:profile')
        cls.users_list_url = reverse('users:users-list')
    
    def setUp(self):
        self.client = APIClient()
        # Clear test mail outbox
        mail.outbox = []
    
    def test_01_register_new_user(self):
        """Test user registration with valid data."""
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'newpass123',
            'password2': 'newpass123',
            'first_name': 'New',
            'last_name': 'User',
            'phone': '+1234567890',
            'role': 'farmer'
        }
        
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 4)  # 3 from setUpTestData + 1 new
        
        # Verify user is created but not active
        user = User.objects.get(email='newuser@example.com')
        self.assertFalse(user.is_active)
        self.assertFalse(user.is_verified)
        
        # Verify email was sent
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('Verify Your Email', mail.outbox[0].subject)
        self.assertIn('newuser@example.com', mail.outbox[0].to)
    
    def test_02_verify_email(self):
        """Test email verification with valid token."""
        # Create an inactive user
        user = User.objects.create_user(
            username='verifytest',
            email='verify@example.com',
            password='testpass123',
            is_active=False
        )
        
        # Generate verification URL
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        
        # Verify email
        response = self.client.get(reverse(self.verify_email_url, args=[uid, token]))
        
        # Check response and user status
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertTrue(user.is_active)
        self.assertTrue(user.is_verified)
        
        # Verify welcome email was sent
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('Welcome to SmartFarm', mail.outbox[0].subject)
    
    def test_03_login_success(self):
        """Test successful user login."""
        data = {
            'username': 'test@example.com',
            'password': 'testpass123'
        }
        
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['email'], 'test@example.com')
    
    def test_04_refresh_token(self):
        """Test token refresh flow."""
        # First, login to get tokens
        login_data = {
            'username': 'test@example.com',
            'password': 'testpass123'
        }
        login_response = self.client.post(self.login_url, login_data, format='json')
        refresh_token = login_response.data['refresh']
        
        # Now refresh the token
        refresh_data = {'refresh': refresh_token}
        refresh_response = self.client.post(self.token_refresh_url, refresh_data, format='json')
        
        self.assertEqual(refresh_response.status_code, status.HTTP_200_OK)
        self.assertIn('access', refresh_response.data)
    
    def test_05_password_reset_flow(self):
        """Test the complete password reset flow."""
        # Request password reset
        reset_data = {'email': 'test@example.com'}
        response = self.client.post(
            self.password_reset_request_url, 
            reset_data, 
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('Reset Your Password', mail.outbox[0].subject)
        
        # Extract token from email
        email_body = mail.outbox[0].body
        token = email_body.split('reset/')[1].split('/')[1]
        uid = email_body.split('reset/')[1].split('/')[0]
        
        # Reset password
        new_password_data = {
            'uid': uid,
            'token': token,
            'new_password': 'newsecurepass123',
            'new_password2': 'newsecurepass123'
        }
        
        reset_confirm_response = self.client.post(
            self.password_reset_confirm_url,
            new_password_data,
            format='json'
        )
        
        self.assertEqual(reset_confirm_response.status_code, status.HTTP_200_OK)
        
        # Verify new password works
        user = User.objects.get(email='test@example.com')
        self.assertTrue(user.check_password('newsecurepass123'))
    
    def test_06_protected_endpoints(self):
        """Test access to protected endpoints."""
        # Try to access profile without authentication
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # Login
        login_data = {'username': 'test@example.com', 'password': 'testpass123'}
        login_response = self.client.post(self.login_url, login_data, format='json')
        token = login_response.data['access']
        
        # Access profile with token
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        profile_response = self.client.get(self.profile_url)
        
        self.assertEqual(profile_response.status_code, status.HTTP_200_OK)
        self.assertEqual(profile_response.data['email'], 'test@example.com')
    
    def test_07_admin_endpoints(self):
        """Test admin-only endpoints."""
        # Try to access users list as regular user (should fail)
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.users_list_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Access as admin (should succeed)
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(self.users_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 3)  # At least 3 users
    
    def test_08_duplicate_registration(self):
        """Test that duplicate email/username is not allowed."""
        data = {
            'username': 'testuser',  # Already exists
            'email': 'new@example.com',
            'password': 'testpass123',
            'password2': 'testpass123',
            'first_name': 'Test',
            'last_name': 'Duplicate',
            'role': 'farmer'
        }
        
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('username', response.data)
    
    def test_09_password_validation(self):
        """Test password validation rules."""
        data = {
            'username': 'passwordtest',
            'email': 'password@example.com',
            'password': 'short',  # Too short
            'password2': 'short',
            'first_name': 'Password',
            'last_name': 'Test',
            'role': 'farmer'
        }
        
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data)
    
    def test_10_password_change(self):
        """Test authenticated user can change their password."""
        self.client.force_authenticate(user=self.user)
        
        data = {
            'old_password': 'testpass123',
            'new_password': 'newsecurepass123',
            'new_password2': 'newsecurepass123'
        }
        
        response = self.client.post(self.password_change_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify password was changed
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('newsecurepass123'))
        
        # Verify email was sent
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('Your password has been changed', mail.outbox[0].subject)
