@echo off
echo Verifying Python environment...

:: Check Python installation
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Python is not in your PATH
    pause
    exit /b 1
)

:: Get Python version
python --version
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to get Python version
    pause
    exit /b 1
)

echo.
echo Python is installed and accessible.

:: Check pip installation
where pip >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: pip is not in your PATH
) else (
    pip --version
)

echo.
pause
