@echo off
setlocal

:: Set environment variables
set PYTHONPATH=%~dp0
set DJANGO_SETTINGS_MODULE=smartfarm.settings.local
set DJANGO_DEBUG=True

:: Run the server and capture output
py -3.12 -c "import os, sys; print(f'Python: {sys.executable}'); print(f'PYTHONPATH: {os.environ.get(\"PYTHONPATH\", \"Not set\")}'); print(f'DJANGO_SETTINGS_MODULE: {os.environ.get(\"DJANGO_SETTINGS_MODULE\", \"Not set\")}')" > debug_output.log 2>&1

:: Run Django server
py -3.12 manage.py runserver 8001 --verbosity 3 >> debug_output.log 2>&1
