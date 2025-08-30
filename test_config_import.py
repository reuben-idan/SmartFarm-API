#!/usr/bin/env python
"""
Test script to check if config module can be imported.
"""
import os
import sys

# Add the backend directory to Python path
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

print(f"Python path: {sys.path}\n")

# Try to import config
try:
    import config
    print(f"Successfully imported config from: {os.path.dirname(config.__file__)}")
    print(f"Config module contents: {dir(config)}")
    
    # Try to import settings
    try:
        from config import settings
        print("\nSuccessfully imported config.settings")
        print(f"Settings module contents: {dir(settings)}")
    except ImportError as e:
        print(f"\nError importing config.settings: {e}")
        
except ImportError as e:
    print(f"Error importing config: {e}")
    
    # Try to find config module
    print("\nSearching for config module...")
    for root, dirs, files in os.walk('.'):
        if 'config' in dirs:
            config_path = os.path.abspath(os.path.join(root, 'config'))
            print(f"Found config directory at: {config_path}")
            
            # Check for __init__.py
            init_py = os.path.join(config_path, '__init__.py')
            print(f"  - __init__.py exists: {os.path.exists(init_py)}")
            
            # Check for settings directory
            settings_dir = os.path.join(config_path, 'settings')
            print(f"  - settings directory exists: {os.path.isdir(settings_dir)}")
            
            if os.path.isdir(settings_dir):
                print("  - Settings files:")
                try:
                    for f in os.listdir(settings_dir):
                        if f.endswith('.py') and not f.startswith('__'):
                            print(f"    - {f}")
                except Exception as e:
                    print(f"    Error listing settings files: {e}")
