import os
import sys
import subprocess

def main():
    # Print Python info
    print(f"Python executable: {sys.executable}")
    print(f"Python version: {sys.version}")
    print(f"Current directory: {os.getcwd()}")
    
    # Check if requirements.txt exists
    if not os.path.exists('requirements.txt'):
        print("Error: requirements.txt not found!")
        return
    
    # Install requirements
    print("\nInstalling requirements...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "--upgrade", "pip"], check=True)
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error installing requirements: {e}")
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
        return
    
    # Run migrations
    print("\nRunning migrations...")
    try:
        subprocess.run([sys.executable, "manage.py", "migrate"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error running migrations: {e}")
        return
    
    # Create admin user if it doesn't exist
    print("\nChecking admin user...")
    try:
        subprocess.run([
            sys.executable, 
            "-c", 
            "import os; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartfarm.settings.local'); "
            "from django.contrib.auth import get_user_model; "
            "User = get_user_model(); "
            "User.objects.filter(username='admin').exists() or "
            "User.objects.create_superuser('admin', 'admin@example.com', 'admin')"
        ], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error creating admin user: {e}")
    
    # Start the server
    print("\nStarting development server...")
    print("================================")
    try:
        subprocess.run([
            sys.executable, 
            "manage.py", 
            "runserver", 
            "8001",
            "--verbosity=3"
        ], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error starting server: {e}")

if __name__ == "__main__":
    main()
