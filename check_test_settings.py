import os
import sys

# Add the project root to the Python path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_DIR = os.path.join(PROJECT_ROOT, 'backend')

# Add both project root and backend to path
for path in [PROJECT_ROOT, BACKEND_DIR]:
    if path not in sys.path:
        sys.path.insert(0, path)

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.test')

try:
    import django
    from django.conf import settings
    
    print("=" * 60)
    print("Django Settings Check")
    print("=" * 60)
    print(f"Django version: {django.__version__}")
    print(f"Using settings: {settings.SETTINGS_MODULE}")
    print(f"INSTALLED_APPS: {len(settings.INSTALLED_APPS)} apps")
    
    # Check if farmers app is in INSTALLED_APPS
    farmers_app = next((app for app in settings.INSTALLED_APPS if 'farmers' in app), None)
    print(f"Farmers app in INSTALLED_APPS: {farmers_app}")
    
    # Check database configuration
    print("\nDatabase Configuration:")
    for db_name, db_config in settings.DATABASES.items():
        print(f"{db_name}: {db_config['ENGINE']}")
    
    # Check test runner
    print(f"\nTEST_RUNNER: {getattr(settings, 'TEST_RUNNER', 'django.test.runner.DiscoverRunner')}")
    
except Exception as e:
    print(f"\nError: {e}")
    import traceback
    traceback.print_exc()
