#!/usr/bin/env python
"""
Script to verify Django environment and test configuration.
"""
import os
import sys

def main():
    # Add the project root to the Python path
    project_root = os.path.dirname(os.path.abspath(__file__))
    if project_root not in sys.path:
        sys.path.insert(0, project_root)
    
    # Set the Django settings module
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.test')
    
    try:
        import django
        print("Django imported successfully")
        
        django.setup()
        print("Django setup complete")
        
        from django.conf import settings
        print(f"Using settings: {settings.SETTINGS_MODULE}")
        print(f"Database: {settings.DATABASES['default']['ENGINE']}")
        
        # Try to import the test
        from apps.farmers.tests import test_simple
        print("Test module imported successfully")
        
        # Try to run the test directly
        print("\nRunning test directly:")
        from django.test.utils import setup_test_environment
        from django.test.runner import DiscoverRunner
        
        setup_test_environment()
        test_runner = DiscoverRunner(verbosity=2)
        failures = test_runner.run_tests(['apps.farmers.tests.test_simple'])
        
        print(f"\nTests completed with {failures} failures")
        return 0 if failures == 0 else 1
        
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return 1

if __name__ == '__main__':
    sys.exit(main())
