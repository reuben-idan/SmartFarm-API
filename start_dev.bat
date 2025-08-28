@echo off
echo Starting SmartFarm Frontend Development...
echo ===================================
echo.

:: Check if in the correct directory
if not exist "package.json" (
    echo [X] Error: Please run this script from the frontend directory
    echo Current directory: %CD%
    pause
    exit /b 1
)

echo [1/3] Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [X] Failed to install dependencies
    pause
    exit /b 1
)

echo [2/3] Creating .env file if it doesn't exist...
if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo [✓] Created .env file from .env.example
    ) else (
        echo [i] No .env.example file found
    )
) else (
    echo [i] .env file already exists
)

echo [3/3] Starting development server...
echo.
echo ===================================
echo  SmartFarm Frontend
echo  URL: http://localhost:3002
echo ===================================
echo.
echo [i] The development server is starting...
echo [i] Please wait a few moments for it to be ready
echo [i] Press Ctrl+C to stop the server
echo.

call npm run dev

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [X] Failed to start development server
    echo [i] Please check the error messages above
    pause
)
