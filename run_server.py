import sys
import subprocess
import os

def main():
    # Set environment variables
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartfarm.settings.local')
    
    # Print Python and Django info
    print(f"Python executable: {sys.executable}")
    print(f"Python version: {sys.version}")
    
    try:
        import django
        print(f"Django version: {django.__version__}")
    except ImportError as e:
        print(f"Error importing Django: {e}")
        return
    
    # Run the server
    try:
        print("\nStarting Django development server...")
        cmd = [sys.executable, "manage.py", "runserver", "8001", "--verbosity=3"]
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error running server: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")

if __name__ == "__main__":
    main()
