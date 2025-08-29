"""
Clean up the SmartFarm API project by removing redundant files and directories.
This script will keep only the essential frontend and backend structure.
"""

import os
import shutil
from pathlib import Path

# Base project directory
BASE_DIR = Path(__file__).resolve().parent

# Directories to keep
KEEP_DIRS = {
    'backend': [
        'apps/',
        'config/',  # Django settings and URLs
        'manage.py',
        'requirements.txt',
        '.env.example',
    ],
    'frontend': [
        'frontend/',  # Main frontend directory
        'package.json',
        'vite.config.js',
        'tailwind.config.js',
    ]
}

# Directories to remove (relative to BASE_DIR)
REMOVE_DIRS = [
    '__pycache__',
    '.pytest_cache',
    '.venv',
    'venv',
    'venv_clean',
    'node_modules',
    '.vscode',
    '.github',
    'docs',
    'media',
    'static',
    'staticfiles',
    'templates',
    'test-vite',
    'test-vite-app',
    'test-vite-app-2',
    'frontend_backup',
    'scripts',
    'smartfarm',  # Old Django project root
    'farmers',
    'yields',
    'reports',
    'prices',
    'recommendations',
    'support',
    'suppliers',
    'crops',
    'users',
    'tests',
    'config',
    'cleanup_project.py',
    'restructure_project.py',
    '%TEMP%',
    '%TEMP%smartfarm-venv',
    '%USERPROFILE%'s.txt',
]

# Files to keep (relative to BASE_DIR)
KEEP_FILES = [
    'manage.py',
    'requirements.txt',
    '.gitignore',
    'README.md',
    'pyproject.toml',
    'setup.cfg',
]

def is_safe_to_delete(path: Path) -> bool:
    """Check if it's safe to delete a path."""
    # Don't delete the script itself
    if path.resolve() == Path(__file__).resolve():
        return False
        
    # Don't delete the base directory
    if path.resolve() == BASE_DIR.resolve():
        return False
        
    return True

def remove_path(path: Path):
    """Safely remove a file or directory."""
    if not is_safe_to_delete(path):
        print(f"Skipping protected path: {path}")
        return
        
    try:
        if path.is_file() or path.is_symlink():
            path.unlink()
            print(f"Removed file: {path}")
        elif path.is_dir():
            shutil.rmtree(path)
            print(f"Removed directory: {path}")
    except Exception as e:
        print(f"Error removing {path}: {e}")

def clean_project():
    """Clean up the project directory."""
    print("Starting project cleanup...")
    
    # First, remove all directories in REMOVE_DIRS
    for dir_name in REMOVE_DIRS:
        dir_path = BASE_DIR / dir_name
        if dir_path.exists():
            remove_path(dir_path)
    
    # Remove all files in the root directory except those in KEEP_FILES
    for item in BASE_DIR.glob('*'):
        if item.is_file() and item.name not in KEEP_FILES and not item.name.startswith('.'):
            remove_path(item)
    
    # Clean up Python cache files
    for pycache in BASE_DIR.rglob('__pycache__'):
        remove_path(pycache)
    
    print("\nCleanup complete!")
    print("The project structure has been simplified to contain only essential files and directories.")

if __name__ == "__main__":
    print("This script will remove redundant files and directories from the project.")
    print("The following directories will be removed:")
    for dir_name in REMOVE_DIRS:
        print(f"- {dir_name}")
    
    confirm = input("\nDo you want to proceed? (y/n): ")
    if confirm.lower() == 'y':
        clean_project()
    else:
        print("Cleanup cancelled.")
