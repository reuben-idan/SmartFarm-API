import os
import json
import firebase_admin
from firebase_admin import credentials

def initialize_firebase():
    """Initialize Firebase Admin SDK with credentials from environment variable."""
    firebase_key = os.getenv("FIREBASE_KEY")
    
    if not firebase_key:
        raise RuntimeError("FIREBASE_KEY environment variable not set")
    
    try:
        # Parse the JSON string from environment variable
        firebase_config = json.loads(firebase_key)
        
        # Initialize Firebase Admin SDK if not already initialized
        if not firebase_admin._apps:
            cred = credentials.Certificate(firebase_config)
            firebase_admin.initialize_app(cred)
            print("Firebase Admin SDK initialized successfully")
    except json.JSONDecodeError:
        raise ValueError("Invalid JSON in FIREBASE_KEY environment variable")
    except Exception as e:
        raise RuntimeError(f"Failed to initialize Firebase Admin SDK: {str(e)}")

# Initialize Firebase when this module is imported
initialize_firebase()
