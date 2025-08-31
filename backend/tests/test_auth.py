import os
import pytest
from fastapi.testclient import TestClient
from fastapi import status

from app.main import app
from app.core.auth import (
    create_access_token,
    verify_password,
    get_password_hash,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)
from app.initial_data import get_initial_admin_user

client = TestClient(app)

def test_verify_password():
    """Test password verification."""
    password = "testpassword"
    hashed = get_password_hash(password)
    assert verify_password(password, hashed) is True
    assert verify_password("wrongpassword", hashed) is False

def test_create_access_token():
    """Test JWT token creation."""
    data = {"sub": "testuser", "email": "test@example.com", "is_admin": False}
    token = create_access_token(data)
    assert isinstance(token, str)
    assert len(token) > 0

def test_login_success():
    """Test successful login."""
    # Get admin credentials from environment
    admin = get_initial_admin_user()
    if not admin:
        pytest.skip("Admin credentials not found in environment")
    
    response = client.post(
        "/api/auth/token",
        data={
            "username": admin["username"],
            "password": os.getenv("ADMIN_PASSWORD"),
        },
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert "user" in data
    assert data["user"]["username"] == admin["username"]
    assert data["user"]["email"] == admin["email"]
    assert data["user"]["is_admin"] is True

def test_login_invalid_credentials():
    """Test login with invalid credentials."""
    response = client.post(
        "/api/auth/token",
        data={"username": "nonexistent", "password": "wrongpassword"},
    )
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "Incorrect username or password" in response.json().get("detail", "")

def test_protected_route():
    """Test accessing a protected route with a valid token."""
    # First get a token
    admin = get_initial_admin_user()
    if not admin:
        pytest.skip("Admin credentials not found in environment")
    
    login_response = client.post(
        "/api/auth/token",
        data={
            "username": admin["username"],
            "password": os.getenv("ADMIN_PASSWORD"),
        },
    )
    
    token = login_response.json()["access_token"]
    
    # Now access protected route
    response = client.get(
        "/api/protected",
        headers={"Authorization": f"Bearer {token}"},
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "message" in data
    assert data["user"] == admin["username"]

def test_protected_route_no_token():
    """Test accessing a protected route without a token."""
    response = client.get("/api/protected")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "Not authenticated" in response.json().get("detail", "")
