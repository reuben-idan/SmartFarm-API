@echo off
echo Starting Vite development server...
cd /d "%~dp0frontend"
call npm install
call npx vite --host
