#!/usr/bin/env python
"""
Test script to verify the Django environment and test runner setup.
"""
#!/usr/bin/env python
"""
A simple script to verify the Python environment and Django installation.
"""
import sys
import os

def main():
    # Print basic environment information
    print("=" * 70)
    print("Python Environment Check")
    print("=" * 70)
    print(f"Python Version: {sys.version}")
    print(f"Executable: {sys.executable}")
    print(f"Working Directory: {os.getcwd()}")
    
    # Check Django installation
    try:
        import django
        print("\n✅ Django is installed")
        print(f"Django Version: {django.__version__}")
    except ImportError:
        print("\n❌ Django is not installed. Please install it with: pip install django")
        return 1
    
    print("\n✅ Environment check completed successfully!")
    return 0

if __name__ == "__main__":
    sys.exit(main())
import sys
import django
from django.conf import settings

def main():
    """Main function to test the Django environment."""
    print("=" * 70)
    print("Testing Django environment...")
    print("=" * 70)
    
    # Print Python version
    print(f"\nPython version: {sys.version}")
    
    # Check Django installation
    try:
        import django
        print(f"\nDjango version: {django.__version__}")
    except ImportError:
        print("\nERROR: Django is not installed!")
        print("Please install Django using: pip install django")
        return 1
    
    # Set up Django environment
    try:
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartfarm.settings.local')
        django.setup()
        print("\nDjango environment setup successful!")
        
        # Print some settings
        print("\nCurrent settings:")
        print(f"- DEBUG: {settings.DEBUG}")
        print(f"- DATABASES: {settings.DATABASES['default']['ENGINE']}")
        print(f"- INSTALLED_APPS: {len(settings.INSTALLED_APPS)} apps installed")
        
        # Try to import the User model
        from django.contrib.auth import get_user_model
        User = get_user_model()
        print("\nUser model successfully imported!")
        
        # Try to run a simple database query
        try:
            user_count = User.objects.count()
            print(f"\nNumber of users in database: {user_count}")
        except Exception as e:
            print(f"\nERROR: Database query failed: {e}")
            print("Please make sure your database is properly configured.")
            return 1
        
        return 0
        
    except Exception as e:
        print(f"\nERROR: Failed to set up Django environment: {e}")
        print("\nPlease check your settings and make sure all required apps are installed.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
