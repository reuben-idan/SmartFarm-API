@echo off
REM Create virtual environment if it doesn't exist
if not exist "venv\Scripts\python.exe" (
    echo Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo Failed to create virtual environment
        exit /b 1
    )
)

echo Activating virtual environment...
call venv\Scripts\activate

if errorlevel 1 (
    echo Failed to activate virtual environment
    exit /b 1
)

echo Upgrading pip...
python -m pip install --upgrade pip

if errorlevel 1 (
    echo Failed to upgrade pip
    exit /b 1
)

echo Installing required packages...
pip install firebase-admin fastapi uvicorn python-dotenv

if errorlevel 1 (
    echo Failed to install packages
    exit /b 1
)

echo.
echo Virtual environment setup complete!
echo To activate the virtual environment, run: call venv\Scripts\activate
echo To run the FastAPI server: uvicorn backend.app.main:app --reload

pause
