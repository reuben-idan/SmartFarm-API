import os
import sys
import subprocess
import platform

def print_header(title):
    print("\n" + "=" * 80)
    print(f"{title:^80}")
    print("=" * 80)

def run_command(cmd):
    print(f"\n$ {cmd}")
    try:
        result = subprocess.run(
            cmd, 
            shell=True, 
            capture_output=True, 
            text=True,
            cwd=os.getcwd()
        )
        print(f"Exit code: {result.returncode}")
        if result.stdout:
            print("Output:")
            print(result.stdout)
        if result.stderr:
            print("Error:")
            print(result.stderr)
        return result.returncode == 0
    except Exception as e:
        print(f"Error running command: {e}")
        return False

def check_python():
    print_header("PYTHON ENVIRONMENT")
    print(f"Python executable: {sys.executable}")
    print(f"Python version: {platform.python_version()}")
    print(f"Working directory: {os.getcwd()}")
    
    # Check important environment variables
    for var in ['PYTHONPATH', 'DJANGO_SETTINGS_MODULE', 'PATH']:
        print(f"{var}: {os.environ.get(var, 'Not set')}")

def check_django():
    print_header("DJANGO CHECK")
    try:
        import django
        print(f"Django version: {django.__version__}")
        print("Django is installed and importable.")
        return True
    except ImportError:
        print("Django is not installed or not in PYTHONPATH.")
        return False

def check_database():
    print_header("DATABASE CHECK")
    db_path = os.path.join(os.getcwd(), 'db.sqlite3')
    print(f"Database path: {db_path}")
    
    if os.path.exists(db_path):
        print(f"Database file exists. Size: {os.path.getsize(db_path)} bytes")
        try:
            import sqlite3
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            tables = cursor.fetchall()
            print(f"Found {len(tables)} tables in the database.")
            conn.close()
            return True
        except Exception as e:
            print(f"Error checking database: {e}")
            return False
    else:
        print("Database file does not exist.")
        return False

def main():
    print_header("SMARTFARM API DIAGNOSTIC TOOL")
    
    # Check Python environment
    check_python()
    
    # Check Django installation
    django_ok = check_django()
    
    # Check database
    db_ok = check_database()
    
    print_header("RECOMMENDED ACTIONS")
    if not django_ok:
        print("1. Install Django: pip install django")
    
    if not db_ok:
        print("2. Create and migrate database:")
        print("   python manage.py makemigrations")
        print("   python manage.py migrate")
    
    print("\nTo run the development server:")
    print("   python manage.py runserver 8001 --settings=smartfarm.settings.local")

if __name__ == "__main__":
    main()
