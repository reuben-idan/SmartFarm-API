@echo off
setlocal

:: Create a temporary directory for the virtual environment
set VENV_PATH=C:\temp\smartfarm-venv

:: Create virtual environment
echo Creating virtual environment in %VENV_PATH%...
python -m venv %VENV_PATH%
if errorlevel 1 (
    echo Failed to create virtual environment
    exit /b 1
)

:: Activate virtual environment
call %VENV_PATH%\Scripts\activate.bat
if errorlevel 1 (
    echo Failed to activate virtual environment
    exit /b 1
)

:: Install requirements
echo Installing requirements...
pip install -r requirements.txt
if errorlevel 1 (
    echo Failed to install requirements
    exit /b 1
)

:: Run migrations
echo Running migrations...
python manage.py migrate --settings=smartfarm.settings.local
if errorlevel 1 (
    echo Failed to run migrations
    exit /b 1
)

:: Create superuser
echo Creating superuser...
echo from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(username='admin').exists() or User.objects.create_superuser('admin', 'admin@example.com', 'admin') | python manage.py shell --settings=smartfarm.settings.local

:: Run the server
echo Starting development server...
python manage.py runserver 8001 --settings=smartfarm.settings.local

pause
