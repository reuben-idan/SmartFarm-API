@echo off
echo Starting test execution...
python -c "import sys; print(f'Python version: {sys.version}')"
python -m django --version
python -m pytest apps/farmers/tests/ -v
if %ERRORLEVEL% NEQ 0 (
    echo Tests failed with error level %ERRORLEVEL%
    exit /b %ERRORLEVEL%
)
echo Tests completed successfully!
pause
