#!/usr/bin/env python
"""
Simple test script to verify Django test setup.
"""
import os
import sys

def main():
    # Set up the environment
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.test')
    
    try:
        import django
        print("Django version:", django.__version__)
        
        django.setup()
        print("Django setup complete")
        
        from django.conf import settings
        print("Using settings:", settings.SETTINGS_MODULE)
        print("Database:", settings.DATABASES['default']['ENGINE'])
        
        # Run a simple test
        from django.test import TestCase
        
        class SimpleTest(TestCase):
            def test_addition(self):
                print("Running test_addition...")
                self.assertEqual(1 + 1, 2)
        
        from django.test.runner import DiscoverRunner
        test_runner = DiscoverRunner(verbosity=2)
        print("Running tests...")
        failures = test_runner.run_tests(['__main__'])
        
        print(f"\nTests completed with {failures} failures")
        sys.exit(1 if failures else 0)
        
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
