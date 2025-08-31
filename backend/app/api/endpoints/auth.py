from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Form, Request
from fastapi.security import OAuth2PasswordRequestForm
from typing import Any, Optional
from app.api.deps import get_current_active_user, get_current_admin_user
from app.core.auth import (
    get_password_hash,
    create_access_token,
    verify_password,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from app.initial_data import db

router = APIRouter()

# Get the mock database users
fake_users_db = db.users

@router.post("/token")
async def login_for_access_token(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends()
):
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    # Get client IP for logging
    client_host = request.client.host if request.client else "unknown"
    
    try:
        user = authenticate_user(fake_users_db, form_data.username, form_data.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Create token with additional user data
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        token_data = {
            "sub": user["username"],
            "email": user["email"],
            "is_admin": user.get("is_admin", False)
        }
        
        access_token = create_access_token(
            data=token_data, 
            expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "username": user["username"],
                "email": user["email"],
                "is_admin": user.get("is_admin", False)
            }
        }
    except Exception as e:
        # Log the error
        print(f"Login failed for {form_data.username} from {client_host}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during login",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.get("/me", response_model=dict)
async def read_users_me(current_user: dict = Depends(get_current_active_user)):
    """
    Get current user information.
    This is a protected endpoint that requires a valid JWT token.
    """
    return {
        "username": current_user.get("username"),
        "email": current_user.get("email"),
        "is_admin": current_user.get("is_admin", False)
    }

def authenticate_user(users_db, username: str, password: str):
    """
    Authenticate a user with username/email and password
    """
    try:
        # First try to find by email
        user = next((u for u in users_db.values() if u["email"] == username), None)
        
        # If not found by email, try by username
        if not user:
            user = next((u for u in users_db.values() if u["username"] == username), None)
        
        # If user not found or password doesn't match
        if not user or not verify_password(password, user["hashed_password"]):
            return None
            
        return user
    except Exception as e:
        print(f"Authentication error for {username}: {str(e)}")
        return None

@router.get("/protected")
async def protected_route(current_user: dict = Depends(get_current_active_user)):
    """
    Example of a protected route.
    Only accessible with a valid JWT token.
    """
    return {
        "message": "You have access to this protected resource!", 
        "user": current_user.get("username")
    }

@router.get("/admin")
async def admin_route(current_user: dict = Depends(get_current_admin_user)):
    """
    Example of an admin-only route.
    Only accessible to users with admin privileges.
    """
    return {"message": f"Welcome admin {current_user.get('username')}! You have admin access."}
