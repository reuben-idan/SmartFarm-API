from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth

# HTTP Bearer token scheme for API authentication
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Dependency to get the current authenticated user from the Firebase token.
    
    Args:
        credentials: HTTP Authorization header containing the Bearer token
        
    Returns:
        dict: Decoded Firebase token containing user information
        
    Raises:
        HTTPException: If authentication fails or token is invalid/expired
    """
    if not credentials or not credentials.scheme == "Bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    
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
            detail=f"Could not validate credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
