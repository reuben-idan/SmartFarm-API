# Build script for Windows
Write-Host "=== Starting frontend build process ==="

# Navigate to the frontend directory
$frontendDir = Join-Path -Path $PSScriptRoot -ChildPath "..\frontend"
Set-Location -Path $frontendDir

# Set environment variables
$env:NODE_ENV = "production"

# Install dependencies if node_modules doesn't exist
if (-not (Test-Path -Path "node_modules" -PathType Container)) {
    Write-Host "Installing frontend dependencies..."
    npm ci --prefer-offline --no-audit
} else {
    Write-Host "Using existing node_modules/"
}

# Build the frontend
Write-Host "Building frontend for production..."
npm run build

# Create static directory if it doesn't exist
$staticDir = Join-Path -Path $PSScriptRoot -ChildPath "..\static"
Write-Host "Preparing static files directory at $staticDir"

if (Test-Path -Path $staticDir) {
    Remove-Item -Path $staticDir -Recurse -Force
}
New-Item -ItemType Directory -Path $staticDir -Force | Out-Null

# Copy build files to static directory
Write-Host "Copying build files to static directory..."
Copy-Item -Path ".\dist\*" -Destination $staticDir -Recurse -Force

# Ensure proper permissions for deployment
Write-Host "Setting directory permissions..."
icacls $staticDir /grant "Everyone:(OI)(CI)F" /T

Write-Host "=== Frontend build completed successfully ==="
Write-Host "Static files are available in: $staticDir"
