@echo off
setlocal

:: Set environment variables
set PYTHONPATH=%~dp0
set DJANGO_SETTINGS_MODULE=smartfarm.settings.local

:: Create virtual environment in temp directory
set VENV_PATH=%TEMP%\smartfarm-venv

:: Create virtual environment if it doesn't exist
if not exist "%VENV_PATH%" (
    echo Creating virtual environment in %VENV_PATH%
    python -m venv "%VENV_PATH%"
    if errorlevel 1 (
        echo Failed to create virtual environment
        pause
        exit /b 1
    )
)

:: Activate virtual environment and run commands in a single session
echo Starting SmartFarm API...
cmd /k ""%VENV_PATH%\Scripts\activate.bat" && echo Installing requirements... && pip install -r "%~dp0requirements.txt" && echo Running migrations... && python "%~dp0manage.py" migrate --settings=smartfarm.settings.local && echo Starting server... && python "%~dp0manage.py" runserver 8001 --settings=smartfarm.settings.local"
