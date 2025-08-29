"""
Tests for the authentication system.
"""
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth import get_user_model
from django.core import mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.contrib.auth.tokens import default_token_generator

User = get_user_model()

class AuthenticationTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('users:register')
        self.login_url = reverse('users:login')
        self.verify_email_url = 'users:verify_email'
        self.password_reset_request_url = reverse('users:password_reset_request')
        self.password_reset_confirm_url = reverse('users:password_reset_confirm')
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123',
            'password2': 'testpass123',
            'first_name': 'Test',
            'last_name': 'User',
            'phone': '+1234567890',
            'role': 'farmer'
        }

    def test_user_registration(self):
        """Test user registration with valid data."""
        response = self.client.post(self.register_url, self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(User.objects.get().email, 'test@example.com')
        self.assertFalse(User.objects.get().is_active)  # User should be inactive until email verification

    def test_user_login(self):
        """Test user login with valid credentials."""
        # Create and verify user
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            is_active=True
        )
        
        response = self.client.post(
            self.login_url,
            {'username': 'test@example.com', 'password': 'testpass123'},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)

    def test_email_verification(self):
        """Test email verification with valid token."""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            is_active=False
        )
        
        # Generate token
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        
        # Verify email
        response = self.client.get(reverse(self.verify_email_url, args=[uid, token]))
        user.refresh_from_db()
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(user.is_active)
        self.assertTrue(user.is_verified)

    def test_password_reset_flow(self):
        """Test the complete password reset flow."""
        # Create a user
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='oldpassword',
            is_active=True
        )
        
        # Request password reset
        response = self.client.post(
            self.password_reset_request_url,
            {'email': 'test@example.com'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)
        
        # Get token from email
        email_body = mail.outbox[0].body
        token = email_body.split('reset/')[1].split('/')[1]
        uid = email_body.split('reset/')[1].split('/')[0]
        
        # Reset password
        response = self.client.post(
            self.password_reset_confirm_url,
            {
                'uid': uid,
                'token': token,
                'new_password': 'newpassword123',
                'new_password2': 'newpassword123'
            },
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify new password works
        user.refresh_from_db()
        self.assertTrue(user.check_password('newpassword123'))

    def test_protected_endpoint_access(self):
        """Test that protected endpoints require authentication."""
        # Create and verify user
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            is_active=True
        )
        
        # Try to access protected endpoint without token
        response = self.client.get(reverse('users:profile'))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # Get token
        login_response = self.client.post(
            self.login_url,
            {'username': 'test@example.com', 'password': 'testpass123'},
            format='json'
        )
        token = login_response.data['access']
        
        # Access protected endpoint with token
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(reverse('users:profile'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
