@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo  SmartFarm Setup and Startup Script
echo ==========================================
echo.

:: Function to check if a command exists
:command_exists
set command=%~1
where /q %command%
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%a in ('%command% --version 2^>^&1') do set version=%%a
    echo [✓] %command% is installed (!version!)
    exit /b 0
) else (
    echo [X] %command% is not installed or not in PATH
    exit /b 1
)

echo.
echo [1/5] Checking system requirements...
call :command_exists node
set node_installed=!ERRORLEVEL!

call :command_exists npm
set npm_installed=!ERRORLEVEL!

if !node_installed! NEQ 0 (
    echo.
    echo [i] Node.js is required but not found.
    echo [i] Please install Node.js from https://nodejs.org/ (LTS version)
    echo [i] After installation, please restart this script
    pause
    exit /b 1
)

echo.
echo [2/5] Setting up frontend environment...
cd /d "%~dp0frontend" 2>nul || (
    echo [X] Frontend directory not found
    pause
    exit /b 1
)

:: Install dependencies
echo.
echo [3/5] Installing frontend dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [X] Failed to install dependencies
    pause
    exit /b 1
)

:: Create .env if it doesn't exist
if not exist ".env" (
    echo.
    echo [4/5] Creating .env file...
    copy ".env.example" ".env" >nul
    if %ERRORLEVEL% NEQ 0 (
        echo [X] Failed to create .env file
        pause
        exit /b 1
    )
    echo [✓] Created .env file
) else (
    echo [i] .env file already exists
)

echo.
echo [5/5] Starting development server...
echo.
echo ==========================================
echo  Starting SmartFarm Frontend
echo  URL: http://localhost:3002
echo ==========================================
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
