@echo off
echo Setting up Firebase Admin SDK test environment...

:: Create virtual environment
if not exist "pyenv" (
    echo Creating virtual environment...
    python -m venv pyenv
    if errorlevel 1 (
        echo Failed to create virtual environment
        pause
        exit /b 1
    )
)

:: Activate environment and install packages
echo Installing required packages...
call pyenv\Scripts\activate.bat
if errorlevel 1 (
    echo Failed to activate virtual environment
    pause
    exit /b 1
)

pip install firebase-admin python-dotenv
if errorlevel 1 (
    echo Failed to install required packages
    pause
    exit /b 1
)

:: Create test script
echo import os > test_firebase.py
echo import firebase_admin >> test_firebase.py
echo from firebase_admin import credentials >> test_firebase.py
echo. >> test_firebase.py
echo print("Testing Firebase Admin SDK...") >> test_firebase.py
echo print("-" * 50) >> test_firebase.py
echo. >> test_firebase.py
echo key_path = os.path.join('backend', 'serviceAccountKey.json') >> test_firebase.py
echo print(f"Using key file: {os.path.abspath(key_path)}") >> test_firebase.py
echo. >> test_firebase.py
echo if not os.path.exists(key_path): >> test_firebase.py
echo     print("ERROR: serviceAccountKey.json not found") >> test_firebase.py
echo     exit(1) >> test_firebase.py
echo. >> test_firebase.py
echo try: >> test_firebase.py
echo     print("Initializing Firebase Admin SDK...") >> test_firebase.py
echo     cred = credentials.Certificate(key_path) >> test_firebase.py
echo     app = firebase_admin.initialize_app(cred) >> test_firebase.py
echo     print("SUCCESS: Firebase Admin SDK initialized") >> test_firebase.py
echo     print(f"Project ID: {cred.project_id}") >> test_firebase.py
echo     firebase_admin.delete_app(app) >> test_firebase.py
echo     exit(0) >> test_firebase.py
echo except Exception as e: >> test_firebase.py
echo     print(f"ERROR: {e}") >> test_firebase.py
echo     exit(1) >> test_firebase.py

:: Run the test
echo.
echo Running Firebase test...
python test_firebase.py
set TEST_RESULT=%ERRORLEVEL%

:: Cleanup
del test_firebase.py

if %TEST_RESULT% EQU 0 (
    echo.
    echo Setup completed successfully!
    echo You can now use the virtual environment by running: pyenv\Scripts\activate.bat
) else (
    echo.
    echo Setup completed with errors.
)

pause
