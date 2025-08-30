#!/usr/bin/env python
"""Verify Python environment and basic test execution."""
import sys
import os
import platform

def print_section(title):
    """Print a section header."""
    print("\n" + "=" * 50)
    print(f" {title} ".center(50, '='))
    print("=" * 50)

def main():
    """Main function to verify environment."""
    # Basic environment info
    print_section("ENVIRONMENT INFORMATION")
    print(f"Platform: {platform.platform()}")
    print(f"Python Executable: {sys.executable}")
    print(f"Python Version: {sys.version}")
    print(f"Working Directory: {os.getcwd()}")
    
    # Check if we can write to the current directory
    try:
        test_file = "test_write.tmp"
        with open(test_file, "w") as f:
            f.write("test")
        os.remove(test_file)
        print("\nFile system access: WRITE OK")
    except Exception as e:
        print(f"\nFile system access ERROR: {e}")
    
    # Try to import Django
    print_section("DJANGO CHECK")
    try:
        import django
        print(f"Django version: {django.get_version()}")
        
        # Set up Django
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.test')
        django.setup()
        print("Django setup successful!")
        
        # Try to import test modules
        print("\nAttempting to import test modules...")
        from apps.farmers.tests import test_models, test_serializers
        print("Successfully imported test modules!")
        
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
    
    # Simple test execution
    print_section("SIMPLE TEST EXECUTION")
    try:
        import unittest
        
        class SimpleTest(unittest.TestCase):
            """Simple test case."""
            def test_addition(self):
                """Test addition."""
                self.assertEqual(1 + 1, 2)
        
        print("Running simple test...")
        suite = unittest.TestLoader().loadTestsFromTestCase(SimpleTest)
        result = unittest.TextTestRunner(verbosity=2).run(suite)
        print(f"Test result: {'PASS' if result.wasSuccessful() else 'FAIL'}")
        
    except Exception as e:
        print(f"ERROR running simple test: {e}")
        import traceback
        traceback.print_exc()
    
    print_section("TEST COMPLETE")
    input("Press Enter to exit...")

if __name__ == "__main__":
    main()
