import sys
import os
import subprocess

def check_install():
    print("Checking Python environment and package installation...\n")
    
    # Check Python version and path
    print(f"Python Executable: {sys.executable}")
    print(f"Python Version: {sys.version}")
    
    # Check pip version
    try:
        pip_version = subprocess.check_output(
            [sys.executable, "-m", "pip", "--version"],
            stderr=subprocess.STDOUT
        ).decode().strip()
        print(f"\n{pip_version}")
    except Exception as e:
        print(f"\n❌ Error checking pip: {e}")
        return
    
    # Try to install the package
    print("\nAttempting to install firebase-admin...")
    try:
        result = subprocess.run(
            [sys.executable, "-m", "pip", "install", "firebase-admin", "--no-cache-dir", "--user", "--verbose"],
            capture_output=True,
            text=True,
            check=True
        )
        print("\n✅ Installation output:")
        print(result.stdout)
        if result.stderr:
            print("\n❌ Errors during installation:")
            print(result.stderr)
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Installation failed with error code {e.returncode}:")
        print(e.stdout)
        if e.stderr:
            print(e.stderr)
    
    # Check if the package is installed
    print("\nChecking if firebase-admin is installed...")
    try:
        import firebase_admin
        print(f"✅ firebase-admin is installed: {firebase_admin.__version__}")
    except ImportError as e:
        print(f"❌ firebase-admin is not installed: {e}")
    
    # Check site-packages
    print("\nPython Path (sys.path):")
    for path in sys.path:
        if 'site-packages' in path or 'dist-packages' in path:
            print(f"- {path}")
            # Check if firebase_admin exists in this path
            firebase_path = os.path.join(path, 'firebase_admin')
            if os.path.exists(firebase_path):
                print(f"  ✅ firebase_admin found here!")

if __name__ == "__main__":
    check_install()
