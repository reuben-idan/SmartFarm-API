#!/usr/bin/env python
"""
Final test runner that ensures the project root is in the Python path.
"""
import os
import sys

# Add the project root to the Python path
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(PROJECT_ROOT, 'backend')

# Add both project root and backend to path
for path in [PROJECT_ROOT, BACKEND_DIR]:
    if path not in sys.path:
        sys.path.insert(0, path)

print(f"Python path: {sys.path}")

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.test')
print(f"DJANGO_SETTINGS_MODULE: {os.environ['DJANGO_SETTINGS_MODULE']}")

try:
    import django
    from django.conf import settings
    from django.test.utils import get_runner
    
    print(f"Django version: {django.__version__}")
    
    # Initialize Django
    django.setup()
    
    # Configure test database
    settings.DATABASES['default'] = {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
    
    # Run tests
    TestRunner = get_runner(settings)
    test_runner = TestRunner(verbosity=2)
    
    print("Running tests...")
    failures = test_runner.run_tests(['apps.farmers.tests'])
    
    # Exit with non-zero code if tests failed
    sys.exit(bool(failures))
    
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    import traceback
    traceback.print_exc()
    sys.exit(1)
