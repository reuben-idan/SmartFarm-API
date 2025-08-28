@echo off
echo Setting up SmartFarm frontend development environment...
echo ==================================================

:: Check if in the correct directory
if not exist "package.json" (
    echo [X] Error: Please run this script from the frontend directory
    echo Current directory: %CD%
    pause
    exit /b 1
)

echo [1/4] Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [X] Failed to install dependencies
    pause
    exit /b 1
)

echo [2/4] Setting up environment variables...
if not exist ".env" (
    echo Creating .env file from .env.example
    copy ".env.example" ".env" >nul
    echo [✓] Created .env file
) else (
    echo [i] .env file already exists
)

echo [3/4] Building the application...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [X] Build failed
    pause
    exit /b 1
)

echo [4/4] Starting development server...
start "" "cmd" /c "npm run dev"

echo.
echo ==================================================
echo [✓] Frontend setup completed!
echo.
echo The development server should open automatically at:
echo http://localhost:3002
echo.
echo If it doesn't open automatically, you can access it manually.
echo.
pause
