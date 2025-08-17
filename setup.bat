@echo off
setlocal enabledelayedexpansion

echo [*] Setting up SmartFarm API...
echo.

:: Check Python version
python --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Python is not installed or not in PATH
    exit /b 1
)

echo [*] Cleaning up broken installations...
for /d %%i in ("%PYTHONPATH%\Lib\site-packages\~*") do (
    echo Removing broken package: %%~nxi
    rmdir /s /q "%%i" >nul 2>&1
)

del /q "%PYTHONPATH%\Scripts\*.deleteme" >nul 2>&1

echo [*] Updating pip, setuptools, and wheel...
python -m pip install --upgrade --force-reinstall pip setuptools wheel
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to update pip, setuptools, and wheel
    exit /b 1
)

echo [*] Installing project dependencies...
pip install -r requirements.txt
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to install dependencies
    exit /b 1
)

echo [*] Applying database migrations...
python manage.py migrate
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to apply migrations
    exit /b 1
)

echo [*] Creating superuser...
python manage.py createsuperuser --noinput --username admin --email admin@example.com

if %ERRORLEVEL% neq 0 (
    echo [WARNING] Failed to create superuser. You may need to create one manually.
)

echo.
echo [*] Setup completed successfully!
echo.
echo [*] To start the development server, run:
echo     python manage.py runserver
echo.
echo [*] You can access the API documentation at:
echo     http://127.0.0.1:8000/api/docs/
echo.

endlocal
