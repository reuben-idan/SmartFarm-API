import json
import os
from pathlib import Path

def setup_firebase_env():
    """
    Read the Firebase service account key and create/update the .env file
    with the required environment variables.
    """
    print("\n🔧 Setting up Firebase environment variables\n")
    
    # Paths
    project_root = Path(__file__).parent.parent
    env_file = project_root / '.env'
    key_file = project_root / 'backend' / 'serviceAccountKey.json'
    
    # Check if service account key exists
    if not key_file.exists():
        print(f"❌ Error: {key_file} not found.")
        print("Please place your serviceAccountKey.json file in the backend directory.")
        return False
    
    try:
        # Read the service account key
        with open(key_file, 'r') as f:
            service_account = json.load(f)
        
        # Define the environment variables to set
        env_vars = {
            'FIREBASE_TYPE': service_account.get('type', ''),
            'FIREBASE_PROJECT_ID': service_account.get('project_id', ''),
            'FIREBASE_PRIVATE_KEY_ID': service_account.get('private_key_id', ''),
            'FIREBASE_PRIVATE_KEY': service_account.get('private_key', '').replace('\n', '\\n'),
            'FIREBASE_CLIENT_EMAIL': service_account.get('client_email', ''),
            'FIREBASE_CLIENT_ID': service_account.get('client_id', ''),
            'FIREBASE_AUTH_URI': service_account.get('auth_uri', ''),
            'FIREBASE_TOKEN_URI': service_account.get('token_uri', ''),
            'FIREBASE_AUTH_PROVIDER_X509_CERT_URL': service_account.get('auth_provider_x509_cert_url', ''),
            'FIREBASE_CLIENT_X509_CERT_URL': service_account.get('client_x509_cert_url', '')
        }
        
        # Read existing .env file if it exists
        existing_vars = {}
        if env_file.exists():
            with open(env_file, 'r') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        key, value = line.split('=', 1)
                        existing_vars[key] = value
        
        # Update with new Firebase variables
        existing_vars.update(env_vars)
        
        # Write back to .env file
        with open(env_file, 'w') as f:
            f.write("# Firebase Configuration\n")
            for key, value in existing_vars.items():
                # Skip empty values
                if value:
                    f.write(f"{key}={value}\n")
        
        print(f"✅ Successfully updated {env_file} with Firebase configuration")
        print("\n🔒 Important: Make sure to keep your .env file secure and never commit it to version control.")
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    setup_firebase_env()
