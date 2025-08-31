import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Add the project root to the Python path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

from backend.app.core.firebase import initialize_firebase, get_current_user
import asyncio
import firebase_admin

async def test_firebase_connection():
    try:
        # Initialize Firebase
        initialize_firebase()
        print("✅ Firebase initialized successfully")
        
        # Print some debug info
        print("\nFirebase Configuration:")
        print(f"Project ID: {os.getenv('FIREBASE_PROJECT_ID')}")
        print(f"Client Email: {os.getenv('FIREBASE_CLIENT_EMAIL')}")
        
        # Test getting the auth client
        auth_client = firebase_admin.auth
        print("\n✅ Successfully connected to Firebase Auth")
        
        # List first 10 users (if any)
        try:
            print("\nListing first 10 users (if any):")
            users = auth_client.list_users(max_results=10).iterate_all()
            for user in users:
                print(f"- {user.uid}: {user.email or 'No email'} ({user.display_name or 'No name'})")
        except Exception as e:
            print(f"⚠️ Error listing users: {str(e)}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error initializing Firebase: {str(e)}\n")
        print("Make sure you have set up the required environment variables in your .env file:")
        print("FIREBASE_TYPE=service_account")
        print("FIREBASE_PROJECT_ID=your-project-id")
        print("FIREBASE_PRIVATE_KEY_ID=your-private-key-id")
        print("FIREBASE_PRIVATE_KEY=your-private-key")
        print("FIREBASE_CLIENT_EMAIL=your-client-email")
        print("FIREBASE_CLIENT_ID=your-client-id")
        print("FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth")
        print("FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token")
        print("FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs")
        print("FIREBASE_CLIENT_X509_CERT_URL=your-client-x509-cert-url")
        return False

if __name__ == "__main__":
    asyncio.run(test_firebase_connection())
