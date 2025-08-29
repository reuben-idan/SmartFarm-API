# SmartFarm Development Setup Script for Windows
# Run this script in PowerShell with administrator privileges

# Set error action preference
$ErrorActionPreference = "Stop"

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "This script requires administrator privileges. Please run PowerShell as Administrator and try again." -ForegroundColor Red
    exit 1
}

# Set execution policy
Set-ExecutionPolicy Bypass -Scope Process -Force

# Install Chocolatey if not already installed
if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Chocolatey package manager..." -ForegroundColor Cyan
    Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
    refreshenv
}

# Install required software
Write-Host "Installing required software..." -ForegroundColor Cyan
choco install -y python --version=3.10.11
choco install -y postgresql13 --params "/Password:postgres"
choco install -y redis-64
choco install -y nodejs-lts
choco install -y pnpm

# Refresh environment variables
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Install Python dependencies
Write-Host "Installing Python dependencies..." -ForegroundColor Cyan
python -m venv venv
.\venv\Scripts\activate
pip install --upgrade pip
pip install -r backend/requirements/development.txt

# Install Node.js dependencies
Write-Host "Installing Node.js dependencies..." -ForegroundColor Cyan
Set-Location frontend
pnpm install
Set-Location ..

# Create .env file if it doesn't exist
if (-not (Test-Path .env)) {
    Write-Host "Creating .env file..." -ForegroundColor Cyan
    @"
# Django
DEBUG=True
SECRET_KEY=django-insecure-your-secret-key-here
DJANGO_ENV=development

# Database
DB_NAME=smartfarm
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000

# JWT
JWT_SECRET_KEY=your-jwt-secret-key-here
ACCESS_TOKEN_LIFETIME=3600
REFRESH_TOKEN_LIFETIME=86400

# Email
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
DEFAULT_FROM_EMAIL=webmaster@smartfarm.local

# Redis
REDIS_URL=redis://localhost:6379/0

# Celery
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/1
"@ | Out-File -FilePath .env -Encoding utf8
}

# Start services
Write-Host "Starting services..." -ForegroundColor Cyan
Start-Service postgresql-x64-13
Start-Service redis

# Create database if it doesn't exist
Write-Host "Setting up database..." -ForegroundColor Cyan
try {
    $env:PGPASSWORD = "postgres"
    & 'C:\Program Files\PostgreSQL\13\bin\psql.exe' -U postgres -c "SELECT 1 FROM pg_database WHERE datname = 'smartfarm'" | Out-Null
    if ($LASTEXITCODE -ne 0) {
        & 'C:\Program Files\PostgreSQL\13\bin\psql.exe' -U postgres -c "CREATE DATABASE smartfarm;"
        & 'C:\Program Files\PostgreSQL\13\bin\psql.exe' -U postgres -d smartfarm -c "CREATE EXTENSION IF NOT EXISTS ""uuid-ossp"";"
    }
} catch {
    Write-Host "Error setting up database: $_" -ForegroundColor Red
}

# Run migrations
Write-Host "Running database migrations..." -ForegroundColor Cyan
Set-Location backend
python manage.py migrate
python manage.py createsuperuser
Set-Location ..

Write-Host "`nSetup complete!`n" -ForegroundColor Green
Write-Host "To start the development servers, run the following commands:" -ForegroundColor Yellow
Write-Host "1. Start Redis (if not already running)" -ForegroundColor Yellow
Write-Host "2. In one terminal (Backend):" -ForegroundColor Yellow
Write-Host "   cd $PWD/backend" -ForegroundColor Cyan
Write-Host "   .\venv\Scripts\activate" -ForegroundColor Cyan
Write-Host "   python manage.py runserver" -ForegroundColor Cyan
Write-Host "3. In another terminal (Frontend):" -ForegroundColor Yellow
Write-Host "   cd $PWD/frontend" -ForegroundColor Cyan
Write-Host "   pnpm run dev" -ForegroundColor Cyan

# Open the project in VS Code if available
if (Get-Command code -ErrorAction SilentlyContinue) {
    code .
}
