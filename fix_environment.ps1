# Fix Environment Script for SmartFarm
# This script will help set up the development environment

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "This script requires administrator privileges. Restarting with elevated permissions..." -ForegroundColor Yellow
    Start-Process powershell.exe -Verb RunAs -ArgumentList "-NoExit", "-File", "$($MyInvocation.MyCommand.Definition)"
    exit
}

function Test-CommandExists {
    param($command)
    $exists = $null -ne (Get-Command $command -ErrorAction SilentlyContinue)
    return $exists
}

# Check Node.js installation
Write-Host "`n[1/5] Checking Node.js installation..." -ForegroundColor Cyan
$nodeInstalled = Test-CommandExists "node"
$npmInstalled = Test-CommandExists "npm"

if (-not $nodeInstalled -or -not $npmInstalled) {
    Write-Host "Node.js or npm not found. Installing Node.js LTS..." -ForegroundColor Yellow
    
    # Download Node.js installer
    $nodeInstallerUrl = "https://nodejs.org/dist/v18.17.1/node-v18.17.1-x64.msi"
    $installerPath = "$env:TEMP\nodejs-installer.msi"
    
    try {
        Write-Host "Downloading Node.js installer..." -ForegroundColor Cyan
        Invoke-WebRequest -Uri $nodeInstallerUrl -OutFile $installerPath
        
        # Install Node.js silently
        Write-Host "Installing Node.js..." -ForegroundColor Cyan
        Start-Process msiexec.exe -Wait -ArgumentList "/i", "`"$installerPath`"", "/qn", "/norestart"
        
        # Update PATH
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        
        # Verify installation
        $nodeInstalled = Test-CommandExists "node"
        $npmInstalled = Test-CommandExists "npm"
        
        if ($nodeInstalled -and $npmInstalled) {
            Write-Host "Node.js installed successfully!" -ForegroundColor Green
            Write-Host "Node.js version: $(node -v)" -ForegroundColor Green
            Write-Host "npm version: $(npm -v)" -ForegroundColor Green
        } else {
            Write-Host "Node.js installation may not have completed successfully. Please restart your computer and try again." -ForegroundColor Red
            exit 1
        }
    }
    catch {
        Write-Host "Failed to install Node.js: $_" -ForegroundColor Red
        exit 1
    }
    finally {
        # Clean up installer
        if (Test-Path $installerPath) {
            Remove-Item $installerPath -Force
        }
    }
} else {
    Write-Host "Node.js is already installed:" -ForegroundColor Green
    Write-Host "Node.js version: $(node -v)" -ForegroundColor Green
    Write-Host "npm version: $(npm -v)" -ForegroundColor Green
}

# Navigate to frontend directory
$frontendPath = Join-Path $PSScriptRoot "frontend"
if (-not (Test-Path $frontendPath)) {
    Write-Host "Frontend directory not found at: $frontendPath" -ForegroundColor Red
    exit 1
}

Set-Location $frontendPath

# Install dependencies
Write-Host "`n[2/5] Installing frontend dependencies..." -ForegroundColor Cyan
try {
    npm install
    if ($LASTEXITCODE -ne 0) {
        throw "npm install failed"
    }
    Write-Host "Dependencies installed successfully!" -ForegroundColor Green
}
catch {
    Write-Host "Failed to install dependencies: $_" -ForegroundColor Red
    exit 1
}

# Set up environment file
Write-Host "`n[3/5] Setting up environment..." -ForegroundColor Cyan
$envFile = ".env"
$envExample = ".env.example"

if (-not (Test-Path $envFile) -and (Test-Path $envExample)) {
    try {
        Copy-Item $envExample $envFile -Force
        Write-Host "Created $envFile from $envExample" -ForegroundColor Green
    }
    catch {
        Write-Host "Failed to create .env file: $_" -ForegroundColor Yellow
    }
} elseif (Test-Path $envFile) {
    Write-Host "$envFile already exists. Skipping creation." -ForegroundColor Green
} else {
    Write-Host "Warning: $envExample not found. Please create a .env file manually." -ForegroundColor Yellow
}

# Start development server
Write-Host "`n[4/5] Starting development server..." -ForegroundColor Cyan
Write-Host "The development server will start in a new window." -ForegroundColor Cyan
Write-Host "Please wait a few moments for it to be ready." -ForegroundColor Cyan
Write-Host "`nOnce started, you can access the application at:" -ForegroundColor Cyan
Write-Host "http://localhost:3002" -ForegroundColor Green

try {
    Start-Process "cmd.exe" -ArgumentList "/c", "npm run dev" -NoNewWindow
    Write-Host "`n[5/5] Development server started successfully!" -ForegroundColor Green
}
catch {
    Write-Host "Failed to start development server: $_" -ForegroundColor Red
    Write-Host "You can try starting it manually by running:" -ForegroundColor Yellow
    Write-Host "cd $frontendPath" -ForegroundColor White
    Write-Host "npm run dev" -ForegroundColor White
    exit 1
}

# Keep the window open
Write-Host "`nPress any key to close this window..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
