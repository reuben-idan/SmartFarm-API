@echo off
setlocal

:: Set environment variables
set PYTHONPATH=%~dp0
set DJANGO_SETTINGS_MODULE=smartfarm.settings.local

:: Install dependencies if not already installed
py -3.12 -m pip install -r requirements.txt

:: Run database migrations
py -3.12 manage.py migrate

:: Create superuser if not exists
echo from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(username='admin').exists() or User.objects.create_superuser('admin', 'admin@example.com', 'admin') | py -3.12 manage.py shell

:: Run the development server
echo Starting development server...
py -3.12 manage.py runserver 8001

pause
