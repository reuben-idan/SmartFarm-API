#!/usr/bin/env python
"""
Test Django settings and database connection.
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
    
    # Try to import settings
    try:
        from django.conf import settings
        print("\n📋 Django Settings:")
        print(f"- DEBUG: {settings.DEBUG}")
        print(f"- INSTALLED_APPS: {len(settings.INSTALLED_APPS)} apps")
        
        # Check database connection
        try:
            from django.db import connection
            connection.ensure_connection()
            print("\n✅ Database connection successful")
            print(f"- Database: {connection.settings_dict['ENGINE']}")
            if 'sqlite' in connection.settings_dict['ENGINE']:
                print(f"- Database file: {connection.settings_dict['NAME']}")
            else:
                print(f"- Database name: {connection.settings_dict['NAME']}")
                print(f"- Database user: {connection.settings_dict['USER']}")
        except Exception as e:
            print(f"\n❌ Database connection failed: {e}")
            return 1
            
    except Exception as e:
        print(f"\n❌ Error accessing settings: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
