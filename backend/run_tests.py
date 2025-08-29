#!/usr/bin/env python
"""
Test runner script for the SmartFarm API.
"""
import os
import sys
import django
from django.conf import settings
from django.test.utils import get_runner

def run_tests():
    # Set the Django settings module
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.test')
    
    # Set up Django
    django.setup()
    
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
