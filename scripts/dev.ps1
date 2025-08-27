# Script to streamline development workflow for SmartFarm
param (
    [switch]$install = $false,
    [switch]$migrate = $false,
    [switch]$frontend = $false,
    [switch]$backend = $false,
    [switch]$all = $false
)

$projectRoot = Split-Path -Parent $PSScriptRoot
$frontendDir = Join-Path -Path $projectRoot -ChildPath "frontend"

# If no flags are provided, show help
if (-not ($install -or $migrate -or $frontend -or $backend -or $all)) {
    Write-Host "SmartFarm Development Script"
    Write-Host "Usage: .\scripts\dev.ps1 [options]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -install    Install all dependencies (frontend and backend)"
    Write-Host "  -migrate    Run database migrations"
    Write-Host "  -frontend   Start frontend development server"
    Write-Host "  -backend    Start backend development server"
    Write-Host "  -all        Start both frontend and backend in separate windows"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\scripts\dev.ps1 -install   # Install all dependencies"
    Write-Host "  .\scripts\dev.ps1 -all       # Start both frontend and backend"
    exit 0
}

# Install dependencies
if ($install -or $all) {
    Write-Host "=== Installing Dependencies ==="
    
    # Backend dependencies
    Write-Host "Installing Python dependencies..."
    python -m pip install -r requirements.txt
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install Python dependencies"
        exit 1
    }
    
    # Frontend dependencies
    Write-Host "Installing Node.js dependencies..."
    Set-Location -Path $frontendDir
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install Node.js dependencies"
        exit 1
    }
    Set-Location -Path $projectRoot
    
    Write-Host "✓ All dependencies installed successfully"
}

# Run migrations
if ($migrate -or $all) {
    Write-Host ""
    Write-Host "=== Running Migrations ==="
    python manage.py migrate
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Migrations failed"
        exit 1
    }
}

# Start backend server
if ($backend -or $all) {
    Write-Host ""
    Write-Host "=== Starting Backend Server ==="
    Write-Host "Backend API will be available at http://localhost:8000"
    Write-Host "API Docs: http://localhost:8000/api/docs/"
    Write-Host ""
    
    if ($all) {
        # In a new window if starting both
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot'; python manage.py runserver"
    } else {
        # In the current window if only backend
        python manage.py runserver
    }
}

# Start frontend development server
if ($frontend -or $all) {
    Write-Host ""
    Write-Host "=== Starting Frontend Development Server ==="
    Write-Host "Frontend will be available at http://localhost:3000"
    Write-Host ""
    
    Set-Location -Path $frontendDir
    
    if ($all) {
        # In a new window if starting both
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendDir'; npm run dev"
    } else {
        # In the current window if only frontend
        npm run dev
    }
}
