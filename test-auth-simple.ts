import axios from 'axios';

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
async function apiRequest(method: 'get' | 'post', endpoint: string, data?: any, token?: string) {
  const config: any = {
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
  } catch (error: any) {
    return { 
      error: error.response?.data || error.message, 
      status: error.response?.status || 500
    };
  }
}

// Test 1: User Registration
async function testRegistration() {
  console.log('\n=== Testing User Registration ===');
  
  const { data, error, status } = await apiRequest('post', '/auth/auth/register/', {
    email: TEST_USER.email,
    password1: TEST_USER.password,
    password2: TEST_USER.password2,
    first_name: TEST_USER.first_name,
    last_name: TEST_USER.last_name
  });

  if (error) {
    console.log('❌ Registration failed:', error);
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
  
  const { data, error, status } = await apiRequest('post', '/auth/auth/login/', {
    email: TEST_USER.email,
    password: TEST_USER.password
  });

  if (error) {
    console.log('❌ Login failed:', error);
    return null;
  }

  console.log('✅ Login successful');
  console.log('Status:', status);
  console.log('Access Token:', data.access ? `${data.access.substring(0, 20)}...` : 'none');
  console.log('Refresh Token:', data.refresh ? `${data.refresh.substring(0, 20)}...` : 'none');
  
  return {
    access: data.access,
    refresh: data.refresh
  };
}

// Test 3: Get Current User
async function testGetCurrentUser(accessToken: string) {
  console.log('\n=== Testing Get Current User ===');
  
  const { data, error, status } = await apiRequest('get', '/auth/auth/me/', undefined, accessToken);

  if (error) {
    console.log('❌ Failed to get current user:', error);
    return false;
  }

  console.log('✅ Current user retrieved successfully');
  console.log('Status:', status);
  console.log('User data:', JSON.stringify(data, null, 2));
  return true;
}

// Test 4: Refresh Token
async function testRefreshToken(refreshToken: string) {
  console.log('\n=== Testing Token Refresh ===');
  
  const { data, error, status } = await apiRequest('post', '/auth/auth/token/refresh/', {
    refresh: refreshToken
  });

  if (error) {
    console.log('❌ Token refresh failed:', error);
    return null;
  }

  console.log('✅ Token refresh successful');
  console.log('Status:', status);
  console.log('New Access Token:', data.access ? `${data.access.substring(0, 20)}...` : 'none');
  
  return data.access;
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
    
    if (!registrationSuccess) {
      console.log('\n⚠️  Registration failed. Attempting login with existing credentials...');
    }

    // Test 2: Login
    console.log('\n--- Test 2: User Login ---');
    const tokens = await testLogin();
    
    if (!tokens) {
      throw new Error('Login failed. Cannot proceed with further tests.');
    }
    
    // Test 3: Get Current User
    console.log('\n--- Test 3: Get Current User ---');
    const currentUserSuccess = await testGetCurrentUser(tokens.access);
    
    // Test 4: Token Refresh
    console.log('\n--- Test 4: Token Refresh ---');
    const newAccessToken = await testRefreshToken(tokens.refresh);
    
    // Test 5: Get Current User with new token
    if (newAccessToken) {
      console.log('\n--- Test 5: Get Current User with Refreshed Token ---');
      await testGetCurrentUser(newAccessToken);
    }
    
    console.log('\n=== Test Summary ===');
    console.log('1. Registration:', registrationSuccess ? '✅' : '⚠️ (Skipped)');
    console.log('2. Login:', tokens ? '✅' : '❌');
    console.log('3. Get Current User:', currentUserSuccess ? '✅' : '❌');
    console.log('4. Token Refresh:', newAccessToken ? '✅' : '❌');
    
    return registrationSuccess && !!tokens && currentUserSuccess && !!newAccessToken;
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
