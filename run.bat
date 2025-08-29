@echo off
echo Starting Django development server...

:: Check if Python is in the virtual environment
if not exist "venv\Scripts\python.exe" (
    echo Virtual environment not found. Please run 'python -m venv venv' first.
    pause
    exit /b 1
)

:: Activate virtual environment and run server
call venv\Scripts\activate
python manage.py runserver

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Error starting the development server.
    echo Make sure all dependencies are installed by running 'pip install -r requirements.txt'.
)

pause
