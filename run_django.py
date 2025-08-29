#!/usr/bin/env python
"""
Run Django development server with error handling.
"""
import os
import sys
import subprocess

def main():
    # Activate virtual environment
    if os.name == 'nt':  # Windows
        activate_script = os.path.join('venv', 'Scripts', 'activate')
    else:  # Unix/Linux/Mac
        activate_script = os.path.join('venv', 'bin', 'activate')
    
    print("Starting Django development server...")
    
    try:
        # Run Django development server
        subprocess.run([sys.executable, 'manage.py', 'runserver'], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error: {e}")
        return 1
    except KeyboardInterrupt:
        print("\nServer stopped by user")
        return 0
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
