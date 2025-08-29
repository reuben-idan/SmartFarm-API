@echo off
setlocal

:: Set environment variables
set PYTHONPATH=%~dp0
set DJANGO_SETTINGS_MODULE=smartfarm.settings.local
set DJANGO_DEBUG=True
set PYTHONUNBUFFERED=1

:: Print environment
echo Python Environment:
python -c "import sys; print(f'Python {sys.version}')"
python -c "import os; print(f'PYTHONPATH: {os.environ.get(\"PYTHONPATH\", \"Not set\")}')"
python -c "import os; print(f'DJANGO_SETTINGS_MODULE: {os.environ.get(\"DJANGO_SETTINGS_MODULE\", \"Not set\")}')"

:: Install requirements
echo.
echo Installing requirements...
pip install -r requirements.txt

:: Run migrations
echo.
echo Running migrations...
python manage.py migrate

:: Create superuser if it doesn't exist
echo.
echo Creating superuser...
python -c "import os; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartfarm.settings.local'); from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(username='admin').exists() or User.objects.create_superuser('admin', 'admin@example.com', 'admin')"

:: Run the server
echo.
echo Starting development server...
python manage.py runserver 8001 --verbosity 3 --noreload

pause
