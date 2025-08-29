#!/usr/bin/env python
"""
Check if Django can be imported and configured correctly.
"""
import os
import sys

def main():
    # Add the project root to the Python path
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if project_root not in sys.path:
        sys.path.insert(0, project_root)
    
    # Set the Django settings module
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.test')
    
    try:
        import django
        print("Django imported successfully")
        
        django.setup()
        print("Django setup complete")
        
        from django.conf import settings
        print(f"Using settings: {settings.SETTINGS_MODULE}")
        print(f"Database: {settings.DATABASES['default']['ENGINE']}")
        
        # Try to import the test
        from apps.farmers.tests import test_simple
        print("Test module imported successfully")
        
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return 1
    
    return 0

if __name__ == '__main__':
    sys.exit(main())
