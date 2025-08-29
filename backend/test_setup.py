import os
import sys
import django
from django.conf import settings

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.test')

# Initialize Django
django.setup()

# Verify the settings
print("Django version:", django.get_version())
print("Using settings:", settings.SETTINGS_MODULE)
print("Database engine:", settings.DATABASES['default']['ENGINE'])

# Run a simple test
from django.test import TestCase

class SimpleTestCase(TestCase):
    def test_setup(self):
        """Test that the test environment is working."""
        self.assertEqual(1 + 1, 2)

if __name__ == '__main__':
    import pytest
    sys.exit(pytest.main(['-v', 'test_setup.py']))