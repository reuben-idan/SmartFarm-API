import os
import sys
import json

def test_environment():
    print("Testing Python environment and file access...\n")
    
    # Print Python info
    print(f"Python Executable: {sys.executable}")
    print(f"Python Version: {sys.version}")
    print(f"Working Directory: {os.getcwd()}")
    
    # Test file access
    key_path = os.path.join('backend', 'serviceAccountKey.json')
    print(f"\nTesting access to: {os.path.abspath(key_path)}")
    
    if os.path.exists(key_path):
        print("✅ File exists")
        try:
            with open(key_path, 'r') as f:
                content = f.read()
                print(f"✅ File is readable ({len(content)} bytes)")
                try:
                    data = json.loads(content)
                    print("✅ File contains valid JSON")
                    print(f"Project ID: {data.get('project_id')}")
                except json.JSONDecodeError as e:
                    print(f"❌ Invalid JSON: {e}")
        except Exception as e:
            print(f"❌ Error reading file: {e}")
    else:
        print("❌ File does not exist")
    
    # Test Firebase import
    print("\nTesting Firebase Admin SDK import...")
    try:
        import firebase_admin
        from firebase_admin import credentials
        print(f"✅ Firebase Admin SDK imported successfully (v{firebase_admin.__version__})")
        
        # Test credential creation
        try:
            if os.path.exists(key_path):
                cred = credentials.Certificate(key_path)
                print("✅ Successfully created credentials object")
        except Exception as e:
            print(f"❌ Error creating credentials: {e}")
            
    except ImportError as e:
        print(f"❌ Failed to import Firebase Admin SDK: {e}")
    
    print("\nTest complete!")

if __name__ == "__main__":
    test_environment()
