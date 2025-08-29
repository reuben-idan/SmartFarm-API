#!/usr/bin/env python
"""
Check Django installation and basic functionality.
"""
import sys
import os

def main():
    # Print basic environment info
    print("=" * 70)
    print("Django Environment Check")
    print("=" * 70)
    print(f"Python: {sys.version}")
    print(f"Working Dir: {os.getcwd()}")
    
    # Set up Django environment
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartfarm.settings.local')
    
    try:
        import django
        print(f"\n✅ Django {django.__version__} is installed")
    except ImportError:
        print("\n❌ Django is not installed")
        print("Install with: pip install django")
        return 1
    
    try:
        django.setup()
        print("✅ Django setup successful")
    except Exception as e:
        print(f"❌ Django setup failed: {e}")
        return 1
    
    # Test database connection
    try:
        from django.db import connection
        connection.ensure_connection()
        print("✅ Database connection successful")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return 1
    
    # Test model import
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        print(f"✅ User model loaded: {User.__name__}")
    except Exception as e:
        print(f"❌ Failed to load User model: {e}")
        return 1
    
    print("\n✅ All checks passed!")
    return 0

if __name__ == "__main__":
    sys.exit(main())
