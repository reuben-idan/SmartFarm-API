import os
import sys

# Add the project root to the Python path
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(PROJECT_ROOT, 'backend')

# Add both project root and backend to path
for path in [PROJECT_ROOT, BACKEND_DIR]:
    if path not in sys.path:
        sys.path.insert(0, path)

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.test')

print("=" * 60)
print("Environment Information")
print("=" * 60)
print(f"Python: {sys.executable}")
print(f"Version: {sys.version}")
print(f"Working Directory: {os.getcwd()}")
print(f"DJANGO_SETTINGS_MODULE: {os.environ.get('DJANGO_SETTINGS_MODULE')}")
print("\nPython path:")
for p in sys.path:
    print(f"  - {p}")

print("\n" + "=" * 60)
print("Django Setup")
print("=" * 60)

try:
    import django
    from django.conf import settings
    
    print(f"Django version: {django.__version__}")
    print(f"Using settings: {settings.SETTINGS_MODULE}")
    
    # Initialize Django
    django.setup()
    print("Django setup complete!")
    
    # Check if we can import the farmers app
    try:
        from apps.farmers.models import FarmerProfile
        print("Successfully imported FarmerProfile model!")
    except Exception as e:
        print(f"Error importing FarmerProfile: {e}")
    
    # Run a simple test
    print("\nRunning a simple test...")
    from django.test import TestCase
    
    class SimpleTest(TestCase):
        def test_addition(self):
            self.assertEqual(1 + 1, 2)
    
    import unittest
    suite = unittest.TestLoader().loadTestsFromTestCase(SimpleTest)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    
    print("\nTest result:", "OK" if result.wasSuccessful() else "FAILED")
    
except Exception as e:
    print(f"\nError: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
