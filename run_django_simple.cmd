@echo off
set PYTHONPATH=%~dp0
set DJANGO_SETTINGS_MODULE=smartfarm.settings.local

:: Activate virtual environment
call .venv\Scripts\activate.bat

:: Run the server
python manage.py runserver 8001 --verbosity 3

pause
