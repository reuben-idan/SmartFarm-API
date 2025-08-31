import firebase_admin
from firebase_admin import credentials
import os

def main():
    print("Testing Firebase Admin SDK...")
    
    # Path to service account key
    key_path = os.path.join('backend', 'serviceAccountKey.json')
    
    if not os.path.exists(key_path):
        print(f"❌ Error: {key_path} not found")
        return False
    
    try:
        print("Initializing Firebase Admin SDK...")
        cred = credentials.Certificate(key_path)
        app = firebase_admin.initialize_app(cred)
        print("✅ Firebase Admin SDK initialized successfully!")
        
        # Get auth client
        auth = firebase_admin.auth
        print("✅ Firebase Auth module loaded successfully")
        
        # Try to list users (will fail if no users, but that's okay)
        try:
            print("\nAttempting to list users...")
            users = auth.list_users(max_results=5).iterate_all()
            user_count = 0
            for user in users:
                print(f"- {user.uid}: {user.email or 'No email'}")
                user_count += 1
            if user_count == 0:
                print("No users found in the Firebase project")
        except Exception as e:
            print(f"⚠️ Note: {str(e)}")
            print("This is normal if you don't have any users yet.")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False
    finally:
        # Clean up
        if 'app' in locals():
            firebase_admin.delete_app(app)

if __name__ == "__main__":
    main()
