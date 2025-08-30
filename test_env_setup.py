#!/usr/bin/env python
"""
Test script to verify Python and Django environment setup.
"""
import os
import sys

def write_output(filename, content):
    """Write content to a file."""
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

def main():
    """Main function to test environment setup."""
    output = []
    output.append("=" * 60)
    output.append("Environment Setup Test")
    output.append("=" * 60)
    
    # Print Python information
    output.append("\nPython Information:")
    output.append(f"Executable: {sys.executable}")
    output.append(f"Version: {sys.version}")
    output.append(f"Path: {sys.path}")
    
    # Check Django installation
    try:
        import django
        output.append("\nDjango Information:")
        output.append(f"Version: {django.__version__}")
    except ImportError as e:
        output.append(f"\nError importing Django: {e}")
        write_output('env_test_output.txt', '\n'.join(output))
        return 1
    
    # Try to set up Django
    try:
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.test')
        django.setup()
        
        from django.conf import settings
        output.append("\nDjango Settings:")
        output.append(f"Settings module: {settings.SETTINGS_MODULE}")
        output.append(f"Installed apps: {len(settings.INSTALLED_APPS)} apps")
        output.append(f"Database: {settings.DATABASES['default']['ENGINE']}")
        
    except Exception as e:
        output.append(f"\nError setting up Django: {e}")
        import traceback
        output.append("\nTraceback:")
        output.append(traceback.format_exc())
        write_output('env_test_output.txt', '\n'.join(output))
        return 1
    
    # Write output to file
    write_output('env_test_output.txt', '\n'.join(output))
    return 0

if __name__ == "__main__":
    sys.exit(main())
