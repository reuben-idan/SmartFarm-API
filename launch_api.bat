@echo off
setlocal

:: Set environment variables
set PYTHONPATH=%~dp0
set DJANGO_SETTINGS_MODULE=smartfarm.settings.local

:: Use the Python launcher to run the server
py -3.12 -m pip install -r requirements.txt
py -3.12 manage.py migrate
py -3.12 -c "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(username='admin').exists() or User.objects.create_superuser('admin', 'admin@example.com', 'admin')"
py -3.12 manage.py runserver 8001

pause
