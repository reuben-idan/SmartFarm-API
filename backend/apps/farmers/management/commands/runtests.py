from django.core.management.base import BaseCommand
from django.test.runner import DiscoverRunner
from django.test.utils import get_runner
from django.conf import settings

class Command(BaseCommand):
    help = 'Run tests for the farmers app'

    def handle(self, *args, **options):
        # Configure test database
        settings.DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': ':memory:',
            }
        }
        
        # Run tests
        test_runner = DiscoverRunner(verbosity=2)
        failures = test_runner.run_tests(['apps.farmers.tests'])
        
        if failures:
            self.stderr.write(self.style.ERROR(f'\n{failures} test(s) failed!'))
            return 1
        
        self.stdout.write(self.style.SUCCESS('\nAll tests passed!'))
        return 0
