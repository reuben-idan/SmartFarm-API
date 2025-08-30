import os
import sys

def find_package_root():
    """Find the Python package root directory."""
    current = os.path.abspath('.')
    
    while True:
        # Check for __init__.py in current directory
        init_py = os.path.join(current, '__init__.py')
        if os.path.exists(init_py):
            return current
            
        # Move up one directory
        parent = os.path.dirname(current)
        if parent == current:
            break
        current = parent
    
    return None

def main():
    print("Checking package structure...\n")
    
    # Find package root
    pkg_root = find_package_root()
    if pkg_root:
        print(f"Found Python package root: {pkg_root}")
        
        # Add parent directory to Python path
        parent_dir = os.path.dirname(pkg_root)
        if parent_dir not in sys.path:
            sys.path.insert(0, parent_dir)
            print(f"Added to Python path: {parent_dir}")
        
        # Try to import config
        try:
            import config
            print("\nSuccessfully imported config module!")
            print(f"Location: {os.path.dirname(config.__file__)}")
            return 0
        except ImportError as e:
            print(f"\nError importing config: {e}")
    else:
        print("Could not find Python package root (directory with __init__.py)")
    
    # Show current directory structure
    print("\nCurrent directory structure:")
    for item in os.listdir('.'):
        path = os.path.join('.', item)
        if os.path.isdir(path):
            print(f"d {item}/")
            
            # Show first level of subdirectories
            try:
                for subitem in os.listdir(path)[:5]:  # Limit to first 5 items
                    subpath = os.path.join(path, subitem)
                    if os.path.isdir(subpath):
                        print(f"  d {subitem}/")
                    else:
                        print(f"  f {subitem}")
                if len(os.listdir(path)) > 5:
                    print("  ...")
            except (PermissionError, OSError):
                print("  [Error listing contents]")
        else:
            print(f"f {item}")
    
    return 1

if __name__ == "__main__":
    sys.exit(main())
