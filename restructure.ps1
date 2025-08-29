# Restructure.ps1 - Script to reorganize the SmartFarm-API project structure

# Create new directory structure
$directories = @(
    "apps\core",
    "apps\users",
    "apps\crops",
    "apps\farmers",
    "apps\prices",
    "apps\recommendations",
    "config\settings",
    "config\urls",
    "config\wsgi",
    "tests\utils"
)

# Create directories
foreach ($dir in $directories) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
}

# Create __init__.py files in each directory
Get-ChildItem -Path . -Recurse -Directory | 
    Where-Object { $_.FullName -notmatch '(__pycache__|\.git|\.venv|node_modules)' } |
    ForEach-Object { 
        $initFile = Join-Path $_.FullName "__init__.py"
        if (-not (Test-Path $initFile)) {
            New-Item -ItemType File -Path $initFile -Force | Out-Null
        }
    }

# Move files to new locations
$moves = @{
    "smartfarm\settings\*.py" = "config\settings\"
    "core\*" = "apps\core\"
    "users\*" = "apps\users\"
    "crops\*" = "apps\crops\"
    "farmers\*" = "apps\farmers\"
    "prices\*" = "apps\prices\"
    "recommendations\*" = "apps\recommendations\"
    "smartfarm\urls.py" = "config\urls\"
    "smartfarm\wsgi.py" = "config\wsgi\"
    "smartfarm\asgi.py" = "config\wsgi\"
}

# Perform the moves
foreach ($move in $moves.GetEnumerator()) {
    $source = $move.Key
    $dest = $move.Value
    
    if (Test-Path $source) {
        Write-Host "Moving $source to $dest"
        Move-Item -Path $source -Destination $dest -Force
    } else {
        Write-Warning "Source path not found: $source"
    }
}

# Create new manage.py with updated paths
@"
#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.local')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
"@ | Out-File -FilePath "manage.py" -Encoding utf8 -Force

Write-Host "Restructuring complete. Please review the changes and update any remaining import paths."
Write-Host "Don't forget to update your PYTHONPATH and any deployment configurations."
