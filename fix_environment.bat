@echo off
echo ==================================
echo  SmartFarm Environment Fixer
echo ==================================
echo.
echo This script will:
echo 1. Install Node.js if not present
echo 2. Install all frontend dependencies
echo 3. Configure environment variables
echo 4. Start the development server
echo.
echo Please wait while we start with administrator privileges...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "& {Start-Process powershell -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File "%~dp0resolve_environment.ps1"' -Verb RunAs}"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Failed to start the fix script with administrator privileges.
    echo Please right-click on 'resolve_environment.ps1' and select 'Run as administrator'.
)

pause
