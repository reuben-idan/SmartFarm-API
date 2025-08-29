#!/usr/bin/env python
"""Script to check Django test environment."""
import os
import sys
import django
from django.conf import settings

def main():
    print("Setting up Django test environment...")
    
    # Set up Django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.test')
    
    try:
        django.setup()
        print("Django setup completed successfully!")
    except Exception as e:
        print(f"Error setting up Django: {e}")
        return 1
    
    # Run a simple test
    from django.test import TestCase
    
    class SimpleTest(TestCase):
        def test_simple(self):
            print("Running simple test...")
            self.assertTrue(True)
    
    print("Running tests...")
    from django.test.runner import DiscoverRunner
    test_runner = DiscoverRunner(verbosity=2)
    failures = test_runner.run_tests(['.'])
    
    return 0 if failures == 0 else 1

if __name__ == "__main__":
    sys.exit(main())
