#!/usr/bin/env python
"""
Test script to verify the authentication system.
"""
import os
import sys
import django
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management import call_command

def setup_django():
    """Set up Django environment."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartfarm.settings.local')
    django.setup()

def test_user_creation():
    """Test user creation and authentication."""
    print("\nTesting user creation and authentication...")
    
    # Get the User model
    User = get_user_model()
    
    # Create a test user
    try:
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        print(f"✅ Created test user: {user.email}")
    except Exception as e:
        print(f"❌ Failed to create test user: {e}")
        return False
    
    # Test authentication
    from django.contrib.auth import authenticate
    authenticated_user = authenticate(username='test@example.com', password='testpass123')
    if authenticated_user:
        print(f"✅ Successfully authenticated user: {authenticated_user.email}")
    else:
        print("❌ Failed to authenticate user")
        return False
    
    # Clean up
    user.delete()
    return True

def test_jwt_authentication():
    """Test JWT authentication."""
    print("\nTesting JWT authentication...")
    
    # Get the User model
    User = get_user_model()
    
    # Create a test user
    user = User.objects.create_user(
        username='jwtuser',
        email='jwt@example.com',
        password='jwttest123',
        is_active=True
    )
    
    try:
        from rest_framework_simplejwt.tokens import RefreshToken
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        
        print(f"✅ Successfully generated JWT tokens")
        print(f"   Access token: {access_token[:20]}...")
        print(f"   Refresh token: {str(refresh)[:20]}...")
        
        # Verify token
        from rest_framework_simplejwt.tokens import AccessToken
        token = AccessToken(access_token)
        user_id = token['user_id']
        
        if user_id == user.id:
            print("✅ Successfully verified JWT token")
        else:
            print("❌ JWT token verification failed")
            return False
            
        return True
        
    except Exception as e:
        print(f"❌ JWT authentication test failed: {e}")
        return False
    finally:
        # Clean up
        user.delete()

def test_email_sending():
    """Test email sending functionality."""
    print("\nTesting email sending...")
    
    from django.core import mail
    from django.core.mail import send_mail
    
    try:
        # Send a test email
        send_mail(
            'Test Email from SmartFarm',
            'This is a test email from the SmartFarm authentication system.',
            settings.DEFAULT_FROM_EMAIL,
            ['test@example.com'],
            fail_silently=False,
        )
        
        if len(mail.outbox) > 0:
            print(f"✅ Successfully sent test email to {mail.outbox[0].to[0]}")
            print(f"   Subject: {mail.outbox[0].subject}")
            return True
        else:
            print("❌ No email was sent")
            return False
            
    except Exception as e:
        print(f"❌ Email sending test failed: {e}")
        return False

def main():
    """Main function to run all tests."""
    print("=" * 70)
    print("SmartFarm Authentication System Test")
    print("=" * 70)
    
    # Set up Django
    try:
        setup_django()
        print("\n✅ Django environment set up successfully")
    except Exception as e:
        print(f"\n❌ Failed to set up Django environment: {e}")
        return 1
    
    # Run tests
    tests = [
        ("User Creation", test_user_creation),
        ("JWT Authentication", test_jwt_authentication),
        ("Email Sending", test_email_sending),
    ]
    
    results = []
    for name, test_func in tests:
        print(f"\n{' TEST: ' + name + ' ':-^70}")
        try:
            success = test_func()
            results.append((name, success))
        except Exception as e:
            print(f"❌ {name} test failed with exception: {e}")
            results.append((name, False))
    
    # Print summary
    print("\n" + "=" * 70)
    print("TEST SUMMARY")
    print("=" * 70)
    
    all_passed = True
    for name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        if not success:
            all_passed = False
    
    print("\n" + "=" * 70)
    if all_passed:
        print("🎉 All tests passed successfully!")
    else:
        print("❌ Some tests failed. Please check the output above for details.")
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())
