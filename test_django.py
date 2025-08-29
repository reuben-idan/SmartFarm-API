#!/usr/bin/env python
"""
Test Django environment and settings.
"""
import os
import sys
import django
from django.conf import settings

def check_environment():
    """Check the Django environment and settings."""
    print("=" * 70)
    print("Django Environment Check")
    print("=" * 70)
    
    # Check Python environment
    print(f"Python: {sys.version}")
    print(f"Django: {django.get_version()}")
    
    # Set up Django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartfarm.settings.local')
    
    try:
        django.setup()
        print("\n✅ Django setup successful")
    except Exception as e:
        print(f"\n❌ Django setup failed: {e}")
        return False
    
    # Check database configuration
    try:
        from django.db import connection
        connection.ensure_connection()
        print("✅ Database connection successful")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False
    
    # Check installed apps
    print("\nInstalled Apps:")
    for app in settings.INSTALLED_APPS:
        print(f"- {app}")
    
    return True

if __name__ == "__main__":
    if check_environment():
        print("\n✅ Environment check completed successfully!")
    else:
        print("\n❌ Environment check failed.")
        sys.exit(1)
