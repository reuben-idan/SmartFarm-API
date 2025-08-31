import os
import sys
import json

def main():
    print("=== Firebase Admin SDK Direct Test ===")
    print(f"Python: {sys.executable}")
    print(f"Version: {sys.version}")
    
    # Path to service account key
    key_path = os.path.join('backend', 'serviceAccountKey.json')
    print(f"\nLooking for key at: {os.path.abspath(key_path)}")
    
    # Check if key file exists
    if not os.path.exists(key_path):
        print("❌ ERROR: serviceAccountKey.json not found")
        return 1
    
    # Try to read the key file
    try:
        with open(key_path, 'r') as f:
            key_data = json.load(f)
        print("✅ Successfully read service account key")
        print(f"Project ID: {key_data.get('project_id')}")
    except Exception as e:
        print(f"❌ Error reading key file: {e}")
        return 1
    
    # Try to import firebase_admin
    try:
        import firebase_admin
        from firebase_admin import credentials
        print("\n✅ Successfully imported firebase_admin")
    except ImportError as e:
        print(f"\n❌ Failed to import firebase_admin: {e}")
        print("Please install it with: pip install firebase-admin")
        return 1
    
    # Try to initialize Firebase Admin SDK
    try:
        print("\nInitializing Firebase Admin SDK...")
        cred = credentials.Certificate(key_path)
        app = firebase_admin.initialize_app(cred)
        print("✅ Successfully initialized Firebase Admin SDK")
        
        # Test auth
        try:
            from firebase_admin import auth
            print("\nTesting Firebase Auth...")
            users = list(auth.list_users(max_results=1).iterate_all())
            print(f"✅ Successfully connected to Firebase Auth")
            print(f"   Found {len(users)} user(s) in the project")
        except Exception as e:
            print(f"⚠️  Auth test warning: {e}")
        
        # Clean up
        firebase_admin.delete_app(app)
        return 0
        
    except Exception as e:
        print(f"\n❌ Error initializing Firebase: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
