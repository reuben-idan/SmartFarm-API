#!/usr/bin/env python
"""
Comprehensive test runner with detailed error reporting.
"""
import os
import sys
import logging
from pathlib import Path

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('test_runner.log')
    ]
)
logger = logging.getLogger(__name__)

def setup_environment():
    """Set up the Python environment and Django settings."""
    try:
        # Add project root to Python path
        project_root = os.path.dirname(os.path.abspath(__file__))
        if project_root not in sys.path:
            sys.path.insert(0, project_root)
        logger.info(f"Project root added to path: {project_root}")
        
        # Set Django settings
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.test')
        logger.info(f"DJANGO_SETTINGS_MODULE set to: {os.environ['DJANGO_SETTINGS_MODULE']}")
        
        import django
        from django.conf import settings
        
        logger.info(f"Django version: {django.__version__}")
        logger.info(f"Using settings: {settings.SETTINGS_MODULE}")
        
        # Initialize Django
        django.setup()
        logger.info("Django setup complete")
        
        return True
        
    except Exception as e:
        logger.error(f"Error setting up environment: {e}", exc_info=True)
        return False

def run_tests():
    """Run the test suite."""
    try:
        from django.test.runner import DiscoverRunner
        from django.conf import settings
        
        logger.info("Starting test suite...")
        test_runner = DiscoverRunner(verbosity=2)
        failures = test_runner.run_tests(['apps.farmers.tests'])
        
        if failures:
            logger.error(f"Tests failed with {failures} failure(s)")
        else:
            logger.info("All tests passed!")
            
        return failures
        
    except Exception as e:
        logger.error(f"Error running tests: {e}", exc_info=True)
        return 1

def main():
    """Main entry point for the test runner."""
    logger.info("=" * 60)
    logger.info("Starting test runner")
    logger.info("=" * 60)
    
    if not setup_environment():
        logger.error("Failed to set up environment. Exiting.")
        return 1
        
    return run_tests()

if __name__ == '__main__':
    sys.exit(bool(main()))
