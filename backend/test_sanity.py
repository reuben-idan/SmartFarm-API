#!/usr/bin/env python
"""
Sanity test to verify the test environment is working.
"""
import unittest

class SanityTest(unittest.TestCase):
    def test_sanity(self):
        """Simple test to verify the test environment is working."""
        self.assertEqual(1 + 1, 2)

if __name__ == '__main__':
    unittest.main()
