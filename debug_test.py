#!/usr/bin/env python
"""Debug script to identify test execution issues."""
import os
import sys
import logging

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

def log_step(step):
    """Log a step with visual separation."""
    logger.info("\n" + "=" * 50)
    logger.info(f" {step} ")
    logger.info("=" * 50)

def main():
    """Main function to debug test execution."""
    try:
        # Log environment information
        log_step("ENVIRONMENT INFORMATION")
        logger.info(f"Python executable: {sys.executable}")
        logger.info(f"Python version: {sys.version}")
        logger.info(f"Current working directory: {os.getcwd()}")
        logger.info(f"System path: {sys.path}")
        
        # Check if we can import Django
        log_step("CHECKING DJANGO")
        try:
            import django
            logger.info(f"Django version: {django.get_version()}")
            
            # Try to set up Django
            os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.test')
            try:
                django.setup()
                logger.info("Django setup successful!")
            except Exception as e:
                logger.error(f"Django setup failed: {e}", exc_info=True)
                return
        except ImportError:
            logger.error("Django is not installed or not in PYTHONPATH")
            return
        
        # Try to import test modules
        log_step("IMPORTING TEST MODULES")
        test_modules = [
            'apps.farmers.tests.test_models',
            'apps.farmers.tests.test_serializers'
        ]
        
        for module in test_modules:
            try:
                __import__(module)
                logger.info(f"Successfully imported {module}")
            except Exception as e:
                logger.error(f"Failed to import {module}: {e}", exc_info=True)
        
        # Try to run a simple test
        log_step("RUNNING SIMPLE TEST")
        import unittest
        
        class SimpleTest(unittest.TestCase):
            """Simple test case."""
            def test_addition(self):
                """Test addition."""
                self.assertEqual(1 + 1, 2)
        
        # Run the test
        suite = unittest.TestLoader().loadTestsFromTestCase(SimpleTest)
        runner = unittest.TextTestRunner(stream=sys.stdout, verbosity=2)
        result = runner.run(suite)
        
        log_step("TEST EXECUTION COMPLETE")
        logger.info(f"Tests run: {result.testsRun}")
        logger.info(f"Failures: {len(result.failures)}")
        logger.info(f"Errors: {len(result.errors)}")
        
    except Exception as e:
        log_step("UNEXPECTED ERROR")
        logger.error(f"An unexpected error occurred: {e}", exc_info=True)
    
    input("\nPress Enter to exit...")

if __name__ == "__main__":
    main()
