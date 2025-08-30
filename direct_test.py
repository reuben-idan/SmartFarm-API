#!/usr/bin/env python
"""
Direct test of Python and Django environment.
"""
import sys
import os

def main():
    print("Python Environment Test")
    print("=" * 60)
    
    # Basic Python info
    print("\nPython Information:")
    print(f"Version: {sys.version}")
    print(f"Executable: {sys.executable}")
    print(f"Working Directory: {os.getcwd()}")
    
    # Check Django
    try:
        import django
        print("\nDjango Information:")
        print(f"Version: {django.__version__}")
        
        # Set up Django
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.test')
        django.setup()
        
        from django.conf import settings
        print("\nDjango Settings:")
        print(f"INSTALLED_APPS: {len(settings.INSTALLED_APPS)} apps")
        print(f"DATABASES: {settings.DATABASES['default']['ENGINE']}")
        
    except Exception as e:
        print(f"\nError setting up Django: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()
