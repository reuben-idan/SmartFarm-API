# Set environment variables
$env:PYTHONPATH = (Get-Item -Path ".").FullName
$env:DJANGO_SETTINGS_MODULE = "smartfarm.settings.local"

# Create virtual environment if it doesn't exist
if (-not (Test-Path -Path ".venv")) {
    Write-Host "Creating virtual environment..."
    python -m venv .venv
    if (-not $?) {
        Write-Error "Failed to create virtual environment"
        exit 1
    }
}

# Activate virtual environment
Write-Host "Activating virtual environment..."
. \.venv\Scripts\Activate.ps1
if (-not $?) {
    Write-Error "Failed to activate virtual environment"
    exit 1
}

# Upgrade pip
Write-Host "Upgrading pip..."
python -m pip install --upgrade pip
if (-not $?) {
    Write-Warning "Failed to upgrade pip, but continuing..."
}

# Install requirements
Write-Host "Installing requirements..."
pip install -r requirements.txt
if (-not $?) {
    Write-Error "Failed to install requirements"
    exit 1
}

# Run migrations
Write-Host "Running migrations..."
python manage.py migrate
if (-not $?) {
    Write-Error "Failed to run migrations"
    exit 1
}

# Create superuser if it doesn't exist
Write-Host "Creating admin user if it doesn't exist..."
python -c "import os; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartfarm.settings.local'); from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(username='admin').exists() or User.objects.create_superuser('admin', 'admin@example.com', 'admin')"
if (-not $?) {
    Write-Warning "Failed to create admin user, but continuing..."
}

# Start the server
Write-Host "Starting development server..."
Write-Host "================================"
python manage.py runserver 8001 --verbosity 3
