#!/usr/bin/env python
"""
Test runner script that configures Django settings and runs tests.
"""
import os
import sys
import django
from django.conf import settings
from django.test.utils import get_runner

def run_tests(*test_args):
    if not test_args:
        test_args = ['apps.farmers.tests', 'apps.yields.tests']
    
    # Configure Django settings
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.test')
    django.setup()
    
    # Get test runner
    TestRunner = get_runner(settings)
    test_runner = TestRunner(verbosity=2, interactive=True)
    
    # Run tests
    failures = test_runner.run_tests(test_args)
    
    # Exit with appropriate status code
    sys.exit(bool(failures))

if __name__ == '__main__':
    run_tests(*sys.argv[1:])
