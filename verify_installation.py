#!/usr/bin/env python
"""
Verify Python and Django installation.
"""
import sys
import os
import subprocess

def run_command(command):
    """Run a shell command and return the output."""
    try:
        result = subprocess.run(
            command,
            shell=True,
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        return f"Error: {e.stderr}"

def check_python():
    """Check Python installation and version."""
    print("\n" + "="*50)
    print("Python Environment Check")
    print("="*50)
    
    # Python version
    print(f"Python Version: {sys.version}")
    print(f"Executable: {sys.executable}")
    
    # Check pip
    pip_version = run_command("pip --version")
    if "Error:" in pip_version:
        print("❌ pip is not installed or not in PATH")
        return False
    print(f"\n✅ pip is installed:\n{pip_version}")
    
    return True

def check_django():
    """Check Django installation and version."""
    print("\n" + "="*50)
    print("Django Check")
    print("="*50)
    
    # Check Django installation
    try:
        import django
        print(f"✅ Django {django.__version__} is installed")
        return True
    except ImportError:
        print("❌ Django is not installed")
        print("Install with: pip install django")
        return False

def main():
    """Main function to run all checks."""
    success = True
    
    if not check_python():
        success = False
    
    if not check_django():
        success = False
    
    print("\n" + "="*50)
    if success:
        print("✅ All checks passed!")
        return 0
    else:
        print("❌ Some checks failed. Please fix the issues above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
