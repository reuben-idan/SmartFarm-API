import os
import sys

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.test')

# Add the project root to the Python path
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(PROJECT_ROOT, 'backend')
sys.path.insert(0, BACKEND_DIR)

try:
    import django
    from django.conf import settings
    from django.test.utils import setup_test_environment
    
    print("=" * 60)
    print(f"Python: {sys.executable}")
    print(f"Django version: {django.__version__}")
    print(f"Using settings: {settings.SETTINGS_MODULE}")
    print("=" * 60)
    
    # Set up test environment
    setup_test_environment()
    
    # Run a simple test
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
