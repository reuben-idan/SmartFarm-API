#!/usr/bin/env python
"""
Run farmers app tests directly without starting the development server.
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

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.test')

try:
    import django
    from django.conf import settings
    from django.test.utils import get_runner
    
    print("=" * 60)
    print(f"Running tests with Django {django.__version__}")
    print(f"Python {sys.version}")
    print(f"Working directory: {os.getcwd()}")
    print("=" * 60)
    
    # Configure test database
    settings.DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': ':memory:',
        }
    }
    
    # Initialize Django
    django.setup()
    
    # Run tests
    TestRunner = get_runner(settings)
    test_runner = TestRunner(verbosity=2)
    
    # Run only the farmers tests
    print("\nRunning farmers tests...")
    failures = test_runner.run_tests(['apps.farmers.tests.test_setup'])
    
    # Exit with non-zero code if tests failed
    sys.exit(bool(failures))
    
except Exception as e:
    print(f"\nError: {e}", file=sys.stderr)
    import traceback
    traceback.print_exc()
    sys.exit(1)
