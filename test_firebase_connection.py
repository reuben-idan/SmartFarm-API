import os
import sys
import json
import firebase_admin
from firebase_admin import credentials, auth

def test_connection():
    print("Testing Firebase Admin SDK connection...")
    
    # Path to service account key
    key_path = os.path.join('backend', 'serviceAccountKey.json')
    print(f"Using key file: {os.path.abspath(key_path)}")
    
    if not os.path.exists(key_path):
        print("❌ Error: serviceAccountKey.json not found")
        return False
    
    try:
        # Initialize Firebase Admin SDK
        print("Initializing Firebase Admin SDK...")
        cred = credentials.Certificate(key_path)
        firebase_admin.initialize_app(cred)
        print("✅ Firebase Admin SDK initialized successfully")
        
        # Test getting project info
        project_id = cred.project_id
        print(f"\nProject ID: {project_id}")
        
        # Test listing users (first 5)
        print("\nAttempting to list users (first 5)...")
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
        print(f"❌ Error initializing Firebase Admin SDK: {str(e)}")
        return False
    finally:
        # Clean up
        if firebase_admin._DEFAULT_APP_NAME in firebase_admin._apps:
            firebase_admin.delete_app(firebase_admin.get_app())

if __name__ == "__main__":
    test_connection()
