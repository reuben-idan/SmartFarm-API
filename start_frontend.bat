@echo off
echo Starting SmartFarm Frontend Development Server...
echo =============================================

:: Check if in the correct directory
cd /d "%~dp0frontend" 2>nul || (
    echo [X] Error: Could not find frontend directory
    pause
    exit /b 1
)

:: Check if node_modules exists
if not exist "node_modules" (
    echo [i] node_modules not found. Installing dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [X] Failed to install dependencies
        pause
        exit /b 1
    )
)

:: Check if .env exists
if not exist ".env" (
    echo [i] .env file not found. Creating from .env.example...
    copy ".env.example" ".env" >nul
    if %ERRORLEVEL% NEQ 0 (
        echo [X] Failed to create .env file
        pause
        exit /b 1
    )
    echo [✓] Created .env file
)

echo.
echo Starting development server...
echo.

echo [i] Frontend will be available at: http://localhost:3002
echo [i] Press Ctrl+C to stop the server
echo.

:: Start the development server
call npm run dev

:: If the above command fails, show error
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [X] Failed to start development server
    echo [i] Make sure all dependencies are installed
    pause
)
