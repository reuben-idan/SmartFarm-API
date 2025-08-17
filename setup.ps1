Write-Host "[*] Setting up SmartFarm API..." -ForegroundColor Cyan

# Check Python version
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Python is not installed or not in PATH" -ForegroundColor Red
    exit 1
}
Write-Host "[*] Using Python: $pythonVersion" -ForegroundColor Green

# Activate virtual environment
if (-not (Test-Path ".\venv")) {
    Write-Host "[*] Creating virtual environment..." -ForegroundColor Cyan
    python -m venv venv
}

Write-Host "[*] Activating virtual environment..." -ForegroundColor Cyan
.\venv\Scripts\Activate.ps1

# Upgrade pip, setuptools, and wheel
Write-Host "[*] Updating pip, setuptools, and wheel..." -ForegroundColor Cyan
python -m pip install --upgrade pip setuptools wheel
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to update pip, setuptools, and wheel" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "[*] Installing project dependencies..." -ForegroundColor Cyan
pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Apply migrations
Write-Host "[*] Applying database migrations..." -ForegroundColor Cyan
python manage.py migrate
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to apply migrations" -ForegroundColor Red
    exit 1
}

# Create superuser
Write-Host "[*] Creating superuser..." -ForegroundColor Cyan
$env:PYTHONUNBUFFERED=1
$output = python -c "
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartfarm.settings')
import django
django.setup()
from django.contrib.auth import get_user_model
User = get_user_model()
try:
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser('admin', 'admin@example.com', 'admin')
        print('Superuser created successfully')
    else:
        print('Superuser already exists')
except Exception as e:
    print(f'Error creating superuser: {str(e)}')
" 2>&1

Write-Host $output -ForegroundColor Yellow

Write-Host "`n[*] Setup completed successfully!" -ForegroundColor Green
Write-Host "`n[*] To start the development server, run:" -ForegroundColor Cyan
Write-Host "    .\venv\Scripts\Activate.ps1" -ForegroundColor Yellow
Write-Host "    python manage.py runserver" -ForegroundColor Yellow
Write-Host "`n[*] You can access the API documentation at:" -ForegroundColor Cyan
Write-Host "    http://127.0.0.1:8000/api/docs/" -ForegroundColor Yellow
Write-Host "`n[*] Admin credentials:" -ForegroundColor Cyan
Write-Host "    Username: admin" -ForegroundColor Yellow
Write-Host "    Password: admin" -ForegroundColor Yellow
Write-Host "`n[*] Please change the default admin password after first login!" -ForegroundColor Red
