@echo off
echo Setting up SQLite database for SmartFarm-API...
echo =============================================

:: Set environment variables
set DJANGO_SETTINGS_MODULE=smartfarm.settings.local
set PYTHONPATH=.

:: Remove existing database if it exists
if exist db.sqlite3 (
    echo Removing existing database...
    del db.sqlite3
)

echo.
echo Running migrations...
python manage.py makemigrations
python manage.py migrate

echo.
echo Creating superuser...
python manage.py createsuperuser --username admin --email admin@example.com --noinput

echo.
echo =============================================
echo SQLite setup complete! You can now run:
echo python manage.py runserver
echo =============================================

pause
