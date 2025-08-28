@echo off
echo Installing Node.js...
echo ===================

:: Check if Node.js is already installed
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Node.js is already installed.
    node -v
    pause
    exit /b 0
)

echo Node.js is not installed. Starting installation...

echo Downloading Node.js LTS installer...
powershell -Command "Invoke-WebRequest -Uri 'https://nodejs.org/dist/v18.17.1/node-v18.17.1-x64.msi' -OutFile 'nodejs-installer.msi'"

if not exist "nodejs-installer.msi" (
    echo Failed to download Node.js installer.
    echo Please download and install Node.js manually from https://nodejs.org/
    pause
    exit /b 1
)

echo Installing Node.js...
start /wait msiexec /i nodejs-installer.msi /qn /norestart

del nodejs-installer.msi

:: Add Node.js to PATH
setx PATH "%PATH%;C:\Program Files\nodejs\" /M

echo.
echo Node.js installation complete!
node -v
npm -v
echo.
echo Please restart any open command prompts for the changes to take effect.
pause
