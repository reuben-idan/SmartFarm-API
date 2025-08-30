import requests
import json

# Test registration endpoint
url = 'http://localhost:8000/api/v1/auth/register/'
data = {
    'email': 'test@example.com',
    'password': 'testpass123',
    'password2': 'testpass123',
    'first_name': 'Test',
    'last_name': 'User'
}

response = requests.post(url, json=data)
print(f'Status Code: {response.status_code}')
try:
    print('Response:', json.dumps(response.json(), indent=2))
except:
    print('Response:', response.text)
