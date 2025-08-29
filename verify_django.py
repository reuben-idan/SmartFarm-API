import os
import sys
import django

def main():
    # Set up Django environment
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartfarm.settings.local')
    django.setup()
    
    # Test database connection
    from django.db import connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            print("✅ Database connection successful")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
    
    # Test Django apps
    from django.apps import apps
    try:
        apps.get_models()
        print("✅ Django apps loaded successfully")
    except Exception as e:
        print(f"❌ Error loading Django apps: {e}")
    
    # Test settings
    from django.conf import settings
    try:
        print(f"\n📋 Settings:")
        print(f"  DEBUG: {settings.DEBUG}")
        print(f"  DATABASES: {settings.DATABASES['default']['ENGINE']}")
        print(f"  INSTALLED_APPS: {len(settings.INSTALLED_APPS)} apps")
        print("✅ Settings loaded successfully")
    except Exception as e:
        print(f"❌ Error accessing settings: {e}")

if __name__ == "__main__":
    main()
