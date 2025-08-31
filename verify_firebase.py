import os
import firebase_admin
from firebase_admin import credentials

def main():
    print("Firebase Admin SDK Verification")
    print("=" * 50)
    
    # Path to service account key
    key_path = os.path.join('backend', 'serviceAccountKey.json')
    print(f"Key path: {os.path.abspath(key_path)}")
    
    # Verify file exists and is readable
    if not os.path.exists(key_path):
        print("❌ Error: serviceAccountKey.json not found")
        return
    
    try:
        # Initialize Firebase Admin SDK
        print("\nInitializing Firebase Admin SDK...")
        cred = credentials.Certificate(key_path)
        app = firebase_admin.initialize_app(cred)
        print("✅ Firebase Admin SDK initialized successfully")
        
        # Get project ID from credentials
        print(f"\nProject ID: {cred.project_id}")
        
        # Test auth functionality
        print("\nTesting authentication...")
        try:
            from firebase_admin import auth
            print("✅ Auth module imported successfully")
            
            # Try to list users (should work even if no users exist)
            users = list(auth.list_users(max_results=2).iterate_all())
            print(f"Found {len(users)} user(s) in the project")
            
        except Exception as e:
            print(f"⚠️ Auth test warning: {e}")
        
        # Clean up
        firebase_admin.delete_app(app)
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
    
    print("\nVerification complete!")

if __name__ == "__main__":
    main()
