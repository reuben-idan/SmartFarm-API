@echo off
echo Starting SmartFarm Application...
echo.

echo [1/2] Starting Backend Server...
start "Backend Server" cmd /k "cd backend && .\venv\Scripts\activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

timeout /t 5 /nobreak >nul

echo [2/2] Starting Frontend Development Server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ====================================
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:8000/docs
echo ====================================

echo Both servers are starting up. Please wait a moment...
pause
