import requests
import json
from datetime import datetime

BASE_URL = 'http://localhost:8000/api'

def print_response(response, show_headers=True):
    print(f"Status Code: {response.status_code}")
    if show_headers:
        print("Headers:")
        for key, value in response.headers.items():
            print(f"  {key}: {value}")
    try:
        print("Response:", json.dumps(response.json(), indent=2))
    except:
        print("Response:", response.text)
    print("-" * 80)

def test_api_root():
    print("\n=== Testing API Root ===")
    response = requests.get(f"{BASE_URL}/")
    print_response(response)

def test_registration():
    print("\n=== Testing Registration ===")
    test_email = f"test_{int(datetime.now().timestamp())}@example.com"
    data = {
        "email": test_email,
        "password1": "TestPass123!",
        "password2": "TestPass123!",
        "first_name": "Test",
        "last_name": "User"
    }
    response = requests.post(f"{BASE_URL}/auth/register/", json=data)
    print_response(response)
    return response

def test_login():
    print("\n=== Testing Login ===")
    data = {
        "email": "admin@example.com",  # Replace with test user email
        "password": "adminpass"        # Replace with test user password
    }
    response = requests.post(f"{BASE_URL}/auth/login/", json=data)
    print_response(response)
    if response.status_code == 200:
        return response.json().get('access')
    return None

def test_current_user(access_token):
    if not access_token:
        print("No access token available. Login first.")
        return
        
    print("\n=== Testing Current User ===")
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(f"{BASE_URL}/auth/me/", headers=headers)
    print_response(response)

if __name__ == "__main__":
    # Test API root
    test_api_root()
    
    # Test registration
    test_registration()
    
    # Test login and get current user
    access_token = test_login()
    if access_token:
        test_current_user(access_token)
