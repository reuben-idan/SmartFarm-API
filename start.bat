@echo off
echo Starting SmartFarm Application...
echo.

echo Starting Backend API Server...
start "SmartFarm API" cmd /k "python manage.py runserver"

echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Frontend Development Server...
cd frontend
start "SmartFarm Frontend" cmd /k "npm run dev"

echo.
echo SmartFarm Application Started!
echo Backend API: http://127.0.0.1:8000
echo Frontend: http://127.0.0.1:3000
echo.
echo Press any key to continue...
pause > nul