#!/usr/bin/env python
"""
Switch the database backend to SQLite.
"""
import os
import sys
from pathlib import Path

def main():
    # Set up Django environment
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartfarm.settings.local')
    
    try:
        import django
        from django.conf import settings
    except ImportError as e:
        print(f"Error: {e}")
        return 1
    
    # Ensure we're using SQLite
    db_config = settings.DATABASES['default']
    if db_config['ENGINE'] != 'django.db.backends.sqlite3':
        print("Switching to SQLite database...")
        db_config.update({
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': os.path.join(settings.BASE_DIR, 'db.sqlite3'),
            'USER': '',
            'PASSWORD': '',
            'HOST': '',
            'PORT': '',
        })
    
    # Run migrations
    from django.core.management import call_command
    print("Running migrations...")
    call_command('migrate')
    
    print("\n✅ Successfully switched to SQLite!")
    print("You can now run the development server with:")
    print("python manage.py runserver")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
