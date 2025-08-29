#!/usr/bin/env python
"""
Debug script to run Django tests with proper environment setup.
"""
import os
import sys
import django

def run_tests():
    # Add the project root to the Python path
    project_root = os.path.dirname(os.path.abspath(__file__))
    if project_root not in sys.path:
        sys.path.insert(0, project_root)
    
    # Set the Django settings module
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.test')
    
    try:
        # Setup Django
        django.setup()
        print("Django setup complete")
        
        # Import test utilities
        from django.test.utils import get_runner
        from django.conf import settings
        
        # Create test database and run tests
        TestRunner = get_runner(settings)
        test_runner = TestRunner(verbosity=2)
        
        # Run tests and get the number of failures
        failures = test_runner.run_tests(['apps.farmers.tests'])
        
        # Exit with non-zero code if tests failed
        sys.exit(bool(failures))
        
    except Exception as e:
        print(f"Error running tests: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    run_tests()
