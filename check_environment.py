#!/usr/bin/env python
"""
Check Python and Django environment setup.
"""
import os
import sys

def print_section(title):
    """Print a section header."""
    print("\n" + "=" * 60)
    print(f"{title}")
    print("=" * 60)

def check_python():
    """Check Python environment."""
    print_section("Python Environment")
    print(f"Python executable: {sys.executable}")
    print(f"Python version: {sys.version}")
    print(f"Working directory: {os.getcwd()}")
    print("\nPython path:")
    for p in sys.path:
        print(f"  - {p}")

def check_django():
    """Check Django installation."""
    print_section("Django Installation")
    try:
        import django
        print(f"Django version: {django.__version__}")
        return True
    except ImportError:
        print("Django is not installed in this environment.")
        return False

def check_project_structure():
    """Check project structure."""
    print_section("Project Structure")
    
    def check_dir(path, name):
        exists = os.path.exists(path)
        print(f"{name}: {'✅ Found' if exists else '❌ Missing'}")
        if exists:
            print(f"  Path: {os.path.abspath(path)}")
        return exists
    
    # Check important directories and files
    check_dir(".", "Project root")
    check_dir("backend", "Backend directory")
    check_dir("backend/config", "Config directory")
    check_dir("backend/config/__init__.py", "Config __init__.py")
    check_dir("backend/config/settings", "Settings directory")
    check_dir("backend/config/settings/test.py", "Test settings")
    check_dir("backend/apps/farmers/tests", "Farmers tests directory")

def main():
    """Main function."""
    check_python()
    if check_django():
        check_project_structure()

if __name__ == "__main__":
    main()
