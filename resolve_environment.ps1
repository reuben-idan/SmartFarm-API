# SmartFarm Environment Resolver
# This script will resolve all environment issues automatically

# Check for admin rights
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "This script requires administrator privileges. Restarting with elevated permissions..." -ForegroundColor Yellow
    Start-Process powershell -Verb RunAs -ArgumentList "-NoExit", "-File", "$($MyInvocation.MyCommand.Definition)"
    exit
}

function Write-Step {
    param($step, $message)
    Write-Host "`n[$step] $message" -ForegroundColor Cyan
}

function Check-Command {
    param($command)
    try {
        $null = Get-Command $command -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

# 1. Check and Install Node.js
Write-Step 1 "Checking Node.js installation..."
$nodeInstalled = Check-Command "node"

if (-not $nodeInstalled) {
    Write-Host "Node.js not found. Installing..." -ForegroundColor Yellow
    
    # Download Node.js LTS installer
    $nodeUrl = "https://nodejs.org/dist/v18.17.1/node-v18.17.1-x64.msi"
    $installerPath = "$env:TEMP\nodejs-installer.msi"
    
    try {
        Write-Host "Downloading Node.js installer..." -ForegroundColor Cyan
        Invoke-WebRequest -Uri $nodeUrl -OutFile $installerPath -UseBasicParsing
        
        # Install Node.js silently
        Write-Host "Installing Node.js..." -ForegroundColor Cyan
        $process = Start-Process msiexec.exe -ArgumentList "/i", "`"$installerPath`"", "/qn", "/norestart" -Wait -PassThru
        
        if ($process.ExitCode -eq 0) {
            Write-Host "Node.js installed successfully!" -ForegroundColor Green
            
            # Update PATH
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
            
            # Verify installation
            $nodeVersion = node -v
            $npmVersion = npm -v
            Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
            Write-Host "npm version: $npmVersion" -ForegroundColor Green
        } else {
            Write-Host "Failed to install Node.js. Exit code: $($process.ExitCode)" -ForegroundColor Red
            exit 1
        }
    }
    catch {
        Write-Host "Error installing Node.js: $_" -ForegroundColor Red
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

# 2. Set up frontend environment
Write-Step 2 "Setting up frontend environment..."
$frontendPath = Join-Path $PSScriptRoot "frontend"

if (-not (Test-Path $frontendPath)) {
    Write-Host "Frontend directory not found at: $frontendPath" -ForegroundColor Red
    exit 1
}

Set-Location $frontendPath

# 3. Install frontend dependencies
Write-Step 3 "Installing frontend dependencies..."

try {
    # Remove existing node_modules if it exists
    if (Test-Path "node_modules") {
        Write-Host "Removing existing node_modules..." -ForegroundColor Yellow
        Remove-Item -Recurse -Force node_modules
    }
    
    # Remove package-lock.json if it exists
    if (Test-Path "package-lock.json") {
        Remove-Item package-lock.json -Force
    }
    
    # Install dependencies
    Write-Host "Running npm install..." -ForegroundColor Cyan
    npm install --loglevel=error
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Dependencies installed successfully!" -ForegroundColor Green
    } else {
        throw "npm install failed with exit code $LASTEXITCODE"
    }
}
catch {
    Write-Host "Error installing dependencies: $_" -ForegroundColor Red
    exit 1
}

# 4. Configure environment
Write-Step 4 "Configuring environment..."

$envFile = ".env"
$envExample = ".env.example"

if (-not (Test-Path $envFile)) {
    if (Test-Path $envExample) {
        try {
            Copy-Item $envExample $envFile -Force
            Write-Host "Created $envFile from $envExample" -ForegroundColor Green
        }
        catch {
            Write-Host "Warning: Could not create .env file: $_" -ForegroundColor Yellow
        }
    } else {
        Write-Host "Warning: $envExample not found. You'll need to create a .env file manually." -ForegroundColor Yellow
    }
} else {
    Write-Host "$envFile already exists." -ForegroundColor Green
}

# 5. Start development server
Write-Step 5 "Starting development server..."

Write-Host "`n==================================" -ForegroundColor Green
Write-Host "SmartFarm Frontend Setup Complete!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host "`nTo start the development server, run:" -ForegroundColor Cyan
Write-Host "cd "$frontendPath"" -ForegroundColor White
Write-Host "npm run dev" -ForegroundColor White
Write-Host "`nThe application will be available at: http://localhost:3002" -ForegroundColor Cyan

# Ask if user wants to start the server now
$startServer = Read-Host "`nDo you want to start the development server now? (y/n)"
if ($startServer -eq 'y') {
    Write-Host "`nStarting development server..." -ForegroundColor Cyan
    Write-Host "Press Ctrl+C to stop the server when done.`n" -ForegroundColor Yellow
    npm run dev
}
