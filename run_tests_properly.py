#!/usr/bin/env python
"""
Test runner that ensures proper Python path and Django settings.
"""
import os
import sys

# Add the project root to the Python path
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

# Add the backend directory to the Python path
BACKEND_DIR = os.path.join(PROJECT_ROOT, 'backend')
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

print(f"Python path: {sys.path}")

try:
    # Set Django settings
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.test')
    print(f"DJANGO_SETTINGS_MODULE: {os.environ['DJANGO_SETTINGS_MODULE']}")
    
    import django
    from django.conf import settings
    from django.test.utils import get_runner
    
    print(f"Django version: {django.__version__}")
    print(f"Using settings: {settings.SETTINGS_MODULE}")
    
    # Initialize Django
    django.setup()
    
    # Run tests
    TestRunner = get_runner(settings)
    test_runner = TestRunner(verbosity=2)
    
    print("Running tests...")
    failures = test_runner.run_tests(['apps.farmers.tests'])
    
    # Exit with non-zero code if tests failed
    sys.exit(bool(failures))
    
except Exception as e:
    print(f"Error running tests: {e}", file=sys.stderr)
    import traceback
    traceback.print_exc()
    sys.exit(1)
