"""
A simple test to verify the test environment is working.
"""
from django.test import TestCase

class BasicTestCase(TestCase):
    """Basic test case to verify the test environment."""
    
    def test_basic(self):
        """A simple test that should always pass."""
        self.assertTrue(True, "This test should always pass")
