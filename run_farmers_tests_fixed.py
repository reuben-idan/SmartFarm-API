#!/usr/bin/env python
"""
Test runner script that properly sets up the Python path.
"""
import os
import sys

# Add the project root to the Python path
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

def run_tests():
    """Run the Django test suite."""
    # Set the Django settings module
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.test')
    
    try:
        import django
        from django.conf import settings
        from django.test.utils import get_runner
        
        # Set up Django
        django.setup()
        
        # Create test database and run tests
        TestRunner = get_runner(settings)
        test_runner = TestRunner(verbosity=2)
        failures = test_runner.run_tests(['apps.farmers.tests'])
        
        return failures
        
    except Exception as e:
        print(f"Error running tests: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return 1

if __name__ == '__main__':
    sys.exit(bool(run_tests()))
