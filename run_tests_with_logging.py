import os
import sys
import logging
from pathlib import Path

# Set up logging
log_file = Path('test_log.txt')
if log_file.exists():
    log_file.unlink()

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('test_log.txt'),
        logging.StreamHandler()
    ]
)

def log_environment():
    """Log environment information."""
    logging.info("Environment Information")
    logging.info("=" * 50)
    logging.info(f"Python: {sys.version}")
    logging.info(f"Working Dir: {os.getcwd()}")
    logging.info(f"Python Path: {sys.path}")

    try:
        import django
        logging.info(f"Django: {django.__version__}")
    except ImportError as e:
        logging.error(f"Django import error: {e}")
        return False
    
    return True

def run_django_tests():
    """Run Django tests with detailed logging."""
    try:
        # Set up Django
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.test')
        import django
        django.setup()
        
        from django.test.runner import DiscoverRunner
        from django.conf import settings
        
        logging.info("Running Django tests...")
        logging.info(f"Using settings: {settings.SETTINGS_MODULE}")
        logging.info(f"INSTALLED_APPS: {settings.INSTALLED_APPS}")
        
        # Run tests
        test_runner = DiscoverRunner(verbosity=2)
        failures = test_runner.run_tests(['apps.farmers.tests'])
        
        return failures == 0
    except Exception as e:
        logging.exception("Error running tests:")
        return False

def main():
    """Main function to run tests with logging."""
    if not log_environment():
        return 1
        
    success = run_django_tests()
    return 0 if success else 1

if __name__ == '__main__':
    sys.exit(main())
