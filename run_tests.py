#!/usr/bin/env python
"""Test runner for SmartFarm API tests."""
import os
import sys
import django
from django.conf import settings
from django.test.utils import get_runner

def run_tests():
    os.environ['DJANGO_SETTINGS_MODULE'] = 'test_settings'
    django.setup()
    
    TestRunner = get_runner(settings)
    test_runner = TestRunner(verbosity=2, interactive=False)
    
    # Run all tests
    failures = test_runner.run_tests(['apps.farmers'])
    return failures

if __name__ == '__main__':
    # Add project root to Python path
    sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
    failures = run_tests()
    sys.exit(bool(failures))
