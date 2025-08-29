#!/usr/bin/env python
"""
Run authentication tests for the SmartFarm API.
"""import os
import sys
import django
from django.conf import settings

def run_tests():
    """Run the authentication tests."""
    # Set up the Django environment
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartfarm.settings.local')
    django.setup()
    
    # Import TestRunner after Django setup
    from django.test.runner import DiscoverRunner
    
    # Run the tests
    test_runner = DiscoverRunner(verbosity=2, failfast=True)
    failures = test_runner.run_tests(['users.tests.test_authentication'])
    
    # Return non-zero exit code if tests failed
    sys.exit(bool(failures))

if __name__ == '__main__':
    run_tests()
