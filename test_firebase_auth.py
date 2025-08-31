import os
import json
from pathlib import Path
import firebase_admin
from firebase_admin import credentials, auth

def test_firebase_auth():
    print("Testing Firebase Authentication...")
    
    # Path to service account key
    key_path = Path('backend/serviceAccountKey.json')
    
    if not key_path.exists():
        print(f"❌ Error: {key_path} not found")
        return False
    
    try:
        # Initialize Firebase Admin SDK
        print("Initializing Firebase Admin SDK...")
        cred = credentials.Certificate(str(key_path))
        firebase_admin.initialize_app(cred)
        print("✅ Firebase Admin SDK initialized successfully")
        
        # Test getting a list of users (first 5)
        print("\nListing first 5 users (if any):")
        try:
            users = auth.list_users(max_results=5).iterate_all()
            user_count = 0
            for user in users:
                print(f"- {user.uid}: {user.email or 'No email'}")
                user_count += 1
            if user_count == 0:
                print("No users found in the Firebase project")
        except Exception as e:
            print(f"⚠️ Note: {str(e)}")
            print("This is normal if you don't have any users yet or if there are permission issues.")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False
    finally:
        # Clean up
        if firebase_admin._DEFAULT_APP_NAME in firebase_admin._apps:
            firebase_admin.delete_app(firebase_admin.get_app())

if __name__ == "__main__":
    test_firebase_auth()
