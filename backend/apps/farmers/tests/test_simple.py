"""
A simple test to verify the test setup is working.
"""
from django.test import TestCase

class SimpleTest(TestCase):
    def test_addition(self):
        """Test that 1 + 1 equals 2."""
        self.assertEqual(1 + 1, 2)
