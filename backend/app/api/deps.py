from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer

from app.core.auth import (
    get_current_user,
    get_current_active_user as get_auth_active_user,
    get_current_admin_user as get_auth_admin_user,
    oauth2_scheme
)

# Re-export the auth dependencies for easier imports
# These can be used in route dependencies like: Depends(get_current_active_user)

def get_current_user_dependency(
    request: Request,
    token: str = Depends(oauth2_scheme)
) -> Dict[str, Any]:
    """
    Dependency that will return the current user if the token is valid.
    
    This is a wrapper around the core auth function to maintain compatibility.
    """
    return get_current_user(request, token)

async def get_current_active_user(
    current_user: Dict[str, Any] = Depends(get_auth_active_user)
) -> Dict[str, Any]:
    """
    Dependency that will return the current active user.
    
    This ensures the user's account is active and they have valid credentials.
    """
    return current_user

async def get_current_admin_user(
    current_user: Dict[str, Any] = Depends(get_auth_admin_user)
) -> Dict[str, Any]:
    """
    Dependency that will return the current user only if they are an admin.
    
    This should be used for routes that require admin privileges.
    """
    return current_user

# For backward compatibility
get_current_user = get_current_user_dependency
