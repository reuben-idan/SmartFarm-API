import os
import json
import firebase_admin
from firebase_admin import credentials, auth

def get_firebase_credentials():
    """Get Firebase credentials from environment variables"""
    # Try to get credentials from environment variables first
    service_account_info = {
        "type": os.getenv("FIREBASE_TYPE"),
        "project_id": os.getenv("FIREBASE_PROJECT_ID"),
        "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
        "private_key": os.getenv("FIREBASE_PRIVATE_KEY", "").replace('\\n', '\n') if os.getenv("FIREBASE_PRIVATE_KEY") else "",
        "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
        "client_id": os.getenv("FIREBASE_CLIENT_ID"),
        "auth_uri": os.getenv("FIREBASE_AUTH_URI"),
        "token_uri": os.getenv("FIREBASE_TOKEN_URI"),
        "auth_provider_x509_cert_url": os.getenv("FIREBASE_AUTH_PROVIDER_X509_CERT_URL"),
        "client_x509_cert_url": os.getenv("FIREBASE_CLIENT_X509_CERT_URL"),
        "universe_domain": "googleapis.com"
    }
    
    # Verify all required environment variables are set
    missing_vars = [key for key, value in service_account_info.items() 
                   if value is None and key not in ['universe_domain']]
    
    if not missing_vars:
        return credentials.Certificate(service_account_info)
    
    # Fallback to service account key file if environment variables are not set
    from pathlib import Path
    import os
    
    BASE_DIR = Path(__file__).resolve().parent.parent.parent
    service_account_key_path = os.path.join(BASE_DIR, 'backend', 'serviceAccountKey.json')
    
    if os.path.exists(service_account_key_path):
        return credentials.Certificate(service_account_key_path)
    
    raise ValueError(
        "Firebase credentials not found. Please set the required environment variables "
        "or place a serviceAccountKey.json file in the backend directory."
    )

def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    if not firebase_admin._apps:
        cred = get_firebase_credentials()
        firebase_admin.initialize_app(cred)

async def get_current_user(token: str) -> dict:
    """
    Verify the ID token and return the user info.
    Raises:
        HTTPException: If token is invalid or user not found
    """
    try:
        # Verify the ID token while checking if the token is revoked
        decoded_token = auth.verify_id_token(token, check_revoked=True)
        return decoded_token
    except auth.RevokedIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except (auth.InvalidIdTokenError, auth.ExpiredIdTokenError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Initialize Firebase when this module is imported
initialize_firebase()
