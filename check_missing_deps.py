#!/usr/bin/env python
"""
Check for missing dependencies in the project.
"""
import sys
import importlib

def check_dependencies():
    # List of required packages
    required = [
        'django',
        'djangorestframework',
        'djangorestframework_simplejwt',
        'django_environ',
        'drf_spectacular',
        'django_filter',
        'django_cors_headers',
        'PyYAML',
        'uritemplate',
        'black',
        'isort',
        'flake8',
        'pre_commit',
        'Faker',
        'django_celery_beat',
        'django_celery_results',
        'debug_toolbar',
    ]
    
    missing = []
    for package in required:
        try:
            importlib.import_module(package.replace('-', '_'))
            print(f"✅ {package} is installed")
        except ImportError:
            print(f"❌ {package} is missing")
            missing.append(package)
    
    if missing:
        print(f"\nMissing packages: {', '.join(missing)}")
        print("\nInstall them with:")
        print("pip install " + " ".join(missing))
        return 1
    else:
        print("\n✅ All required packages are installed!")
        return 0

if __name__ == "__main__":
    sys.exit(check_dependencies())
