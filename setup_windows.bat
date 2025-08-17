@echo off
setlocal enabledelayedexpansion

echo [*] Setting up SmartFarm API...
echo.

:: Check Python
python --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Python is not installed or not in PATH
    exit /b 1
)

:: Create virtual environment if it doesn't exist
if not exist "venv\" (
    echo [*] Creating virtual environment...
    python -m venv venv
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Failed to create virtual environment
        exit /b 1
    )
)

:: Activate virtual environment and install requirements
echo [*] Installing dependencies...
call venv\Scripts\activate.bat
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to activate virtual environment
    exit /b 1
)

pip install --upgrade pip setuptools wheel
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to update pip, setuptools, and wheel
    exit /b 1
)

pip install -r requirements.txt
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to install dependencies
    exit /b 1
)

:: Apply migrations
echo [*] Applying database migrations...
python manage.py migrate
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to apply migrations
    exit /b 1
)

:: Create superuser
echo [*] Creating superuser...
python -c "
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartfarm.settings')
import django
django.setup()
from django.contrib.auth import get_user_model
User = get_user_model()
try:
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser('admin', 'admin@example.com', 'admin')
        print('Superuser created successfully')
    else:
        print('Superuser already exists')
except Exception as e:
    print(f'Error creating superuser: {str(e)}')
"

echo.
echo [*] Setup completed successfully!
echo.
echo [*] To start the development server, run:
echo     venv\Scripts\activate.bat
echo     python manage.py runserver
echo.
echo [*] You can access the API documentation at:
echo     http://127.0.0.1:8000/api/docs/
echo.
echo [*] Admin credentials:
echo     Username: admin
echo     Password: admin
echo.
echo [*] Please change the default admin password after first login!

endlocal
