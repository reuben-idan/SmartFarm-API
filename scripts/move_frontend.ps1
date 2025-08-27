# Source and destination paths
$sourceDir = "C:\Users\reube\smartfarm-dashboard\src\*"
$destDir = "C:\Users\reube\SmartFarm-API\frontend\src"

# Create destination directory if it doesn't exist
if (-not (Test-Path -Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir -Force
}

# Copy files recursively
Copy-Item -Path $sourceDir -Destination $destDir -Recurse -Force

# Copy root files
$rootFiles = @("package.json", "tailwind.config.js", "tsconfig.json", "vite.config.ts")
foreach ($file in $rootFiles) {
    $sourceFile = Join-Path -Path "C:\Users\reube\smartfarm-dashboard" -ChildPath $file
    $destFile = Join-Path -Path "C:\Users\reube\SmartFarm-API\frontend" -ChildPath $file
    if (Test-Path -Path $sourceFile) {
        Copy-Item -Path $sourceFile -Destination $destFile -Force
    }
}

Write-Host "Frontend files have been moved successfully to $destDir"
