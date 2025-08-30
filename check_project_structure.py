import os
import sys

def print_directory_structure(startpath, max_level=3, current_level=0):
    """Print directory structure up to max_level depth."""
    if current_level > max_level:
        return
        
    prefix = '    ' * current_level + '|-- '
    
    try:
        for item in os.listdir(startpath):
            path = os.path.join(startpath, item)
            print(prefix + item)
            if os.path.isdir(path):
                print_directory_structure(path, max_level, current_level + 1)
    except PermissionError:
        print(prefix + "[Permission Denied]")

def main():
    print("Project structure:")
    project_root = os.path.dirname(os.path.abspath(__file__))
    print_directory_structure(project_root, max_level=3)
    
    print("\nChecking for config module...")
    config_paths = []
    
    for root, dirs, _ in os.walk(project_root):
        if 'config' in dirs:
            config_dir = os.path.join(root, 'config')
            init_py = os.path.join(config_dir, '__init__.py')
            settings_dir = os.path.join(config_dir, 'settings')
            
            config_paths.append({
                'path': config_dir,
                'has_init': os.path.exists(init_py),
                'has_settings': os.path.isdir(settings_dir)
            })
    
    if not config_paths:
        print("No config directory found in the project!")
    else:
        print("\nFound config directories:")
        for i, config in enumerate(config_paths, 1):
            print(f"\nConfig {i}:")
            print(f"  Path: {config['path']}")
            print(f"  Has __init__.py: {config['has_init']}")
            print(f"  Has settings directory: {config['has_settings']}")
            
            if config['has_settings']:
                print("  Settings files:")
                try:
                    for f in os.listdir(config['path'] + '/settings'):
                        if f.endswith('.py') and f != '__pycache__':
                            print(f"    - {f}")
                except Exception as e:
                    print(f"    Error reading settings: {e}")

if __name__ == "__main__":
    main()
