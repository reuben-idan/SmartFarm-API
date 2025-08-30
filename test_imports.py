#!/usr/bin/env python
"""Test if we can import the required modules."""
import sys
import os

def test_import(module_name):
    """Test if a module can be imported."""
    try:
        __import__(module_name)
        print(f"✅ Successfully imported {module_name}")
        return True
    except ImportError as e:
        print(f"❌ Failed to import {module_name}: {e}")
        return False
    except Exception as e:
        print(f"⚠️  Error importing {module_name}: {e}")
        return False

print("Testing imports...\n")

# Test core Python modules
core_modules = ['django', 'rest_framework', 'django_filters', 'django_rest_framework_simplejwt']
core_success = all(test_import(m) for m in core_modules)

print("\nTesting app imports...\n")

# Add project root to Python path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend'))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# Test app modules
app_modules = [
    'apps.farmers',
    'apps.farmers.models',
    'apps.farmers.serializers',
    'apps.farmers.tests'
]
app_success = all(test_import(m) for m in app_modules)

print("\nImport test complete!")
print(f"Core modules: {'✅' if core_success else '❌'}")
print(f"App modules: {'✅' if app_success else '❌'}")

if not (core_success and app_success):
    sys.exit(1)
