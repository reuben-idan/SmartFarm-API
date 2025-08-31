import sys
import os
import subprocess

def check_python_environment():
    print("Python Environment Check\n" + "="*50)
    
    # Python version and executable
    print(f"Python Version: {sys.version}")
    print(f"Executable: {sys.executable}")
    print(f"\nWorking Directory: {os.getcwd()}")
    
    # Check if pip is working
    print("\nChecking pip installation...")
    try:
        pip_version = subprocess.check_output([sys.executable, "-m", "pip", "--version"]).decode().strip()
        print(f"✅ {pip_version}")
    except Exception as e:
        print(f"❌ Error running pip: {e}")
    
    # Check installed packages
    print("\nChecking installed packages...")
    try:
        installed = subprocess.check_output([sys.executable, "-m", "pip", "list"]).decode()
        print(installed)
    except Exception as e:
        print(f"❌ Error listing packages: {e}")
    
    # Check site-packages
    print("\nPython Path (sys.path):")
    for path in sys.path:
        print(f"- {path}")

if __name__ == "__main__":
    check_python_environment()
