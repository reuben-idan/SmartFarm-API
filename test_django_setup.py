import os
import django

try:
    # Set up Django environment
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartfarm.settings.local')
    django.setup()
    
    # Test database connection
    from django.db import connection
    with connection.cursor() as cursor:
        cursor.execute("SELECT sqlite_version();")
        version = cursor.fetchone()
        print(f"SQLite version: {version[0]}")
    
    # Test models import
    from django.contrib.auth import get_user_model
    User = get_user_model()
    print("Django models imported successfully")
    
    # Test settings
    from django.conf import settings
    print(f"DEBUG: {settings.DEBUG}")
    print(f"DATABASES: {settings.DATABASES['default']['ENGINE']}")
    
    print("\nDjango environment is set up correctly!")
    
except Exception as e:
    print(f"Error: {str(e)}")
    import traceback
    traceback.print_exc()
