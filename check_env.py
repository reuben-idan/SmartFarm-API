#!/usr/bin/env python
"""Check Python environment and run basic tests."""
import sys
import os
import subprocess

def print_header(text):
    """Print a formatted header."""
    print("\n" + "=" * 50)
    print(f" {text} ".center(50, '='))
    print("=" * 50)

def run_command(cmd, cwd=None):
    """Run a command and return its output."""
    try:
        result = subprocess.run(
            cmd,
            cwd=cwd,
            shell=True,
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        return result.returncode, result.stdout, result.stderr
    except subprocess.CalledProcessError as e:
        return e.returncode, e.stdout, e.stderr

def main():
    """Main function to check environment and run tests."""
    print_header("ENVIRONMENT INFORMATION")
    
    # Python information
    print("\nPython Information:")
    print(f"Python Executable: {sys.executable}")
    print(f"Python Version: {sys.version}")
    print(f"Python Path: {sys.path}")
    
    # Check Django installation
    print("\nDjango Information:")
    rc, out, err = run_command("python -m django --version")
    if rc == 0:
        print(f"Django Version: {out.strip()}")
    else:
        print(f"Django not found or error: {err}")
    
    # Check pytest installation
    print("\nPytest Information:")
    rc, out, err = run_command("python -m pytest --version")
    if rc == 0:
        print(f"Pytest Version: {out.strip()}")
    else:
        print(f"Pytest not found or error: {err}")
    
    # Run a simple test
    print("\nRunning a simple test...")
    rc, out, err = run_command("python -c \"import unittest; unittest.main(exit=False, argv=['ignored', '-v'])\"")
    print(f"Simple test result (rc={rc}):")
    print(out)
    
    # List test files
    print("\nTest files found:")
    for root, _, files in os.walk("."):
        if "__pycache__" in root or ".git" in root:
            continue
        for file in files:
            if file.startswith("test_") and file.endswith(".py"):
                print(f"- {os.path.join(root, file)}")
    
    # Try to run Django tests
    print("\nTrying to run Django tests...")
    if os.path.exists("manage.py"):
        rc, out, err = run_command("python manage.py check")
        print(f"\nDjango check (rc={rc}):")
        print(out)
        
        if rc == 0:
            print("\nRunning Django tests...")
            rc, out, err = run_command("python manage.py test --noinput -v 2")
            print(f"\nDjango test output (rc={rc}):")
            print(out)
            if err:
                print("\nDjango test errors:")
                print(err)
    else:
        print("manage.py not found in current directory")

if __name__ == "__main__":
    main()
