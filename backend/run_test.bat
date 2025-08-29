@echo off
setlocal

set PYTHONPATH=.
python -c "import sys; print('Python version:', sys.version)" > test_output.txt 2>&1
python -c "import django; print('Django version:', django.__version__)" >> test_output.txt 2>&1
python -c "import os; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.test'); import django; django.setup(); from django.conf import settings; print('Django settings:', settings.SETTINGS_MODULE)" >> test_output.txt 2>&1

if exist test_output.txt (
    type test_output.txt
) else (
    echo Failed to create test_output.txt
)

endlocal
