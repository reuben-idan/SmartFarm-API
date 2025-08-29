#!/usr/bin/env python
"""
Dedicated test runner for farmers app tests.
"""
import os
import sys

def main():
    # Set up the environment
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.test')
    
    # Add the project root to the Python path
    project_root = os.path.dirname(os.path.abspath(__file__))
    if project_root not in sys.path:
        sys.path.insert(0, project_root)
    
    try:
        import django
        from django.conf import settings
        from django.test.utils import get_runner
        
        print(f"Django version: {django.__version__}")
        print(f"Using settings: {settings.SETTINGS_MODULE}")
        
        # Setup Django
        django.setup()
        
        # Get test runner
        TestRunner = get_runner(settings)
        test_runner = TestRunner(verbosity=2)
        
        # Run tests
        failures = test_runner.run_tests(['apps.farmers.tests'])
        
        # Exit with non-zero code if tests failed
        sys.exit(bool(failures))
        
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
