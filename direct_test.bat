@echo off
echo Starting direct test...
python -c "import sys; print('Python version:', sys.version); print('Executable:', sys.executable); print('Path:', sys.path)"
python -c "import django; print('Django version:', django.get_version())"
python -m pytest --version
python -m pytest apps/farmers/tests/ -v
if %ERRORLEVEL% NEQ 0 (
    echo Tests failed with error level %ERRORLEVEL%
    pause
    exit /b %ERRORLEVEL%
)
echo Tests completed successfully!
pause
