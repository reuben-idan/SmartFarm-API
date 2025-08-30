#!/usr/bin/env python
"""Run farmer tests with detailed output."""
import os
import sys
import django
from django.conf import settings

def setup_django():
    """Configure Django settings and initialize Django."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.test')
    try:
        django.setup()
        print("Django setup successful!")
        return True
    except Exception as e:
        print(f"Failed to setup Django: {e}")
        return False

def run_tests():
    """Run the farmer tests."""
    from django.test.utils import get_runner
    
    print("\n" + "="*50)
    print(" RUNNING FARMER TESTS ")
    print("="*50 + "\n")
    
    TestRunner = get_runner(settings)
    test_runner = TestRunner(verbosity=2, interactive=False)
    
    # Run only the farmer tests
    test_labels = ['apps.farmers.tests']
    
    print(f"Running tests with: {test_runner.__class__.__name__}")
    print(f"Test labels: {test_labels}")
    
    try:
        failures = test_runner.run_tests(test_labels)
        print("\n" + "="*50)
        print(f" TESTS COMPLETED WITH {failures} FAILURES ")
        print("="*50 + "\n")
        return failures == 0
    except Exception as e:
        print(f"\nError running tests: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    # Add the project root to Python path
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend'))
    if project_root not in sys.path:
        sys.path.insert(0, project_root)
    
    print(f"Project root: {project_root}")
    
    if not setup_django():
        sys.exit(1)
    
    success = run_tests()
    sys.exit(0 if success else 1)
