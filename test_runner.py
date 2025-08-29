#!/usr/bin/env python
"""
Comprehensive test runner for SmartFarm API tests.
"""
import os
import sys
import django
from django.conf import settings
from django.test.utils import get_runner

def setup_test_environment():
    """Set up the test environment."""
    # Set the Django settings module
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartfarm.settings.local')
    
    # Configure Django
    django.setup()
    
    # Configure test settings
    settings.DEBUG = False
    settings.TESTING = True
    
    # Use in-memory SQLite database for tests
    settings.DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': ':memory:',
        }
    }
    
    # Use console email backend for tests
    settings.EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

def run_tests():
    """Run the test suite."""
    # Set up the test environment
    setup_test_environment()
    
    # Get the test runner
    TestRunner = get_runner(settings)
    test_runner = TestRunner(
        verbosity=2,
        interactive=True,
        failfast=False
    )
    
    # Run the tests
    print("\n" + "="*70)
    print("Starting test suite...")
    print("="*70 + "\n")
    
    # Run all tests in the users app
    failures = test_runner.run_tests(['users'])
    
    print("\n" + "="*70)
    if failures:
        print(f"\n{'-'*30} TEST SUMMARY {'-'*30}")
        print(f"Tests failed with {failures} failure(s)")
        print("-"*75 + "\n")
        sys.exit(1)
    else:
        print(f"\n{'-'*30} TEST SUMMARY {'-'*30}")
        print("All tests passed successfully!")
        print("-"*75 + "\n")
        sys.exit(0)

if __name__ == '__main__':
    run_tests()
