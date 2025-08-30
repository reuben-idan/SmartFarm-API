clea#!/usr/bin/env python
"""
Simple test to verify the test environment is working.
"""
import os
import sys
import django
from django.conf import settings
from django.test import TestCase

def setup_django():
    # Configure Django settings
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.test")
    
    # Configure test database
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': ':memory:',
            'TEST': {
                'NAME': ':memory:',
            },
        }
    }
    
    # Basic settings for testing
    settings.configure(
        DATABASES=DATABASES,
        INSTALLED_APPS=[
            'django.contrib.auth',
            'django.contrib.contenttypes',
            'django.contrib.sessions',
            'rest_framework',
            'apps.farmers',
            'apps.users',
            'apps.core',
        ],
        ROOT_URLCONF='config.urls',
        PASSWORD_HASHERS=[
            'django.contrib.auth.hashers.MD5PasswordHasher',
        ],
    )
    
    # Initialize Django
    django.setup()

class SimpleTest(TestCase):
    def test_addition(self):
        """Simple test that 1 + 1 = 2"""
        self.assertEqual(1 + 1, 2)

def run_tests():
    setup_django()
    
    from django.test.utils import get_runner
    TestRunner = get_runner(settings)
    test_runner = TestRunner(verbosity=2, interactive=True)
    
    # Run tests
    failures = test_runner.run_tests(['test_simple'])
    
    # Exit with appropriate status code
    sys.exit(bool(failures))

if __name__ == '__main__':
    run_tests()
