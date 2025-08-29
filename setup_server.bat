@echo off
setlocal enabledelayedexpansion

echo Setting up SmartFarm Django server...
echo ===================================

:: Set environment variables
set VENV_PATH=C:\temp\smartfarm-venv
set PROJECT_PATH=%~dp0
set DJANGO_SETTINGS_MODULE=smartfarm.settings.local

:: Create virtual environment if it doesn't exist
if not exist "%VENV_PATH%" (
    echo Creating virtual environment...
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

echo.
echo Installing requirements...
"%VENV_PATH%\Scripts\pip.exe" install -r "%PROJECT_PATH%\requirements.txt"
if errorlevel 1 (
    echo Failed to install requirements
    pause
    exit /b 1
)

echo.
echo Running migrations...
"%VENV_PATH%\Scripts\python.exe" "%PROJECT_PATH%\manage.py" migrate
if errorlevel 1 (
    echo Failed to run migrations
    pause
    exit /b 1
)

echo.
echo Creating admin user if it doesn't exist...
"%VENV_PATH%\Scripts\python.exe" -c "import os; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartfarm.settings.local'); from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(username='admin').exists() or User.objects.create_superuser('admin', 'admin@example.com', 'admin')"

echo.
echo Starting development server...
echo ============================
"%VENV_PATH%\Scripts\python.exe" "%PROJECT_PATH%\manage.py" runserver 8001 --settings=smartfarm.settings.local --verbosity 3

pause
