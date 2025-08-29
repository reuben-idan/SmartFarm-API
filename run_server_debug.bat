@echo off
echo Starting Django development server with debug output...

:: Set environment variables
set PYTHONUNBUFFERED=1
set DJANGO_DEBUG=True
set DJANGO_SETTINGS_MODULE=smartfarm.settings.local

:: Run the server with output to a log file
python -X dev -X tracemalloc=5 -v manage.py runserver > debug_output.log 2>&1

echo.
echo Server stopped. Check debug_output.log for details.
pause
