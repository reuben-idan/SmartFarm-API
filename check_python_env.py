#!/usr/bin/env python
"""
A simple script to verify the Python environment and Django installation.
"""
import sys
import os

def main():
    # Print basic environment information
    print("=" * 70)
    print("Python Environment Check")
    print("=" * 70)
    print(f"Python Version: {sys.version}")
    print(f"Executable: {sys.executable}")
    print(f"Working Directory: {os.getcwd()}")
    
    # Check Django installation
    try:
        import django
        print("\n✅ Django is installed")
        print(f"Django Version: {django.__version__}")
        return 0
    except ImportError:
        print("\n❌ Django is not installed. Please install it with: pip install django")
        return 1

if __name__ == "__main__":
    sys.exit(main())
