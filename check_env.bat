@echo off
echo Checking Node.js and npm installation...
echo ===================================

:: Check Node.js
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [✓] Node.js is installed
    node -v
) else (
    echo [X] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/ (LTS version recommended)
    pause
    exit /b 1
)

echo.

:: Check npm
where npm >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [✓] npm is installed
    npm -v
) else (
    echo [X] npm is not installed or not in PATH
    echo Please install Node.js which includes npm
    pause
    exit /b 1
)

echo.
echo Environment check completed successfully!
pause
