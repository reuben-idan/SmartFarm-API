@echo off
setlocal

:: Set environment variables
set PYTHONPATH=%~dp0
set DJANGO_SETTINGS_MODULE=smartfarm.settings.local

:: Create virtual environment in temp directory
set VENV_PATH=%TEMP%\smartfarm-venv

:: Create virtual environment if it doesn't exist
if not exist "%VENV_PATH%" (
    echo Creating virtual environment in %VENV_PATH%
    python -m venv "%VENV_PATH%"
    if errorlevel 1 (
        echo Failed to create virtual environment
        pause
        exit /b 1
    )
)

:: Activate virtual environment
call "%VENV_PATH%\Scripts\activate.bat"
if errorlevel 1 (
    echo Failed to activate virtual environment
    pause
    exit /b 1
)

:: Install requirements
echo Installing requirements...
pip install -r "%~dp0requirements.txt"
if errorlevel 1 (
    echo Failed to install requirements
    pause
    exit /b 1
)

:: Run migrations
echo Running migrations...
python "%~dp0manage.py" migrate --settings=smartfarm.settings.local
if errorlevel 1 (
    echo Failed to run migrations
    pause
    exit /b 1
)

:: Create superuser if it doesn't exist
echo Checking for admin user...
echo from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(username='admin').exists() or User.objects.create_superuser('admin', 'admin@example.com', 'admin') | python "%~dp0manage.py" shell --settings=smartfarm.settings.local

:: Run the server
echo Starting development server...
python "%~dp0manage.py" runserver 8001 --settings=smartfarm.settings.local

pause
