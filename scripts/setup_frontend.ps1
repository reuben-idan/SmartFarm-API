# Script to set up the frontend development environment
Write-Host "=== Setting up SmartFarm Frontend Development Environment ==="

# Navigate to the frontend directory
$frontendDir = Join-Path -Path $PSScriptRoot -ChildPath "..\frontend"
Set-Location -Path $frontendDir

# Check if Node.js is installed
$nodeVersion = node -v
if ($LASTEXITCODE -ne 0) {
    Write-Error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
}
Write-Host "✓ Using Node.js $nodeVersion"

# Check if pnpm is installed
$pnpmVersion = pnpm -v
if ($LASTEXITCODE -ne 0) {
    Write-Host "Installing pnpm..."
    npm install -g pnpm
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install pnpm. Please install it manually: npm install -g pnpm"
        exit 1
    }
}
Write-Host "✓ Using pnpm $pnpmVersion"

# Install dependencies
Write-Host "Installing frontend dependencies..."
pnpm install
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to install frontend dependencies"
    exit 1
}

# Create .env file if it doesn't exist
$envFile = Join-Path -Path $frontendDir -ChildPath ".env"
if (-not (Test-Path -Path $envFile)) {
    @"
# Frontend Environment Variables
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=SmartFarm
VITE_APP_ENV=development
"@ | Out-File -FilePath $envFile -Encoding utf8
    Write-Host "✓ Created .env file"
}

Write-Host ""
Write-Host "=== Setup Complete! ==="
Write-Host "To start the development server, run:"
Write-Host "  cd frontend"
Write-Host "  pnpm dev"
Write-Host ""
Write-Host "The frontend will be available at http://localhost:3000"
Write-Host "The backend API should be running at http://localhost:8000"
