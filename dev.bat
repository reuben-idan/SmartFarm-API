@echo off
REM SmartFarm Development Script (Batch version)

if "%1"=="" (
    echo Usage:
    echo   dev setup     - Run the full setup
    echo   dev backend   - Start the backend server
    echo   dev frontend  - Start the frontend server
    echo   dev db        - Open database shell
    echo   dev all       - Start both frontend and backend
    goto :eof
)

if "%1"=="setup" (
    powershell -ExecutionPolicy Bypass -File "%~dp0setup-dev.ps1"
    goto :eof
)

if "%1"=="backend" (
    powershell -ExecutionPolicy Bypass -File "%~dp0dev.ps1" -backend
    goto :eof
)

if "%1"=="frontend" (
    powershell -ExecutionPolicy Bypass -File "%~dp0dev.ps1" -frontend
    goto :eof
)

if "%1"=="db" (
    powershell -ExecutionPolicy Bypass -File "%~dp0dev.ps1" -db
    goto :eof
)

if "%1"=="all" (
    start "" "%COMSPEC%" /c "title SmartFarm Backend && powershell -ExecutionPolicy Bypass -File "%~dp0dev.ps1" -backend"
    timeout /t 5 >nul
    start "" "%COMSPEC%" /c "title SmartFarm Frontend && powershell -ExecutionPolicy Bypass -File "%~dp0dev.ps1" -frontend"
    goto :eof
)

echo Unknown command: %1
