import sys
import os

print("=" * 60)
print("Python Environment Check")
print("=" * 60)
print(f"Python: {sys.executable}")
print(f"Version: {sys.version}")
print(f"Working dir: {os.getcwd()}")
print("\nPython path:")
for p in sys.path:
    print(f"  - {p}")

print("\n" + "=" * 60)
print("Django Check")
print("=" * 60)

try:
    # Set up Django environment
    os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings.test'
    import django
    from django.conf import settings
    
    print(f"Django version: {django.__version__}")
    print(f"Using settings: {settings.SETTINGS_MODULE}")
    
    # Initialize Django
    django.setup()
    print("Django setup complete")
    
    # Try to import the test
    try:
        from apps.farmers.tests.test_setup import SimpleTestCase
        print("Successfully imported SimpleTestCase")
        
        # Run a simple test
        import unittest
        suite = unittest.TestLoader().loadTestsFromTestCase(SimpleTestCase)
        result = unittest.TextTestRunner(verbosity=2).run(suite)
        
        print("\nTest result:", "OK" if result.wasSuccessful() else "FAILED")
        
    except Exception as e:
        print(f"Error importing/running test: {e}")
        import traceback
        traceback.print_exc()
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
