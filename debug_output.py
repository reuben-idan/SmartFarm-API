import sys
import os

def write_to_file(filename, content):
    with open(filename, 'w') as f:
        f.write(content)

def main():
    output = []
    output.append("Python Environment Debug")
    output.append("=" * 40)
    output.append(f"Python Executable: {sys.executable}")
    output.append(f"Python Version: {sys.version}")
    output.append(f"Working Directory: {os.getcwd()}")
    
    try:
        import django
        output.append(f"\nDjango Version: {django.__version__}")
    except ImportError as e:
        output.append(f"\nDjango Import Error: {e}")
    
    try:
        import pytest
        output.append(f"\nPytest Version: {pytest.__version__}")
    except ImportError as e:
        output.append(f"\nPytest Import Error: {e}")
    
    # Write to file
    write_to_file('debug_output.txt', '\n'.join(output))
    print("Debug information written to debug_output.txt")

if __name__ == '__main__':
    main()
