#!/usr/bin/env python
"""
Check if all installed apps in settings can be imported.
"""
import os
import sys
import importlib
from django.conf import settings

def check_apps():
    # Set up Django environment
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartfarm.settings.local')
    
    try:
        import django
        django.setup()
    except Exception as e:
        print(f"❌ Django setup failed: {e}")
        return 1
    
    print("🔍 Checking installed apps...\n")
    
    all_good = True
    for app in settings.INSTALLED_APPS:
        if app in ['django.contrib.admin', 'django.contrib.auth', 'django.contrib.contenttypes', 
                  'django.contrib.sessions', 'django.contrib.messages', 'django.contrib.staticfiles']:
            # Skip Django's built-in apps
            print(f"✅ {app} (Django built-in)")
            continue
            
        try:
            importlib.import_module(app.split('.')[0])
            print(f"✅ {app}")
        except ImportError as e:
            print(f"❌ {app} - {str(e)}")
            all_good = False
    
    if all_good:
        print("\n✨ All apps imported successfully!")
    else:
        print("\n❌ Some apps failed to import. Please check the errors above.")
    
    return 0 if all_good else 1

if __name__ == "__main__":
    sys.exit(check_apps())
