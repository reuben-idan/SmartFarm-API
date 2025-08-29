import sys
import os

def main():
    print("Python Environment Test")
    print("=" * 40)
    print(f"Python Executable: {sys.executable}")
    print(f"Python Version: {sys.version}")
    print(f"Working Directory: {os.getcwd()}")
    
    # Try to import Django
    try:
        import django
        print(f"\nDjango Version: {django.__version__}")
    except ImportError:
        print("\nDjango is not installed")
        return
    
    # Try to set up Django
    try:
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.test')
        django.setup()
        from django.conf import settings
        print("\nDjango Settings:")
        print(f"INSTALLED_APPS: {len(settings.INSTALLED_APPS)} apps")
        print(f"DATABASES: {settings.DATABASES['default']['ENGINE']}")
    except Exception as e:
        print(f"\nError setting up Django: {e}")

if __name__ == '__main__':
    main()
