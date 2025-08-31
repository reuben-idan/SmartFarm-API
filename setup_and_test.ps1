# Setup and Test Script for Firebase Admin SDK
Write-Host "Setting up Python virtual environment and testing Firebase..." -ForegroundColor Cyan

# Create virtual environment if it doesn't exist
if (-not (Test-Path "fresh_venv")) {
    Write-Host "Creating fresh virtual environment..."
    python -m venv fresh_venv
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to create virtual environment" -ForegroundColor Red
        exit 1
    }
}

# Activate the virtual environment
Write-Host "Activating virtual environment..."
$activatePath = ".\fresh_venv\Scripts\Activate.ps1"
if (Test-Path $activatePath) {
    . $activatePath
} else {
    Write-Host "Activation script not found at $activatePath" -ForegroundColor Red
    exit 1
}

# Upgrade pip
Write-Host "Upgrading pip..."
python -m pip install --upgrade pip
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to upgrade pip" -ForegroundColor Red
    exit 1
}

# Install required packages
Write-Host "Installing required packages..."
pip install firebase-admin python-dotenv
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install required packages" -ForegroundColor Red
    exit 1
}

# Create a simple test script
$testScript = @'
import os
import firebase_admin
from firebase_admin import credentials

def main():
    print("=== Firebase Admin SDK Test ===")
    
    # Path to service account key
    key_path = os.path.join('backend', 'serviceAccountKey.json')
    print(f"Using key file: {os.path.abspath(key_path)}")
    
    if not os.path.exists(key_path):
        print("❌ Error: serviceAccountKey.json not found")
        return False
    
    try:
        # Initialize Firebase Admin SDK
        print("\nInitializing Firebase Admin SDK...")
        cred = credentials.Certificate(key_path)
        app = firebase_admin.initialize_app(cred)
        print("✅ Firebase Admin SDK initialized successfully")
        
        # Get project info
        print(f"\nProject ID: {cred.project_id}")
        
        # Test auth
        try:
            from firebase_admin import auth
            print("\nTesting authentication...")
            users = list(auth.list_users(max_results=1).iterate_all())
            print(f"✅ Successfully connected to Firebase Auth")
            print(f"   Found {len(users)} user(s) in the project")
        except Exception as e:
            print(f"⚠️ Auth test warning: {e}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False
    finally:
        if firebase_admin._DEFAULT_APP_NAME in firebase_admin._apps:
            firebase_admin.delete_app(firebase_admin.get_app())

if __name__ == "__main__":
    main()
'@

# Save test script
$testScript | Out-File -FilePath ".\test_firebase.py" -Encoding utf8

# Run the test
Write-Host "\nRunning Firebase test..." -ForegroundColor Cyan
python .\test_firebase.py

# Clean up
Remove-Item -Path ".\test_firebase.py" -ErrorAction SilentlyContinue

Write-Host "\nSetup and test complete!" -ForegroundColor Green
Write-Host "To activate this environment in the future, run: .\fresh_venv\Scripts\Activate.ps1" -ForegroundColor Cyan
