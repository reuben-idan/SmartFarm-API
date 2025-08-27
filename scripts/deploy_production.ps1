# Script to deploy SmartFarm to production
param (
    [string]$environment = "production",
    [switch]$skipBuild = $false,
    [switch]$skipMigrations = $false
)

Write-Host "=== Deploying SmartFarm to $environment ==="

# Check if we're in the project root
$projectRoot = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path -Path (Join-Path -Path $projectRoot -ChildPath "manage.py"))) {
    Write-Error "This script must be run from the project root directory"
    exit 1
}

Set-Location -Path $projectRoot

# Step 1: Build the frontend
if (-not $skipBuild) {
    Write-Host "[1/4] Building frontend..."
    .\scripts\build_frontend.ps1
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Frontend build failed"
        exit 1
    }
} else {
    Write-Host "[1/4] Skipping frontend build (--skipBuild)"
}

# Step 2: Collect static files
Write-Host "[2/4] Collecting static files..."
python manage.py collectstatic --noinput
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to collect static files"
    exit 1
}

# Step 3: Run migrations
if (-not $skipMigrations) {
    Write-Host "[3/4] Running migrations..."
    python manage.py migrate --noinput
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Migrations failed"
        exit 1
    }
} else {
    Write-Host "[3/4] Skipping migrations (--skipMigrations)"
}

# Step 4: Restart the server
Write-Host "[4/4] Restarting server..."
# This assumes you're using systemd to manage the server
# You may need to adjust this based on your server setup
$serviceName = "smartfarm-$environment"
try {
    sudo systemctl restart $serviceName
    Write-Host "✓ Successfully restarted $serviceName"
} catch {
    Write-Warning "Failed to restart service. You may need to restart it manually."
    Write-Warning "Command to restart: sudo systemctl restart $serviceName"
}

Write-Host ""
Write-Host "=== Deployment Complete! ==="
Write-Host "The application should now be live at your server's address."
Write-Host ""
Write-Host "To check the status:"
Write-Host "  sudo systemctl status $serviceName"
Write-Host ""
Write-Host "To view logs:"
Write-Host "  sudo journalctl -u $serviceName -f"
Write-Host ""

# If you're using a process manager like PM2, you might use:
# pm2 restart smartfarm-api --update-env
# pm2 save
