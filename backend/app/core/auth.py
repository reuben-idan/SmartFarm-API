import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Configuration from environment variables
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/token")

# Token models
class TokenData(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    is_admin: bool = False

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash."""
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        # Log the error in production
        print(f"Password verification error: {str(e)}")
        return False

def get_password_hash(password: str) -> str:
    """Generate a password hash."""
    return pwd_context.hash(password)

def create_access_token(
    data: dict, 
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a JWT access token.
    
    Args:
        data: The data to include in the token
        expires_delta: Optional expiration time delta
        
    Returns:
        str: The encoded JWT token
    """
    to_encode = data.copy()
    now = datetime.utcnow()
    
    # Set expiration
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
    # Add standard claims
    to_encode.update({
        "exp": expire,
        "iat": now,
        "nbf": now,
    })
    
    try:
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating access token: {str(e)}"
        )

async def get_current_user(
    request: Request,
    token: str = Depends(oauth2_scheme)
) -> Dict[str, Any]:
    """
    Get the current authenticated user from the JWT token.
    
    Args:
        token: The JWT token from the Authorization header
        
    Returns:
        Dict containing user information
        
    Raises:
        HTTPException: If the token is invalid or user not found
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decode the JWT token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Extract user data from token
        username: str = payload.get("sub")
        email: str = payload.get("email")
        is_admin: bool = payload.get("is_admin", False)
        
        if not username or not email:
            raise credentials_exception
            
        # In a real app, you would fetch the user from your database here
        # For now, we'll return the data from the token
        user = {
            "username": username,
            "email": email,
            "is_admin": is_admin,
            "token_payload": payload
        }
        
        # You could add additional validation here, like checking if the user exists in the DB
        # or if their account is active, etc.
        
        return user
        
    except JWTError as e:
        # Log the error for debugging
        print(f"JWT validation error: {str(e)}")
        raise credentials_exception

async def get_current_active_user(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get the current active user.
    
    This can be extended to check for additional conditions like:
    - Is the user's email verified?
    - Is the user's account active?
    - Is the user's account locked?
    """
    # Example: Check if user is active
    # if not current_user.get("is_active", True):
    #     raise HTTPException(
    #         status_code=status.HTTP_403_FORBIDDEN,
    #         detail="Inactive user"
    #     )
    return current_user

async def get_current_admin_user(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get the current admin user.
    
    Raises:
        HTTPException: If the user is not an admin
    """
    if not current_user.get("is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
    return current_user
