#!/usr/bin/env python
"""
Test runner for SmartFarm API tests.
"""
import os
import sys
import django
from django.conf import settings

def run_tests():
    """Run the test suite."""
    # Set up the Django environment
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartfarm.settings.test')
    django.setup()
    
    # Import TestRunner after Django setup
    from django.test.utils import get_runner
    from django.conf import settings
    
    # Run the tests
    TestRunner = get_runner(settings)
    test_runner = TestRunner(verbosity=2, interactive=True, failfast=False)
    
    # Run all tests in the users app
    failures = test_runner.run_tests(['users'])
    
    # Return non-zero exit code if tests failed
    sys.exit(bool(failures))

if __name__ == '__main__':
    run_tests()
