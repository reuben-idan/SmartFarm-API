@echo off
echo Setting up SmartFarm frontend development environment...
echo.

:: Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/ (LTS version recommended)
    pause
    exit /b 1
)

:: Get Node.js version
for /f "tokens=*" %%v in ('node -v') do set NODE_VERSION=%%v
echo [✓] Node.js is installed (Version: %NODE_VERSION%)

:: Check if npm is installed
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: npm is not installed or not in PATH
    pause
    exit /b 1
)

:: Get npm version
for /f "tokens=*" %%v in ('npm -v') do set NPM_VERSION=%%v
echo [✓] npm is installed (Version: %NPM_VERSION%)

:: Navigate to frontend directory
cd /d %~dp0frontend

:: Install dependencies
echo.
echo Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

:: Verify installation
echo.
echo Verifying installation...
npx vite --version
if %ERRORLEVEL% NEQ 0 (
    echo Error: Vite installation verification failed
    pause
    exit /b 1
)

echo.
echo [✓] Setup completed successfully!
echo.
echo To start the development server, run:
echo    cd %~dp0frontend
echo    npm run dev
echo.
echo Then open http://localhost:3002 in your browser
echo.
pause
