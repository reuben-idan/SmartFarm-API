#!/usr/bin/env python
"""
Check Python and package versions for compatibility.
"""
import sys
import platform
import importlib.metadata

def get_package_version(package_name):
    """Get the version of an installed package."""
    try:
        return importlib.metadata.version(package_name)
    except importlib.metadata.PackageNotFoundError:
        return "Not installed"

def main():
    print("=" * 60)
    print("Environment Information")
    print("=" * 60)
    
    # System information
    print("\nSystem:")
    print(f"  OS: {platform.system()} {platform.release()}")
    print(f"  Python: {platform.python_version()} ({platform.python_implementation()})")
    print(f"  Executable: {sys.executable}")
    
    # Python path
    print("\nPython Path:")
    for path in sys.path:
        print(f"  {path}")
    
    # Package versions
    print("\nPackage Versions:")
    packages = [
        'django',
        'djangorestframework',
        'pytest',
        'pytest-django',
        'django-cors-headers',
        'django-filter',
        'djangorestframework-simplejwt'
    ]
    
    for package in packages:
        version = get_package_version(package)
        print(f"  {package}: {version}")
    
    # Django settings check
    try:
        import django
        from django.conf import settings
        print("\nDjango Settings:")
        print(f"  DJANGO_SETTINGS_MODULE: {os.environ.get('DJANGO_SETTINGS_MODULE', 'Not set')}")
        print(f"  DEBUG: {getattr(settings, 'DEBUG', 'Not found')}")
        print(f"  DATABASES: {getattr(settings, 'DATABASES', {}).get('default', {}).get('ENGINE', 'Not configured')}")
    except Exception as e:
        print(f"\nError checking Django settings: {e}")

if __name__ == '__main__':
    import os
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.test')
    main()
