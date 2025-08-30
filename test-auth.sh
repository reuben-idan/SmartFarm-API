#!/bin/bash

# Test API root
echo "Testing API root..."
curl -v http://localhost:8000/api/

# Test registration
echo -e "\n\nTesting registration..."
curl -v -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test_'$(date +%s)'@example.com",
    "password1": "TestPass123!",
    "password2": "TestPass123!",
    "first_name": "Test",
    "last_name": "User"
  }'

# Test login
echo -e "\n\nTesting login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "adminpass"
  }')

echo "Login response: $LOGIN_RESPONSE"

# Extract access token if login was successful
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "$ACCESS_TOKEN" ]; then
    echo -e "\nAccess token obtained: ${ACCESS_TOKEN:0:20}..."
    
    # Test getting current user
    echo -e "\nTesting get current user..."
    curl -v http://localhost:8000/api/auth/me/ \
      -H "Authorization: Bearer $ACCESS_TOKEN"
else
    echo -e "\nFailed to get access token. Check login credentials."
fi
