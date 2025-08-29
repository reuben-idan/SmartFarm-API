#!/usr/bin/env python
"""
Simple script to check if Django can be properly initialized.
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
        print(f"Using database: {settings.DATABASES['default']['ENGINE']}")
        
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return 1
    
    return 0

if __name__ == '__main__':
    sys.exit(main())
