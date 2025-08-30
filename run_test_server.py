#!/usr/bin/env python
"""Run a test server to verify the application setup."""
import os
import sys
import django
from django.core.management import call_command

def main():
    """Run the development server with test settings."""
    # Set the default settings module
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.test')
    
    try:
        # Setup Django
        django.setup()
        print("✅ Django setup successful!")
        
        # Run the test server
        print("\nStarting test server...")
        print("Press Ctrl+C to stop the server.\n")
        call_command('runserver', '127.0.0.1:8000', '--noreload')
        
    except Exception as e:
        print(f"\n❌ Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return 1
    
    return 0

if __name__ == "__main__":
    # Add the project root to Python path
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend'))
    if project_root not in sys.path:
        sys.path.insert(0, project_root)
    
    sys.exit(main())
