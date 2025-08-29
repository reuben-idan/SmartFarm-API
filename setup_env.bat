@echo off
echo Setting up Python virtual environment...

:: Check if venv exists, if not create it
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to create virtual environment
        pause
        exit /b 1
    )
)

:: Activate the virtual environment
call venv\Scripts\activate
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to activate virtual environment
    pause
    exit /b 1
)

echo.
echo Installing dependencies...
pip install --upgrade pip
pip install django djangorestframework djangorestframework-simplejwt python-dotenv

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Virtual environment setup complete!
echo Activate it with: call venv\Scripts\activate
pause
