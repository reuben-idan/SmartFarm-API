#!/usr/bin/env python
"""
Start the Django development server.
"""
import os
import sys

def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartfarm.settings.local')
    
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed?"
        ) from exc
    
    # Run the development server
    execute_from_command_line(['manage.py', 'runserver'])

if __name__ == '__main__':
    main()
