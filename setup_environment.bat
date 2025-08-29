@echo off
echo Setting up Python environment for SmartFarm-API...
echo =============================================

:: Check Python version
python --version

:: Upgrade pip
echo.
echo Upgrading pip...
python -m pip install --upgrade pip

:: Install dependencies
echo.
echo Installing dependencies...
pip install -r requirements.txt

:: Install additional required packages
echo.
echo Installing additional required packages...
pip install djangorestframework djangorestframework-simplejwt django-environ django-filter django-cors-headers PyYAML Faker django-celery-results django-debug-toolbar

:: Verify installations
echo.
echo Verifying installations...
python -c "import django; print(f'Django {django.__version__} is installed')"
python -c "import rest_framework; print(f'Django REST Framework {rest_framework.__version__} is installed')"

echo.
echo =============================================
echo Environment setup complete! You can now run the development server with:
echo python manage.py runserver
echo =============================================

pause
