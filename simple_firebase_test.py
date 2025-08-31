print("Testing Firebase Admin SDK installation...")
try:
    import firebase_admin
    print("✅ Firebase Admin SDK is installed")
    print(f"Version: {firebase_admin.__version__}")
    
    # Try to initialize with dummy credentials to test the import
    from firebase_admin import credentials
    print("✅ firebase_admin.credentials imported successfully")
    
    # Try to import auth
    from firebase_admin import auth
    print("✅ firebase_admin.auth imported successfully")
    
    print("\nFirebase Admin SDK appears to be working correctly!")
    
except ImportError as e:
    print(f"❌ Error importing Firebase Admin SDK: {e}")
    print("\nTry installing it with: pip install firebase-admin")
except Exception as e:
    print(f"❌ An error occurred: {e}")
