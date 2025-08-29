@echo off
setlocal

:: Set environment variables
set PYTHONPATH=%~dp0
set DJANGO_SETTINGS_MODULE=smartfarm.settings.local
set DJANGO_DEBUG=True

:: Install requirements
echo Installing requirements...
pip install -r requirements.txt

:: Run migrations
echo Running migrations...
python manage.py migrate

:: Create superuser if it doesn't exist
echo Creating superuser...
echo from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(username='admin').exists() or User.objects.create_superuser('admin', 'admin@example.com', 'admin') | python manage.py shell

:: Run the server
echo Starting development server...
python manage.py runserver 0.0.0.0:8001 --noreload --verbosity 3

pause
