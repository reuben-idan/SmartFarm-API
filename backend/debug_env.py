#!/usr/bin/env python
"""Debug script to check Python and Django environment."""
import os
import sys
import platform

def check_environment():
    """Check Python and Django environment."""
    print("=== Environment Check ===")
    print(f"Python: {sys.version}")
    print(f"Platform: {platform.platform()}")
    print(f"Working Directory: {os.getcwd()}")
    print(f"Python Path: {sys.path}")
    
    try:
        import django
        print(f"\n=== Django Check ===")
        print(f"Django version: {django.__version__}")
        
        # Check Django settings
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.test')
        from django.conf import settings
        print(f"Django settings: {settings.SETTINGS_MODULE}")
        print(f"INSTALLED_APPS: {settings.INSTALLED_APPS}")
        
        # Try to set up Django
        django.setup()
        print("Django setup completed successfully!")
        
        # Check database connection
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            print(f"Database connection test: {result[0] == 1}")
            
    except Exception as e:
        print(f"\n=== Error ===\n{str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    check_environment()
