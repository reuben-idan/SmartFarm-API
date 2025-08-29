# Setup script for SQLite development

# Set error action preference
$ErrorActionPreference = "Stop"

# Create .env file if it doesn't exist
$envContent = @"
# Django
DEBUG=True
SECRET_KEY=django-insecure-your-secret-key-here
DJANGO_ENV=development

# Database
DB_ENGINE=django.db.backends.sqlite3
DB_NAME=db.sqlite3

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000

# JWT
JWT_SECRET_KEY=your-jwt-secret-key-here
ACCESS_TOKEN_LIFETIME=3600
REFRESH_TOKEN_LIFETIME=86400

# Email
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
DEFAULT_FROM_EMAIL=webmaster@smartfarm.local

# Redis (for Celery)
REDIS_URL=redis://localhost:6379/0

# Celery
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/1
"@

# Create .env file
$envContent | Out-File -FilePath ".\.env" -Encoding utf8 -Force
Write-Host "Created .env file" -ForegroundColor Green

# Create virtual environment if it doesn't exist
if (-not (Test-Path ".venv")) {
    python -m venv .venv
    Write-Host "Created Python virtual environment" -ForegroundColor Green
}

# Activate virtual environment
.\\.venv\Scripts\activate

# Upgrade pip
python -m pip install --upgrade pip

# Install Python dependencies
pip install -r backend/requirements/development.txt

# Install Node.js dependencies
Set-Location frontend
pnpm install
Set-Location ..

# Run database migrations
Set-Location backend
python manage.py migrate
python manage.py createsuperuser --noinput --username admin --email admin@example.com
Set-Location ..

Write-Host """
Setup complete! To start the development servers, run:

1. In one terminal (Backend):
   cd c:\Users\reube\SmartFarm-API\backend
   .\..\.venv\Scripts\activate
   python manage.py runserver

2. In another terminal (Frontend):
   cd c:\Users\reube\SmartFarm-API\frontend
   pnpm run dev

Access the application at http://localhost:3000
Admin interface: http://localhost:8000/admin
""" -ForegroundColor Green
