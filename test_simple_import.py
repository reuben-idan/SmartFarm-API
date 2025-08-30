#!/usr/bin/env python
"""
Simple script to test Python and Django imports.
"""
import os
import sys

print("Python version:", sys.version)
print("Python executable:", sys.executable)
print("Working directory:", os.getcwd())
print("\nPython path:")
for p in sys.path:
    print(f"  - {p}")

print("\nTrying to import Django...")
try:
    import django
    print(f"Successfully imported Django {django.__version__}")
    
    print("\nTrying to import config...")
    try:
        import config
        print(f"Successfully imported config from: {os.path.dirname(config.__file__)}")
    except ImportError as e:
        print(f"Error importing config: {e}")
        
        # Try to find the config module
        print("\nSearching for config module...")
        for root, dirs, files in os.walk('.'):
            if 'config' in dirs:
                config_path = os.path.join(root, 'config')
                print(f"Found config directory at: {os.path.abspath(config_path)}")
                init_py = os.path.join(config_path, '__init__.py')
                print(f"  - __init__.py exists: {os.path.exists(init_py)}")
                
                # Try to add parent directory to path and import
                parent_dir = os.path.dirname(config_path)
                if parent_dir not in sys.path:
                    sys.path.insert(0, parent_dir)
                try:
                    import config
                    print(f"Successfully imported config after adding {parent_dir} to path")
                    break
                except ImportError as e:
                    print(f"Still can't import config: {e}")
    
except ImportError as e:
    print(f"Error importing Django: {e}")
    print("Make sure Django is installed in your Python environment.")
