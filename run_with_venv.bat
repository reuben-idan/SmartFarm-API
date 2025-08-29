@echo off
setlocal

:: Set environment variables
set VENV_PATH=C:\temp\smartfarm-env
set PYTHONPATH=%~dp0
set DJANGO_SETTINGS_MODULE=smartfarm.settings.local

:: Activate virtual environment and run commands
call %VENV_PATH%\Scripts\activate.bat
if errorlevel 1 (
    echo Failed to activate virtual environment
    pause
    exit /b 1
)

:: Install requirements
echo Installing requirements...
pip install -r requirements.txt
if errorlevel 1 (
    echo Failed to install requirements
    pause
    exit /b 1
)

:: Run migrations
echo Running migrations...
python manage.py migrate
if errorlevel 1 (
    echo Failed to run migrations
    pause
    exit /b 1
)

:: Create superuser if it doesn't exist
echo Checking for admin user...
python -c "import os; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartfarm.settings.local'); from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(username='admin').exists() or User.objects.create_superuser('admin', 'admin@example.com', 'admin')"

:: Run the server
echo Starting development server...
python manage.py runserver 8001 --verbosity 3

pause
