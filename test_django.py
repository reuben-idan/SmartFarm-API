#!/usr/bin/env python
"""
Simple script to test Django test environment.
"""
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

try:
    import django
    from django.conf import settings
    from django.test.utils import setup_test_environment, teardown_test_environment
    from django.test.runner import DiscoverRunner
    
    print("=" * 60)
    print(f"Python: {sys.executable}")
    print(f"Django version: {django.__version__}")
    print(f"Using settings: {settings.SETTINGS_MODULE}")
    print("=" * 60)
    
    # Set up test environment
    setup_test_environment()
    
    # Configure test database
    settings.DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': ':memory:',
        }
    }
    
    # Run a simple test
    print("\nRunning a simple test...")
    from django.test import TestCase
    
    class SimpleTest(TestCase):
        def test_addition(self):
            self.assertEqual(1 + 1, 2)
    
    import unittest
    suite = unittest.TestLoader().loadTestsFromTestCase(SimpleTest)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    
    # Clean up
    teardown_test_environment()
    
    print("\nTest result:", "OK" if result.wasSuccessful() else "FAILED")
    sys.exit(not result.wasSuccessful())
    
except Exception as e:
    print(f"\nError: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
