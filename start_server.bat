@echo off
setlocal

:: Set environment variables
set PYTHONPATH=%~dp0
set DJANGO_SETTINGS_MODULE=smartfarm.settings.local

:: Activate virtual environment
call "C:\temp\smartfarm-venv\Scripts\activate.bat"

:: Run database migrations
echo Running database migrations...
python manage.py migrate

:: Create superuser if not exists
echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(username='admin').exists() or User.objects.create_superuser('admin', 'admin@example.com', 'admin')" | python manage.py shell

:: Run the development server
echo Starting development server...
python manage.py runserver 8001

pause
