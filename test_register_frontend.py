import requests
import json

def test_registration():
    url = 'http://localhost:8000/api/v1/auth/register/'
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
    data = {
        'email': 'test2@example.com',
        'password': 'testpass123',
        'password2': 'testpass123',
        'first_name': 'Test',
        'last_name': 'User'
    }
    
    try:
        response = requests.post(url, headers=headers, json=data)
        print(f"Status Code: {response.status_code}")
        try:
            print("Response:", json.dumps(response.json(), indent=2))
        except:
            print("Response:", response.text)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_registration()
