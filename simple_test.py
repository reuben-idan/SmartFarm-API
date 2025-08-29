#!/usr/bin/env python
"""
A simple test script to verify Python and basic Django functionality.
"""
import sys
import os

def main():
    # Print Python information
    print("=" * 70)
    print("Python Environment Test")
    print("=" * 70)
    print(f"Python Version: {sys.version}")
    print(f"Executable: {sys.executable}")
    print(f"Working Directory: {os.getcwd()}")
    
    # Try to import Django
    try:
        import django
        print("\n✅ Django is installed")
        print(f"Django Version: {django.__version__}")
        
        # Set up Django
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartfarm.settings.local')
        django.setup()
        
        # Test basic Django functionality
        from django.conf import settings
        print("\n✅ Django settings loaded successfully")
        print(f"INSTALLED_APPS: {len(settings.INSTALLED_APPS)} apps")
        
        # Test database connection
        from django.db import connection
        connection.ensure_connection()
        print("✅ Database connection successful")
        
        # Test model import
        from django.contrib.auth import get_user_model
        User = get_user_model()
        print(f"✅ User model loaded: {User.__name__}")
        
        # Test creating a user
        try:
            user = User.objects.create_user(
                username='testuser',
                email='test@example.com',
                password='testpass123'
            )
            print(f"✅ Created test user: {user.username}")
            user.delete()
            print("✅ Cleaned up test user")
        except Exception as e:
            print(f"❌ Error creating test user: {e}")
        
    except ImportError:
        print("\n❌ Django is not installed. Please install it with: pip install django")
        return 1
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return 1
    
    print("\n✅ All tests completed successfully!")
    return 0

if __name__ == "__main__":
    sys.exit(main())
