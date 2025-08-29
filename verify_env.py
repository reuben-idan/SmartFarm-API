#!/usr/bin/env python
"""
Verify Python and Django environment.
"""
import sys

def check_environment():
    """Check Python and Django environment."""
    # Check Python version
    print("=" * 70)
    print("Python Environment Check")
    print("=" * 70)
    print(f"Python Version: {sys.version}")
    print(f"Executable: {sys.executable}")
    
    # Check Django installation
    try:
        import django
        print("\n✅ Django is installed")
        print(f"Django Version: {django.__version__}")
        return True
    except ImportError:
        print("\n❌ Django is not installed")
        print("Please install Django using: pip install django")
        return False

def main():
    """Main function."""
    if not check_environment():
        return 1
    return 0

if __name__ == "__main__":
    sys.exit(main())
