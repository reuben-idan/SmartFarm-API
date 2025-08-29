@echo off
setlocal enabledelayedexpansion

:: Set environment variables
set VENV_PATH=C:\temp\smartfarm-venv
set PROJECT_PATH=%~dp0
set DJANGO_SETTINGS_MODULE=smartfarm.settings.local

:: Check if virtual environment exists
if not exist "%VENV_PATH%\Scripts\python.exe" (
    echo Virtual environment not found at %VENV_PATH%
    echo Please run setup_python_env.bat first
    pause
    exit /b 1
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
pip install -r "%PROJECT_PATH%\requirements.txt"
if errorlevel 1 (
    echo Failed to install requirements
    pause
    exit /b 1
)

:: Run migrations
echo Running migrations...
python "%PROJECT_PATH%\manage.py" migrate
if errorlevel 1 (
    echo Failed to run migrations
    pause
    exit /b 1
)

:: Create admin user if it doesn't exist
echo Creating admin user if it doesn't exist...
python -c "import os; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartfarm.settings.local'); from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(username='admin').exists() or User.objects.create_superuser('admin', 'admin@example.com', 'admin')"

:: Run the server
echo Starting development server...
echo ============================
python "%PROJECT_PATH%\manage.py" runserver 8001 --settings=smartfarm.settings.local --verbosity 3

pause
