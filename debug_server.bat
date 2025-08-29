@echo off
echo Starting Django development server with debug output...

:: Set environment variables
set PYTHONUNBUFFERED=1
set DJANGO_DEBUG=True
set DJANGO_SETTINGS_MODULE=smartfarm.settings.local

:: Run the server with output to console
python -X dev -X tracemalloc=5 manage.py runserver --noreload

echo.
pause
