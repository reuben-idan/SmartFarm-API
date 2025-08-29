"""
Simple test to verify the test environment is working.
"""
from django.test import TestCase

class SimpleTestCase(TestCase):
    """Test case to verify the test environment."""
    
    def test_environment(self):
        """Test that the test environment is working."""
        self.assertTrue(True, "The test environment is working!")
    
    def test_database(self):
        """Test that the test database is accessible."""
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
        self.assertEqual(result[0], 1, "Should be able to query the database")
