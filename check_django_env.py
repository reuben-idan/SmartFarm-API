#!/usr/bin/env python
"""
Check Django environment and settings.
"""
import os
import sys
import importlib

def check_python_environment():
    """Check Python environment and print information."""
    print("=" * 60)
    print("Python Environment Check")
    print("=" * 60)
    print(f"Python executable: {sys.executable}")
    print(f"Python version: {sys.version}")
    print(f"Working directory: {os.getcwd()}")
    print("\nPython path:")
    for p in sys.path:
        print(f"  - {p}")
    print()

def check_django_installation():
    """Check if Django is installed and print version."""
    print("=" * 60)
    print("Django Installation Check")
    print("=" * 60)
    try:
        import django
        print(f"Django version: {django.__version__}")
        return True
    except ImportError:
        print("Django is not installed in this environment.")
        return False

def check_django_settings():
    """Check Django settings configuration."""
    print("\n" + "=" * 60)
    print("Django Settings Check")
    print("=" * 60)
    
    # Set default settings module if not set
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.test')
    
    try:
        import django
        from django.conf import settings, ENVIRONMENT_VARIABLE
        
        print(f"DJANGO_SETTINGS_MODULE: {os.environ.get(ENVIRONMENT_VARIABLE)}")
        
        # Try to access settings
        try:
            print(f"Using settings module: {settings.SETTINGS_MODULE}")
            print(f"Installed apps: {len(settings.INSTALLED_APPS)} apps")
            print(f"Database: {settings.DATABASES['default']['ENGINE']}")
            return True
        except Exception as e:
            print(f"Error accessing settings: {e}")
            return False
            
    except Exception as e:
        print(f"Error setting up Django: {e}")
        return False

def main():
    """Main function to run all checks."""
    check_python_environment()
    
    if not check_django_installation():
        sys.exit(1)
        
    if not check_django_settings():
        print("\nTroubleshooting:")
        print("1. Make sure the 'config' package is in your Python path")
        print("2. Verify that DJANGO_SETTINGS_MODULE is set correctly")
        print("3. Check that the settings file exists and is accessible")
        sys.exit(1)
    
    print("\nEnvironment appears to be set up correctly!")

if __name__ == "__main__":
    main()
