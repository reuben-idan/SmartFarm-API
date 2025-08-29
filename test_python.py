import os
import sys

def main():
    # Basic Python info
    print("Python Information:")
    print(f"Version: {sys.version}")
    print(f"Executable: {sys.executable}")
    print(f"Working Directory: {os.getcwd()}")
    
    # Environment variables
    print("\nEnvironment Variables:")
    for key in ['PYTHONPATH', 'DJANGO_SETTINGS_MODULE']:
        print(f"{key}: {os.environ.get(key, 'Not set')}")
    
    # Try to import Django
    print("\nTrying to import Django...")
    try:
        import django
        print(f"Django version: {django.__version__}")
        
        # Check Django settings
        from django.conf import settings
        print("\nDjango Settings:")
        print(f"Settings module: {settings.SETTINGS_MODULE}")
        print(f"Installed apps: {len(settings.INSTALLED_APPS)} apps")
        
    except ImportError:
        print("Django is not installed in this environment.")
    except Exception as e:
        print(f"Error with Django: {e}")

if __name__ == "__main__":
    main()
