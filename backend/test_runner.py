# test_runner.py
import os
import sys
import django
from django.conf import settings

def run_tests():
    # Set up Django environment
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.test')
    
    # Add the project root to the Python path
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sys.path.insert(0, os.path.join(BASE_DIR, 'backend'))

    # Initialize Django
    django.setup()
    
    # Import the test module directly
    from django.test.utils import get_runner
    from django.conf import settings
    
    # Get test runner
    TestRunner = get_runner(settings)
    test_runner = TestRunner(verbosity=2)
    
    # Run the specific test file
    test_result = test_runner.run_tests(['apps.farmers.tests.test_setup'])
    
    # Exit with proper status code
    sys.exit(bool(test_result.failures or test_result.errors))

if __name__ == '__main__':
    run_tests()