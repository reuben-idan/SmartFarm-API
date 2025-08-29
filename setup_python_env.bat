@echo off
setlocal

echo Setting up Python environment for SmartFarm...
echo =======================================

:: Check Python installation
echo.
echo Checking Python installation...
where python > python_path.txt 2>&1
type python_path.txt
del python_path.txt

:: Create virtual environment
echo.
echo Creating virtual environment...
python -m venv C:\temp\smartfarm-venv
if errorlevel 1 (
    echo Failed to create virtual environment
    pause
    exit /b 1
)

:: Activate virtual environment
echo.
echo Activating virtual environment...
call C:\temp\smartfarm-venv\Scripts\activate.bat
if errorlevel 1 (
    echo Failed to activate virtual environment
    pause
    exit /b 1
)

:: Upgrade pip
echo.
echo Upgrading pip...
python -m pip install --upgrade pip
if errorlevel 1 (
    echo Failed to upgrade pip
    pause
    exit /b 1
)

:: Install Django
echo.
echo Installing Django...
pip install django
if errorlevel 1 (
    echo Failed to install Django
    pause
    exit /b 1
)

:: Verify Django installation
echo.
echo Verifying Django installation...
python -c "import django; print(f'Django version: {django.__version__}')"
if errorlevel 1 (
    echo Failed to verify Django installation
    pause
    exit /b 1
)

echo.
echo Environment setup completed successfully!
pause
