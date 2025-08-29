# Check environment and run tests
Write-Output "=== Environment Check ==="
Write-Output "Current directory: $(Get-Location)"
Write-Output "Python version: $(python --version)"

# Check if Django is installed
try {
    $djangoVersion = python -c "import django; print(django.__version__)"
    Write-Output "Django version: $djangoVersion"
    
    # Run the test
    Write-Output "\n=== Running Tests ==="
    $env:PYTHONPATH = "."
    $env:DJANGO_SETTINGS_MODULE = "config.settings.test"
    
    # Run the test with output
    python -c "
import os
import sys
import django
from django.conf import settings

print('Setting up Django...')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.test')
django.setup()
print('Django setup complete')

from django.test import TestCase
print('TestCase imported')

class SimpleTest(TestCase):
    def test_basic(self):
        print('Running test...')
        self.assertTrue(True)

print('Running tests...')
from django.test.runner import DiscoverRunner
test_runner = DiscoverRunner(verbosity=2)
result = test_runner.run_tests(['apps.farmers.tests.test_setup'])
print(f'Tests completed with result: {result}')
sys.exit(0 if result == 0 else 1)
"
} catch {
    Write-Output "Error: $_"
}
