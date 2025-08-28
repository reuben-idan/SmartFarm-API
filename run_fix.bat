@echo off
echo Starting SmartFarm Environment Fix...
echo ===================================
echo.
echo This will:
echo 1. Install Node.js if not present
echo 2. Install frontend dependencies
echo 3. Set up environment variables
echo 4. Start the development server
echo.
echo Please wait...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "& {Start-Process powershell -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File "%~dp0fix_environment.ps1"' -Verb RunAs}"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Failed to start the fix script with administrator privileges.
    echo Please right-click on 'fix_environment.ps1' and select 'Run as administrator'.
)

pause
