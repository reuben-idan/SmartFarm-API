#!/usr/bin/env python
"""
Direct test runner that bypasses the custom manage.py behavior.
"""
import os
import sys

def main():
    # Set the Django settings module
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.test')
    
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    
    # Run the test command directly
    execute_from_command_line([sys.argv[0], 'test', 'apps.farmers.tests.test_simple', '-v', '2'])

if __name__ == '__main__':
    main()
