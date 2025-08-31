import os
import firebase_admin
from firebase_admin import credentials

def test_firebase():
    print("Testing Firebase connection...")
    
    # Path to service account key
    key_path = os.path.join('backend', 'serviceAccountKey.json')
    
    if not os.path.exists(key_path):
        print(f"❌ Error: {key_path} not found")
        return False
    
    try:
        print("Initializing Firebase Admin SDK...")
        cred = credentials.Certificate(key_path)
        firebase_admin.initialize_app(cred)
        print("✅ Firebase Admin SDK initialized successfully")
        
        # Test authentication
        print("\nTesting Firebase Auth...")
        auth = firebase_admin.auth
        print("✅ Firebase Auth module loaded successfully")
        
        # List users (up to 5)
        print("\nListing up to 5 users:")
        try:
            users = auth.list_users(max_results=5).iterate_all()
            user_count = 0
            for user in users:
                print(f"- {user.uid}: {user.email or 'No email'}")
                user_count += 1
            if user_count == 0:
                print("No users found in the Firebase project")
        except Exception as e:
            print(f"⚠️ Error listing users: {str(e)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False
    finally:
        # Clean up
        if firebase_admin._DEFAULT_APP_NAME in firebase_admin._apps:
            firebase_admin.delete_app(firebase_admin.get_app())

if __name__ == "__main__":
    test_firebase()
