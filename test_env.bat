@echo off
echo Testing Python environment...
python --version
if %ERRORLEVEL% NEQ 0 (
    echo Python is not installed or not in PATH
    exit /b 1
)

echo.
echo Running test script...
python -c "print('Hello from Python!')"
if %ERRORLEVEL% NEQ 0 (
    echo Failed to run Python script
    exit /b 1
)

echo.
echo Environment test completed successfully!
pause
