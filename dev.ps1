# SmartFarm Development Script for Windows
# Run this script to start the development environment

param(
    [switch]$setup = $false,
    [switch]$backend = $false,
    [switch]$frontend = $false,
    [switch]$db = $false,
    [switch]$all = $true
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Import environment variables from .env file
if (Test-Path .env) {
    Get-Content .env | ForEach-Object {
        $name, $value = $_.Split('=')
        if ($name -and $value) {
            [System.Environment]::SetEnvironmentVariable($name, $value)
        }
    }
}

# Function to start backend server
function Start-Backend {
    Write-Host "Starting Backend Server..." -ForegroundColor Cyan
    Set-Location $PSScriptRoot\backend
    if (-not (Test-Path "../.venv")) {
        python -m venv ../.venv
    }
    .\..\.venv\Scripts\activate
    
    # Install Python dependencies if not already installed
    if (-not (Test-Path "../.venv/Lib/site-packages/django")) {
        pip install -r requirements/development.txt
    }
    
    # Check if database is running
    try {
        $pgTest = & 'C:\Program Files\PostgreSQL\13\bin\pg_isready.exe' -h localhost -p 5432 -U postgres -d smartfarm 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Starting PostgreSQL service..." -ForegroundColor Yellow
            Start-Service postgresql-x64-13
            Start-Sleep -Seconds 5
        }
    } catch {
        Write-Host "PostgreSQL is not running. Please start the PostgreSQL service." -ForegroundColor Red
        exit 1
    }
    
    # Check if Redis is running
    try {
        $redisTest = redis-cli ping 2>&1
        if ($redisTest -ne "PONG") {
            Write-Host "Starting Redis service..." -ForegroundColor Yellow
            Start-Service redis
            Start-Sleep -Seconds 2
        }
    } catch {
        Write-Host "Redis is not running. Please start the Redis service." -ForegroundColor Red
        exit 1
    }
    
    # Run database migrations
    python manage.py migrate
    
    # Start the development server
    python manage.py runserver
}

# Function to start frontend server
function Start-Frontend {
    Write-Host "Starting Frontend Development Server..." -ForegroundColor Cyan
    Set-Location $PSScriptRoot\frontend
    
    # Install Node.js dependencies if not already installed
    if (-not (Test-Path "node_modules")) {
        pnpm install
    }
    
    # Start the development server
    pnpm run dev
}

# Function to open database shell
function Start-DatabaseShell {
    Write-Host "Opening PostgreSQL shell..." -ForegroundColor Cyan
    $env:PGPASSWORD = $env:DB_PASSWORD
    & 'C:\Program Files\PostgreSQL\13\bin\psql.exe' -h localhost -p 5432 -U $env:DB_USER -d $env:DB_NAME
}

# Main execution
if ($setup) {
    # Run the setup script
    & "$PSScriptRoot\setup-dev.ps1"
    exit
}

if ($backend -or $all) {
    Start-Backend
}

if ($frontend -or $all) {
    Start-Frontend
}

if ($db) {
    Start-DatabaseShell
}

if (-not ($backend -or $frontend -or $db -or $setup)) {
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\dev.ps1 -setup     Run the full setup"
    Write-Host "  .\dev.ps1 -backend   Start the backend server"
    Write-Host "  .\dev.ps1 -frontend  Start the frontend server"
    Write-Host "  .\dev.ps1 -db        Open database shell"
    Write-Host "  .\dev.ps1 -all       Start both frontend and backend (default)"
}
