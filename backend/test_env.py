#!/usr/bin/env python
"""
Basic environment test script.
"""
import sys

def main():
    print("Python version:", sys.version)
    print("Python executable:", sys.executable)
    print("Working directory:", os.getcwd())
    print("Environment variables:")
    for key in sorted(os.environ.keys()):
        if 'PYTHON' in key or 'DJANGO' in key or 'PATH' in key:
            print(f"  {key}: {os.environ[key]}")
    return 0

if __name__ == '__main__':
    import os
    sys.exit(main())
