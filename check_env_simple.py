#!/usr/bin/env python
"""
Simple script to check Python and Django environment.
"""
import sys
import os

print("=" * 60)
print("Python Environment Check")
print("=" * 60)
print(f"Python: {sys.executable}")
print(f"Version: {sys.version}")
print(f"Working dir: {os.getcwd()}")
print("\nPython path:")
for p in sys.path:
    print(f"  - {p}")

print("\n" + "=" * 60)
print("Django Check")
print("=" * 60)

try:
    import django
    print(f"Django version: {django.__version__}")
    
    # Try to set up Django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.test')
    django.setup()
    
    from django.conf import settings
    print(f"Using settings: {settings.SETTINGS_MODULE}")
    print(f"INSTALLED_APPS: {len(settings.INSTALLED_APPS)} apps")
    
    # Check if farmers app is installed
    farmers_app = next((app for app in settings.INSTALLED_APPS if 'farmers' in app), None)
    print(f"Farmers app in INSTALLED_APPS: {farmers_app}")
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
