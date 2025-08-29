#!/usr/bin/env python
"""
Check Django setup and settings.
"""
import os
import sys

def main():
    # Set up Django environment
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartfarm.settings.local')
    
    try:
        import django
        print(f"✅ Django {django.__version__} is installed")
    except ImportError as e:
        print(f"❌ Django import failed: {e}")
        return 1
    
    try:
        django.setup()
        print("✅ Django setup successful")
    except Exception as e:
        print(f"❌ Django setup failed: {e}")
        return 1
    
    # Check database connection
    try:
        from django.db import connection
        connection.ensure_connection()
        print("✅ Database connection successful")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
