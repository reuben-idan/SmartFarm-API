import sys
import os

def check_environment():
    print("Python Environment Check")
    print("======================")
    print(f"Python Executable: {sys.executable}")
    print(f"Python Version: {sys.version}")
    print(f"Current Working Directory: {os.getcwd()}")
    print("\nEnvironment Variables:")
    for key, value in os.environ.items():
        if 'python' in key.lower() or 'django' in key.lower() or 'path' in key.lower():
            print(f"{key}: {value}")
    
    print("\nTrying to import Django...")
    try:
        import django
        print(f"Django Version: {django.__version__}")
        return True
    except ImportError as e:
        print(f"Error importing Django: {e}")
        return False

if __name__ == "__main__":
    check_environment()
