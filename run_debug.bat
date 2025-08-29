@echo off
echo Setting up environment...
set PYTHONPATH=%~dp0
set DJANGO_SETTINGS_MODULE=smartfarm.settings.local

:: Activate virtual environment
call "C:\temp\smartfarm-venv\Scripts\activate.bat"

echo Running migrations...
python manage.py migrate

echo Starting development server...
python manage.py runserver 8001 --verbosity 3

pause
