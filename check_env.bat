@echo off
echo Checking Python environment...
echo.
echo Python Executable: %PYTHON%
python --version
echo.
echo Python Path:
python -c "import sys; print('\n'.join(sys.path))"
echo.
echo Django Version:
python -m django --version
echo.
echo Installed Packages:
pip list
echo.
pause
