import os
import sys
import subprocess

def check_python():
    print("Python version:", sys.version)
    print("Python executable:", sys.executable)

def check_environment():
    print("\nEnvironment variables:")
    for key in ['PYTHONPATH', 'DJANGO_SETTINGS_MODULE', 'PATH']:
        print(f"{key}: {os.environ.get(key, 'Not set')}")

def check_dependencies():
    print("\nChecking dependencies...")
    try:
        import django
        print(f"Django version: {django.__version__}")
        return True
    except ImportError:
        print("Django is not installed")
        return False

def run_server():
    print("\nStarting Django development server...")
    try:
        cmd = [
            sys.executable,
            "manage.py",
            "runserver",
            "8001",
            "--verbosity=3",
            "--noreload"
        ]
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error starting server: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")

if __name__ == "__main__":
    # Set environment variables
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartfarm.settings.local')
    
    # Run checks
    check_python()
    check_environment()
    
    if check_dependencies():
        run_server()
    else:
        print("\nPlease install the required dependencies first:")
        print("pip install -r requirements.txt")
