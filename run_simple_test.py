#!/usr/bin/env python
"""
Simple test runner for Django tests.
"""
import os
import sys

def run_tests():
    """Run the test suite."""
    # Set up the Django environment
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartfarm.settings.local')
    
    import django
    from django.conf import settings
    from django.test.utils import get_runner
    
    # Initialize Django
    django.setup()
    
    # Get test runner
    TestRunner = get_runner(settings)
    test_runner = TestRunner(verbosity=2)
    
    # Run tests
    failures = test_runner.run_tests(['users.tests.test_simple'])
    
    # Return non-zero exit code if tests failed
    sys.exit(bool(failures))

if __name__ == '__main__':
    run_tests()
