@echo off
echo Checking Python installation...

python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8 or later from https://www.python.org/downloads/
    pause
    exit /b 1
)

python -c "import sys; print(f'\nPython {sys.version}\nExecutable: {sys.executable}')"

python -c "
import sys
if sys.version_info < (3, 8):
    print('\nERROR: Python 3.8 or later is required')
    sys.exit(1)
"

if %ERRORLEVEL% NEQ 0 (
    pause
    exit /b 1
)

echo.
echo Python installation looks good!
pause
