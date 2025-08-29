#!/usr/bin/env python
"""
Test runner script specifically for farmer tests.
"""
import os
import sys

def run_tests():
    # Set the Django settings module
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.test')
    
    # Set up Django
    import django
    django.setup()
    
    # Import test utilities
    from django.test.utils import get_runner
    from django.conf import settings
    
    # Get test runner class
    TestRunner = get_runner(settings)
    
    # Create test runner instance
    test_runner = TestRunner(verbosity=2, interactive=True)
    
    # Run tests
    failures = test_runner.run_tests(['apps.farmers.tests'])
    
    # Exit with appropriate status code
    sys.exit(bool(failures))

if __name__ == '__main__':
    run_tests()
