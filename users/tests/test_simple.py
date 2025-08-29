""
Simple test to verify the test environment is working.
"""
from django.test import TestCase

class SimpleTest(TestCase):
    """A simple test case to verify the test environment."""
    
    def test_addition(self):
        """Test that 1 + 1 equals 2."""
        self.assertEqual(1 + 1, 2)
