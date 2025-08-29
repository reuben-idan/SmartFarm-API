@echo off
setlocal

:: Set environment variables
set PYTHONPATH=%~dp0
set DJANGO_SETTINGS_MODULE=smartfarm.settings.local
set DJANGO_DEBUG=True
set PYTHONUNBUFFERED=1

:: Print environment
echo Python Environment:
py -3.12 -c "import sys; print(f'Python executable: {sys.executable}')"
py -3.12 -c "import sys; print(f'Python version: {sys.version}')"
py -3.12 -c "import os; print(f'PYTHONPATH: {os.environ.get(\"PYTHONPATH\", \"Not set\")}')"
py -3.12 -c "import os; print(f'DJANGO_SETTINGS_MODULE: {os.environ.get(\"DJANGO_SETTINGS_MODULE\", \"Not set\")}')"

:: Install requirements
echo.
echo Installing requirements...
py -3.12 -m pip install -r requirements.txt

:: Run migrations
echo.
echo Running migrations...
py -3.12 manage.py migrate

:: Create superuser if it doesn't exist
echo.
echo Creating superuser...
py -3.12 -c "import os; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartfarm.settings.local'); from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(username='admin').exists() or User.objects.create_superuser('admin', 'admin@example.com', 'admin')"

:: Run the server
echo.
echo Starting development server...
py -3.12 manage.py runserver 8001 --verbosity 3

pause
