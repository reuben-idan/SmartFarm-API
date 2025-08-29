import os
import sys
import subprocess
from pathlib import Path

def print_header(text):
    print("\n" + "=" * 50)
    print(f"{text}")
    print("=" * 50)

def run_command(command, error_message=None):
    print(f"\nRunning: {' '.join(command)}")
    try:
        result = subprocess.run(
            command,
            check=True,
            capture_output=True,
            text=True,
            cwd=os.getcwd()
        )
        if result.stdout:
            print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error: {error_message or 'Command failed'}")
        if e.stdout:
            print("Output:", e.stdout)
        if e.stderr:
            print("Error:", e.stderr)
        return False

def main():
    # Print environment info
    print_header("ENVIRONMENT INFORMATION")
    print(f"Python executable: {sys.executable}")
    print(f"Python version: {sys.version}")
    print(f"Current directory: {os.getcwd()}")
    print(f"PYTHONPATH: {os.environ.get('PYTHONPATH', 'Not set')}")
    
    # Check requirements.txt exists
    if not os.path.exists('requirements.txt'):
        print("Error: requirements.txt not found!")
        return
    
    # Install/upgrade pip
    if not run_command(
        [sys.executable, "-m", "pip", "install", "--upgrade", "pip"],
        "Failed to upgrade pip"
    ):
        print("Warning: Continuing despite pip upgrade failure")
    
    # Install requirements
    print_header("INSTALLING REQUIREMENTS")
    if not run_command(
        [sys.executable, "-m", "pip", "install", "-r", "requirements.txt"],
        "Failed to install requirements"
    ):
        print("Error: Could not install requirements")
        return
    
    # Set environment variables
    os.environ['PYTHONPATH'] = os.getcwd()
    os.environ['DJANGO_SETTINGS_MODULE'] = 'smartfarm.settings.local'
    
    # Check Django installation
    try:
        import django
        print(f"\nDjango version: {django.__version__}")
    except ImportError as e:
        print(f"Error importing Django: {e}")
        print("Trying to install Django directly...")
        if not run_command(
            [sys.executable, "-m", "pip", "install", "django"],
            "Failed to install Django"
        ):
            return
    
    # Run migrations
    print_header("RUNNING MIGRATIONS")
    if not run_command(
        [sys.executable, "manage.py", "migrate"],
        "Failed to run migrations"
    ):
        print("Warning: Continuing despite migration errors")
    
    # Create admin user if it doesn't exist
    print_header("CHECKING ADMIN USER")
    run_command(
        [
            sys.executable,
            "-c",
            "import os; "
            "os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartfarm.settings.local'); "
            "from django.contrib.auth import get_user_model; "
            "User = get_user_model(); "
            "User.objects.filter(username='admin').exists() or "
            "User.objects.create_superuser('admin', 'admin@example.com', 'admin')"
        ],
        "Warning: Failed to create admin user"
    )
    
    # Start the server
    print_header("STARTING DJANGO DEVELOPMENT SERVER")
    print("Press Ctrl+C to stop the server\n")
    
    try:
        subprocess.run(
            [sys.executable, "manage.py", "runserver", "8001", "--verbosity=3"],
            cwd=os.getcwd()
        )
    except KeyboardInterrupt:
        print("\nServer stopped by user")
    except Exception as e:
        print(f"Error starting server: {e}")

if __name__ == "__main__":
    main()
