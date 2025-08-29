#!/usr/bin/env python
"""
Debug environment and Django setup.
"""
import os
import sys
import platform
import traceback

def print_header(title):
    """Print a formatted header."""
    print("\n" + "=" * 70)
    print(f" {title}")
    print("=" * 70)

def check_python():
    """Check Python environment."""
    print_header("PYTHON ENVIRONMENT")
    print(f"Python: {sys.version}")
    print(f"Executable: {sys.executable}")
    print(f"Platform: {platform.platform()}")
    print(f"Working Directory: {os.getcwd()}")
    print(f"Python Path: {sys.path}")

def check_django():
    """Check Django installation and settings."""
    print_header("DJANGO CHECK")
    
    # Check Django installation
    try:
        import django
        print(f"Django: {django.get_version()}")
    except ImportError as e:
        print(f"❌ Django import failed: {e}")
        return False
    
    # Try to set up Django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartfarm.settings.local')
    
    try:
        django.setup()
        print("✅ Django setup successful")
    except Exception as e:
        print(f"❌ Django setup failed: {e}")
        print("\nTraceback:")
        traceback.print_exc()
        return False
    
    return True

def check_database():
    """Check database connection."""
    print_header("DATABASE CHECK")
    
    try:
        from django.db import connection
        connection.ensure_connection()
        print("✅ Database connection successful")
        
        # Print database info
        print(f"Database: {connection.settings_dict['ENGINE']}")
        if 'sqlite' in connection.settings_dict['ENGINE']:
            print(f"Database file: {connection.settings_dict['NAME']}")
        else:
            print(f"Database name: {connection.settings_dict['NAME']}")
            print(f"Database user: {connection.settings_dict['USER']}")
            print(f"Database host: {connection.settings_dict['HOST']}")
        
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("\nTraceback:")
        traceback.print_exc()
        return False

def main():
    """Main function to run all checks."""
    check_python()
    
    if not check_django():
        return 1
        
    if not check_database():
        return 1
    
    print("\n✅ All checks passed!")
    return 0

if __name__ == "__main__":
    sys.exit(main())
