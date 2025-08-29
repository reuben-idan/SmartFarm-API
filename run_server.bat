@echo off
echo Setting up Django development server...

:: Check Python
python --version
if %ERRORLEVEL% NEQ 0 (
    echo Python is not in your PATH or not installed correctly.
    pause
    exit /b 1
)

:: Install requirements if needed
if not exist "venv" (
    echo Creating new virtual environment...
    python -m venv venv
    call venv\Scripts\activate
    pip install -r requirements.txt
) else (
    call venv\Scripts\activate
)

:: Run database migrations
echo.
echo Running database migrations...
python manage.py migrate

:: Create superuser if needed
if not exist "db.sqlite3" (
    echo.
    echo Creating superuser...
    python manage.py createsuperuser --noinput --username admin --email admin@example.com
    echo Superuser created with username: admin
    echo You may want to change the password using: python manage.py changepassword admin
)

:: Run the development server
echo.
echo Starting development server...
python manage.py runserver

pause
