#!/usr/bin/env python
"""
Run tests with detailed debug output.
"""
import os
import sys
import logging

# Set up logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('test_debug.log')
    ]
)
logger = logging.getLogger(__name__)

def main():
    # Add the project root to the Python path
    PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
    BACKEND_DIR = os.path.join(PROJECT_ROOT, 'backend')
    
    logger.info(f"Project root: {PROJECT_ROOT}")
    logger.info(f"Backend dir: {BACKEND_DIR}")
    
    # Add both project root and backend to path
    for path in [PROJECT_ROOT, BACKEND_DIR]:
        if path not in sys.path:
            sys.path.insert(0, path)
    
    logger.info("Python path:")
    for p in sys.path:
        logger.info(f"  - {p}")
    
    # Set Django settings module
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.test')
    logger.info(f"DJANGO_SETTINGS_MODULE: {os.environ['DJANGO_SETTINGS_MODULE']}")
    
    try:
        import django
        logger.info(f"Django version: {django.__version__}")
        
        from django.conf import settings
        logger.info(f"Using settings: {settings.SETTINGS_MODULE}")
        
        # Initialize Django
        django.setup()
        logger.info("Django setup complete")
        
        # Run tests
        from django.test.utils import get_runner
        
        # Configure test database
        settings.DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': ':memory:',
            }
        }
        
        TestRunner = get_runner(settings)
        test_runner = TestRunner(verbosity=2)
        
        logger.info("Running tests...")
        failures = test_runner.run_tests(['apps.farmers.tests.test_setup'])
        
        logger.info(f"Tests completed with {failures} failures")
        sys.exit(bool(failures))
        
    except Exception as e:
        logger.error(f"Error: {e}", exc_info=True)
        sys.exit(1)

if __name__ == "__main__":
    main()
