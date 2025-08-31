import os

def list_backend_files():
    backend_path = os.path.join(os.getcwd(), 'backend')
    print(f"Contents of {backend_path}:")
    
    if not os.path.exists(backend_path):
        print("❌ Error: backend directory not found")
        return False
    
    try:
        files = os.listdir(backend_path)
        for file in files:
            print(f"- {file}")
        return True
    except Exception as e:
        print(f"❌ Error listing directory: {str(e)}")
        return False

if __name__ == "__main__":
    list_backend_files()
