#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
import socket

def check_port(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) != 0

def main():
    """Run administrative tasks."""
    print("Starting Django server with debug information...")
    
    # Set default settings module
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
    
    # Check if port is available
    port = 8080
    if not check_port(port):
        print(f"\nERROR: Port {port} is already in use. Please close any other servers using this port.\n")
        sys.exit(1)
    
    try:
        import django
        print(f"Django version: {django.__version__}")
        
        from django.conf import settings
        print(f"Using settings module: {settings.SETTINGS_MODULE}")
        
        from django.core.management import execute_from_command_line
        
        # Print database info
        db = settings.DATABASES['default']
        print(f"Database: {db['ENGINE']} - {db['NAME']}")
        
        # Start the server with more details
        print(f"\nStarting development server at http://127.0.0.1:{port}/")
        print("Quit the server with CTRL-BREAK.\n")
        
        execute_from_command_line([sys.argv[0], 'runserver', f'127.0.0.1:{port}', '--noreload', '--verbosity', '3'])
        
    except Exception as e:
        print(f"\nERROR: {str(e)}\n")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
