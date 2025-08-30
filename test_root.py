#!/usr/bin/env python
"""Test script to run from root directory."""
import os
import sys
import django

# Add the backend directory to Python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.test')
try:
    django.setup()
    print("Django setup successful!")
except Exception as e:
    print(f"Error setting up Django: {e}")
    sys.exit(1)

# Import test cases
try:
    from apps.farmers.tests.test_models import FarmerProfileModelTests, FarmTypeModelTests
    from apps.farmers.tests.test_serializers import FarmerProfileSerializerTests, FarmTypeSerializerTests
    print("Successfully imported test cases!")
except ImportError as e:
    print(f"Error importing test cases: {e}")
    sys.exit(1)

# Run the tests
if __name__ == "__main__":
    import unittest
    test_suite = unittest.TestLoader().loadTestsFromTestCase(FarmerProfileModelTests)
    test_suite.addTests(unittest.TestLoader().loadTestsFromTestCase(FarmTypeModelTests))
    test_suite.addTests(unittest.TestLoader().loadTestsFromTestCase(FarmerProfileSerializerTests))
    test_suite.addTests(unittest.TestLoader().loadTestsFromTestCase(FarmTypeSerializerTests))
    
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(test_suite)
    sys.exit(not result.wasSuccessful())
