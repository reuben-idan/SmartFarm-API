# Setup script for SmartFarm frontend development
Write-Host "Setting up SmartFarm frontend development environment..." -ForegroundColor Cyan

# Check if Node.js is installed
try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js is installed (Version: $nodeVersion)" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/ (LTS version recommended)" -ForegroundColor Yellow
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm -v
    Write-Host "✅ npm is installed (Version: $npmVersion)" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Navigate to frontend directory
$frontendDir = Join-Path $PSScriptRoot "frontend"
Set-Location $frontendDir

# Install dependencies
Write-Host "`nInstalling dependencies..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Verify installation
Write-Host "`nVerifying installation..." -ForegroundColor Cyan
$viteCheck = npx vite --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Vite installation verification failed" -ForegroundColor Red
    exit 1
}

# Start development server
Write-Host "`n✅ Setup completed successfully!" -ForegroundColor Green
Write-Host "To start the development server, run:" -ForegroundColor Cyan
Write-Host "  cd $frontendDir" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host "`nThen open http://localhost:3002 in your browser" -ForegroundColor Cyan
