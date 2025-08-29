#!/usr/bin/env python
"""Test script that writes output to a file."""
import os
import sys

def main():
    """Write test output to a file."""
    with open('test_output.txt', 'w') as f:
        f.write("=== Test Output ===\n")
        f.write(f"Python: {sys.version}\n")
        f.write(f"Working Directory: {os.getcwd()}\n")
        
        try:
            import django
            f.write(f"Django version: {django.__version__}\n")
            
            # Set up Django
            os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.test')
            import django
            django.setup()
            
            from django.conf import settings
            f.write(f"Django settings: {settings.SETTINGS_MODULE}\n")
            
            # Test database connection
            from django.db import connection
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                result = cursor.fetchone()
                f.write(f"Database test: {result[0] == 1}\n")
                
            f.write("All tests completed successfully!\n")
            
        except Exception as e:
            import traceback
            f.write("\n=== Error ===\n")
            f.write(str(e) + "\n")
            f.write(traceback.format_exc())

if __name__ == "__main__":
    main()
