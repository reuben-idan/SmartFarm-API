const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:8000/api/v1';

// Test user data
const TEST_USER = {
  email: `testuser_${Date.now()}@example.com`,
  password: 'TestPass123!',
  first_name: 'Test',
  last_name: 'User',
  password2: 'TestPass123!'
};

// Helper function to make API requests
async function apiRequest(method, endpoint, data = null, token = null) {
  const config = {
    method,
    url: `${API_BASE_URL}${endpoint}`,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (data) {
    config.data = data;
  }

  try {
    const response = await axios(config);
    return { 
      data: response.data, 
      status: response.status,
      headers: response.headers
    };
  } catch (error) {
    return { 
      error: error.response?.data || error.message, 
      status: error.response?.status || 500
    };
  }
}

// Test 1: User Registration
async function testRegistration() {
  console.log('\n=== Testing User Registration ===');
  
  const { data, error, status } = await apiRequest('post', '/auth/register/', {
    email: TEST_USER.email,
    password1: TEST_USER.password,
    password2: TEST_USER.password2,
    first_name: TEST_USER.first_name,
    last_name: TEST_USER.last_name
  });

  if (error) {
    console.log('❌ Registration failed:', JSON.stringify(error, null, 2));
    return false;
  }

  console.log('✅ Registration successful');
  console.log('Status:', status);
  console.log('Response:', JSON.stringify(data, null, 2));
  return true;
}

// Test 2: User Login
async function testLogin() {
  console.log('\n=== Testing User Login ===');
  
  const { data, error, status } = await apiRequest('post', '/auth/login/', {
    email: TEST_USER.email,
    password: TEST_USER.password
  });

  if (error) {
    console.log('❌ Login failed:', JSON.stringify(error, null, 2));
    return null;
  }

  console.log('✅ Login successful');
  console.log('Status:', status);
  console.log('Access Token:', data.access ? `${data.access.substring(0, 20)}...` : 'none');
  console.log('Refresh Token:', data.refresh ? `${data.refresh.substring(0, 20)}...` : 'none');
  
  return data;
}

// Test 3: Get Current User
async function testGetCurrentUser(accessToken) {
  console.log('\n=== Testing Get Current User ===');
  
  const { data, error, status } = await apiRequest('get', '/auth/me/', null, accessToken);

  if (error) {
    console.log('❌ Failed to get current user:', JSON.stringify(error, null, 2));
    return false;
  }

  console.log('✅ Current user retrieved successfully');
  console.log('Status:', status);
  console.log('User data:', JSON.stringify(data, null, 2));
  return true;
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting SmartFarm API Authentication Tests');
  console.log('============================================');
  console.log(`Test user email: ${TEST_USER.email}`);
  console.log(`API Base URL: ${API_BASE_URL}\n`);
  
  try {
    // Test 1: Registration
    console.log('\n--- Test 1: User Registration ---');
    const registrationSuccess = await testRegistration();
    
    // Test 2: Login
    console.log('\n--- Test 2: User Login ---');
    const loginData = await testLogin();
    
    if (!loginData) {
      throw new Error('Login failed. Cannot proceed with further tests.');
    }
    
    // Test 3: Get Current User
    console.log('\n--- Test 3: Get Current User ---');
    const currentUserSuccess = await testGetCurrentUser(loginData.access);
    
    console.log('\n=== Test Summary ===');
    console.log('1. Registration:', registrationSuccess ? '✅' : '❌');
    console.log('2. Login:', loginData ? '✅' : '❌');
    console.log('3. Get Current User:', currentUserSuccess ? '✅' : '❌');
    
    return registrationSuccess && loginData && currentUserSuccess;
  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    return false;
  }
}

// Run the tests
runTests()
  .then(success => {
    console.log('\n=== Tests Completed ===');
    console.log(success ? '✅ All tests passed successfully!' : '❌ Some tests failed.');
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n❌ Test runner error:', error);
    process.exit(1);
  });
