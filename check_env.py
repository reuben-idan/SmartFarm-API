#!/usr/bin/env python
"""
Check the Python and Django environment.
"""
import sys
import os

def check_python():
    """Check Python version and environment."""
    print("=" * 70)
    print("Python Environment Check")
    print("=" * 70)
    print(f"Python Version: {sys.version}")
    print(f"Python Executable: {sys.executable}")
    print(f"Working Directory: {os.getcwd()}")
    print(f"PYTHONPATH: {os.environ.get('PYTHONPATH', 'Not set')}")
    print()

def check_django():
    """Check Django installation and version."""
    try:
        import django
        print("=" * 70)
        print("Django Check")
        print("=" * 70)
        print(f"Django Version: {django.__version__}")
        
        # Try to set up Django
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartfarm.settings.local')
        django.setup()
        
        from django.conf import settings
        print("\nDjango Settings:")
        print(f"- DEBUG: {settings.DEBUG}")
        print(f"- DATABASES: {settings.DATABASES['default']['ENGINE']}")
        print(f"- INSTALLED_APPS: {len(settings.INSTALLED_APPS)} apps")
        
        # Test database connection
        from django.db import connection
        connection.ensure_connection()
        print("\nDatabase Connection: OK")
        
        return True
        
    except Exception as e:
        print(f"\nERROR: {e.__class__.__name__}: {e}")
        return False

def main():
    """Main function."""
    check_python()
    if not check_django():
        print("\nDjango environment check failed.")
        return 1
    
    print("\nEnvironment check completed successfully!")
    return 0

if __name__ == "__main__":
    sys.exit(main())
