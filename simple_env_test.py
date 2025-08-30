#!/usr/bin/env python
"""Simple environment test script."""
import sys
import os

def write_to_file(filename, content):
    """Write content to a file."""
    try:
        with open(filename, 'w') as f:
            f.write(content)
        print(f"✅ Successfully wrote to {filename}")
        return True
    except Exception as e:
        print(f"❌ Failed to write to {filename}: {e}")
        return False

def main():
    """Main function to test environment."""
    print("="*50)
    print(" ENVIRONMENT TEST ")
    print("="*50 + "\n")
    
    # Basic info
    print(f"Python Executable: {sys.executable}")
    print(f"Python Version: {sys.version}")
    print(f"Working Directory: {os.getcwd()}")
    print(f"Platform: {sys.platform}")
    
    # Test file system access
    print("\nTesting file system access...")
    test_file = "test_write.tmp"
    write_success = write_to_file(test_file, "test content")
    
    if os.path.exists(test_file):
        try:
            os.remove(test_file)
            print("✅ Successfully cleaned up test file")
        except Exception as e:
            print(f"⚠️  Failed to clean up test file: {e}")
    
    # Try to import Django
    print("\nTesting Django import...")
    try:
        import django
        print(f"✅ Django version: {django.get_version()}")
        django_imported = True
    except ImportError as e:
        print(f"❌ Django import failed: {e}")
        django_imported = False
    
    # Try to import rest_framework if Django is available
    if django_imported:
        print("\nTesting Django REST framework import...")
        try:
            import rest_framework
            print(f"✅ Django REST framework version: {rest_framework.__version__}")
        except ImportError as e:
            print(f"❌ Django REST framework import failed: {e}")
    
    print("\n" + "="*50)
    print(" ENVIRONMENT TEST COMPLETE ")
    print("="*50 + "\n")
    
    if not write_success or not django_imported:
        print("⚠️  Some tests failed. Please check the output above.")
        return 1
    
    print("✅ All tests passed!")
    return 0

if __name__ == "__main__":
    sys.exit(main())
