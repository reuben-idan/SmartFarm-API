@echo off
setlocal

:: Set paths
set VENV_PATH=%USERPROFILE%\smartfarm-env
set PROJECT_PATH=%~dp0

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

:: Activate virtual environment
call "%VENV_PATH%\Scripts\activate.bat"
if errorlevel 1 (
    echo Failed to activate virtual environment
    pause
    exit /b 1
)

:: Install requirements
echo Installing requirements...
pip install -r "%PROJECT_PATH%requirements.txt"
if errorlevel 1 (
    echo Failed to install requirements
    pause
    exit /b 1
)

:: Run migrations
echo Running migrations...
python "%PROJECT_PATH%manage.py" migrate --settings=smartfarm.settings.local
if errorlevel 1 (
    echo Failed to run migrations
    pause
    exit /b 1
)

:: Run the server
echo Starting development server...
python "%PROJECT_PATH%manage.py" runserver 8001 --settings=smartfarm.settings.local

pause
