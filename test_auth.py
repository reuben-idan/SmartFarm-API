import requests
import json
import sys

BASE_URL = 'http://localhost:8000/api/'  # Base URL without version prefix
HEADERS = {'Content-Type': 'application/json'}

def print_request(method, url, data=None):
    print(f"\n{'='*50}")
    print(f"{method} {url}")
    if data:
        print("Request Data:", json.dumps(data, indent=2))
    print("="*50)

def print_response(response):
    try:
        print(f"Status Code: {response.status_code}")
        print("Response Headers:", dict(response.headers))
        if response.text:
            print("Response Body:", response.text)
    except Exception as e:
        print(f"Error printing response: {e}")

def test_registration():
    url = f"{BASE_URL}auth/auth/register/"
    data = {
        'email': 'test@example.com',
        'password': 'testpassword123',
        'password2': 'testpassword123',
        'first_name': 'Test',
        'last_name': 'User'
    }
    
    try:
        print_request('POST', url, data)
        response = requests.post(url, json=data, headers=HEADERS)
        print_response(response)
        return response.json() if response.status_code in (200, 201) else None
    except Exception as e:
        print(f"Error during registration: {e}")
        import traceback
        traceback.print_exc()
        return None

def test_login():
    url = f"{BASE_URL}auth/auth/login/"
    data = {
        'email': 'admin1@smartfarm.com',
        'password': 'Hello.22'
    }
    
    try:
        print_request('POST', url, data)
        response = requests.post(url, json=data, headers=HEADERS)
        print_response(response)
        return response.json() if response.status_code == 200 else None
    except Exception as e:
        print(f"Error during login: {e}")
        import traceback
        traceback.print_exc()
        return None

def test_endpoints():
    print("Testing API endpoints...")
    
    # Test registration
    print("\n1. Testing registration...")
    registration_data = test_registration()
    
    # Test login with registered user
    print("\n2. Testing login with registered user...")
    auth_data = test_login()
    
    if auth_data and 'access' in auth_data:
        print("\nAuthentication successful!")
        print(f"Access Token: {auth_data['access'][:50]}..." if len(auth_data['access']) > 50 else f"Access Token: {auth_data['access']}")
        print(f"Refresh Token: {auth_data['refresh'][:50]}..." if len(auth_data['refresh']) > 50 else f"Refresh Token: {auth_data['refresh']}")
        return True
    else:
        print("\nAuthentication failed!")
        return False

if __name__ == "__main__":
    if not test_endpoints():
        sys.exit(1)
