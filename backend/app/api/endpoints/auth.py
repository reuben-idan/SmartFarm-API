from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from typing import Any
from app.api.deps import get_current_active_user

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@router.get("/me", response_model=dict)
async def read_users_me(current_user: dict = Depends(get_current_active_user)):
    """
    Get current user information.
    This is a protected endpoint that requires a valid JWT token.
    """
    return {
        "uid": current_user.get("uid"),
        "email": current_user.get("email"),
        "email_verified": current_user.get("email_verified", False),
        "name": current_user.get("name"),
        "picture": current_user.get("picture"),
    }

@router.get("/protected")
async def protected_route(current_user: dict = Depends(get_current_active_user)):
    """
    Example of a protected route.
    Only accessible with a valid JWT token.
    """
    return {"message": "You have access to this protected resource!", "user_id": current_user.get("uid")}

# Example of an admin-only route
@router.get("/admin")
async def admin_route(current_user: dict = Depends(get_current_admin_user)):
    """
    Example of an admin-only route.
    Only accessible to users with admin privileges.
    """
    return {"message": "Welcome admin!"}
