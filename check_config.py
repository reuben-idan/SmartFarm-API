#!/usr/bin/env python
"""
Check if the config module can be imported.
"""
import os
import sys

def main():
    # Add the project root to the Python path
    project_root = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(project_root, 'backend')
    
    print("Project root:", project_root)
    print("Backend dir:", backend_dir)
    
    # Add both to Python path
    for path in [project_root, backend_dir]:
        if path not in sys.path:
            sys.path.insert(0, path)
    
    print("\nPython path:")
    for p in sys.path:
        print(f"  - {p}")
    
    # Try to import config
    print("\nTrying to import config...")
    try:
        import config
        print("Successfully imported config from:", os.path.dirname(config.__file__))
    except ImportError as e:
        print(f"Error importing config: {e}")
    
    # Check if the config directory exists
    config_dir = os.path.join(backend_dir, 'config')
    print(f"\nConfig directory exists: {os.path.exists(config_dir)}")
    if os.path.exists(config_dir):
        print("Contents of config directory:")
        for item in os.listdir(config_dir):
            print(f"  - {item}")
    
    # Check for __init__.py in config directory
    init_py = os.path.join(config_dir, '__init__.py')
    print(f"\n__init__.py exists in config directory: {os.path.exists(init_py)}")

if __name__ == "__main__":
    main()
