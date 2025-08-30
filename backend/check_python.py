#!/usr/bin/env python
"""
Check Python environment and basic imports.
"""
import sys
import os

def main():
    print("Python version:", sys.version)
    print("Python path:", sys.path)
    print("Current working directory:", os.getcwd())
    
    try:
        import django
        print("Django version:", django.__version__)
    except ImportError as e:
        print("Error importing Django:", e)
    
    try:
        import pytest
        print("pytest version:", pytest.__version__)
    except ImportError as e:
        print("Error importing pytest:", e)
    
    print("Environment variables:")
    for key, value in os.environ.items():
        if 'PYTHON' in key or 'DJANGO' in key or 'PATH' in key:
            print(f"{key}: {value}")

if __name__ == '__main__':
    main()
