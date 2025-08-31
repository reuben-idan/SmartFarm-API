@echo off
echo Setting up frontend environment...
cd frontend

if not exist node_modules (
    echo Installing dependencies...
    call npm install
) else (
    echo Dependencies already installed
)

echo Starting frontend development server...
call npm run dev

pause
