#!/usr/bin/env python
"""
Fixed test runner that ensures the project root is in the Python path.
"""
import os
import sys

# Add the project root to the Python path
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, PROJECT_ROOT)

# Now import Django and run tests
try:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.test')
    
    import django
    from django.conf import settings
    from django.test.utils import get_runner
    
    # Initialize Django
    django.setup()
    
    # Run tests
    TestRunner = get_runner(settings)
    test_runner = TestRunner(verbosity=2)
    failures = test_runner.run_tests(['apps.farmers.tests'])
    
    # Exit with non-zero code if tests failed
    sys.exit(bool(failures))
    
except Exception as e:
    print(f"Error running tests: {e}", file=sys.stderr)
    import traceback
    traceback.print_exc()
    sys.exit(1)
