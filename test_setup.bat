@echo off
echo Testing Django setup...

:: Activate the virtual environment
call venv\Scripts\activate
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to activate virtual environment
    echo Run setup_env.bat first to set up the environment
    pause
    exit /b 1
)

echo.
echo Verifying Django installation...
python -c "
import django
print(f'Django {django.__version__} is installed')
"

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Django is not installed in the virtual environment
    pause
    exit /b 1
)

echo.
echo Running database migrations...
python manage.py check
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Django project configuration issue
    pause
    exit /b 1
)

echo.
echo Setup test completed successfully!
pause
