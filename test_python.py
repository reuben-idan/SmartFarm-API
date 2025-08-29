#!/usr/bin/env python
"""
A simple test script to verify Python environment and basic imports.
"""
import sys

def main():
    """Main function to test the environment."""
    print("=" * 50)
    print("Python Environment Test")
    print("=" * 50)
    
    # Print Python information
    print(f"Python Version: {sys.version}")
    print(f"Executable: {sys.executable}")
    print(f"\nCurrent working directory: {os.getcwd()}")
    
    # Test Django import
    try:
        import django
        print("\n✅ Django is installed")
        print(f"Django Version: {django.__version__}")
    except ImportError:
        print("\n❌ Django is not installed. Please install it with: pip install django")
        return 1
    
    # Test other important imports
    try:
        import djangorestframework
        print("✅ Django REST Framework is installed")
    except ImportError:
        print("❌ Django REST Framework is not installed. Install with: pip install djangorestframework")
    
    try:
        import djangorestframework_simplejwt
        print("✅ djangorestframework-simplejwt is installed")
    except ImportError:
        print("❌ djangorestframework-simplejwt is not installed. Install with: pip install djangorestframework-simplejwt")
    
    print("\nEnvironment check completed!")
    return 0

if __name__ == "__main__":
    import os
    sys.exit(main())
