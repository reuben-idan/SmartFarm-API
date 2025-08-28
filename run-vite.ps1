Write-Host "Starting Vite development server..."
Set-Location -Path "$PSScriptRoot\frontend"

# Install dependencies if node_modules doesn't exist
if (-not (Test-Path ".\node_modules")) {
    Write-Host "Installing dependencies..."
    npm install
}

# Start Vite development server
Write-Host "Starting Vite..."
npx vite --host
