import axios from 'axios';

// Configuration
const API_BASE_URL = 'http://localhost:8000/api';
const TEST_USER = {
  email: `testuser_${Date.now()}@example.com`,
  password: 'TestPass123!',
  first_name: 'Test',
  last_name: 'User',
  password2: 'TestPass123!'  // For registration
};

// Helper functions
const makeRequest = async (method: 'get' | 'post', url: string, data?: any, token?: string) => {
  const config: any = {
    method,
    url: `${API_BASE_URL}${url}`,
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
};

// Helper function to clear test user if exists
async function cleanupTestUser() {
  try {
    // This would require admin credentials in a real test environment
    console.log('Cleaning up test user...');
  } catch (error) {
    console.log('No test user to clean up');
  }
}

// Test 1: User Registration
async function testRegistration() {
  console.log('\n=== Testing User Registration ===');
  
  try {
    const response = await authService.register({
      ...TEST_USER,
      password2: TEST_USER.password
    });
    
    console.log('✅ Registration successful');
    console.log('User ID:', response.user.id);
    console.log('Access Token:', response.access.substring(0, 20) + '...');
    
    return true;
  } catch (error: any) {
    console.error('❌ Registration failed:', error.response?.data || error.message);
    return false;
  }
}

// Test 2: User Login
async function testLogin() {
  console.log('\n=== Testing User Login ===');
  
  try {
    const response = await authService.login({
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    
    console.log('✅ Login successful');
    console.log('User:', response.user.email);
    console.log('Access Token:', response.access.substring(0, 20) + '...');
    
    return true;
  } catch (error: any) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return false;
  }
}

// Test 3: Get Current User
async function testGetCurrentUser() {
  console.log('\n=== Testing Get Current User ===');
  
  try {
    const user = await authService.getCurrentUser();
    console.log('✅ Current user:', user.email);
    return true;
  } catch (error: any) {
    console.error('❌ Failed to get current user:', error.response?.data || error.message);
    return false;
  }
}

// Test 4: Token Refresh
async function testTokenRefresh() {
  console.log('\n=== Testing Token Refresh ===');
  
  try {
    const newToken = await authService.refreshToken();
    console.log('✅ Token refresh successful');
    console.log('New Access Token:', newToken.substring(0, 20) + '...');
    return true;
  } catch (error: any) {
    console.error('❌ Token refresh failed:', error.response?.data || error.message);
    return false;
  }
}

// Test 5: Logout
async function testLogout() {
  console.log('\n=== Testing Logout ===');
  
  try {
    authService.logout();
    console.log('✅ Logout successful');
    
    // Verify tokens are cleared
    if (!authService.getAccessToken() && !authService.getRefreshToken()) {
      console.log('✅ Tokens cleared successfully');
      return true;
    } else {
      console.log('❌ Tokens not cleared properly');
      return false;
    }
  } catch (error: any) {
    console.error('❌ Logout failed:', error.message);
    return false;
  }
}

// Mock implementation for tests
describe('Authentication Flow', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    mockLocalStorage.clear();
  });

  describe('Registration', () => {
    it('should register a new user', async () => {
      authService.register.mockResolvedValueOnce({
        access: 'mock_access_token',
        refresh: 'mock_refresh_token',
        user: {
          id: 1,
          email: TEST_USER.email,
          first_name: TEST_USER.first_name,
          last_name: TEST_USER.last_name,
          is_staff: false
        }
      });

      const result = await testRegistration();
      expect(result).toBe(true);
      expect(authService.register).toHaveBeenCalledWith({
        ...TEST_USER,
        password2: TEST_USER.password
      });
    });
  });

  describe('Login', () => {
    it('should login with valid credentials', async () => {
      authService.login.mockResolvedValueOnce({
        access: 'mock_access_token',
        refresh: 'mock_refresh_token',
        user: {
          id: 1,
          email: TEST_USER.email,
          first_name: TEST_USER.first_name,
          last_name: TEST_USER.last_name,
          is_staff: false
        }
      });

      const result = await testLogin();
      expect(result).toBe(true);
      expect(authService.login).toHaveBeenCalledWith({
        email: TEST_USER.email,
        password: TEST_USER.password
      });
    });
  });

  // Add more test cases for other scenarios
});

// Test functions
async function testRegistration() {
  console.log('\n=== Testing Registration ===');
  
  const { data, error, status } = await makeRequest('post', '/auth/register/', {
    email: TEST_USER.email,
    password1: TEST_USER.password,
    password2: TEST_USER.password2,
    first_name: TEST_USER.first_name,
    last_name: TEST_USER.last_name
  });

  if (error) {
    console.error('❌ Registration failed:', error);
    return false;
  }

  console.log('✅ Registration successful');
  console.log('Status:', status);
  console.log('Response:', JSON.stringify(data, null, 2));
  
  return true;
}

async function testLogin() {
  console.log('\n=== Testing Login ===');
  
  const { data, error, status } = await makeRequest('post', '/auth/login/', {
    email: TEST_USER.email,
    password: TEST_USER.password
  });

  if (error) {
    console.error('❌ Login failed:', error);
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

async function testGetCurrentUser(accessToken: string) {
  console.log('\n=== Testing Get Current User ===');
  
  const { data, error, status } = await makeRequest('get', '/auth/user/', undefined, accessToken);

  if (error) {
    console.error('❌ Failed to get current user:', error);
    return false;
  }

  console.log('✅ Current user retrieved successfully');
  console.log('Status:', status);
  console.log('User data:', JSON.stringify(data, null, 2));
  return true;
}

async function testRefreshToken(refreshToken: string) {
  console.log('\n=== Testing Token Refresh ===');
  
  const { data, error, status } = await makeRequest('post', '/auth/token/refresh/', {
    refresh: refreshToken
  });

  if (error) {
    console.error('❌ Token refresh failed:', error);
    return null;
  }

  console.log('✅ Token refresh successful');
  console.log('Status:', status);
  console.log('New Access Token:', data.access ? `${data.access.substring(0, 20)}...` : 'none');
  
  return data.access;
}

// Main test runner
async function runTests() {
  console.log('Starting Authentication Flow Tests\n');
  
  try {
    // Test registration
    console.log('\n--- Test 1: User Registration ---');
    const registrationSuccess = await testRegistration();
    
    if (!registrationSuccess) {
      console.log('\n⚠️  Registration failed. Attempting login with existing credentials...');
    }

    // Test login
    console.log('\n--- Test 2: User Login ---');
    const tokens = await testLogin();
    
    if (!tokens) {
      throw new Error('Login failed. Cannot proceed with further tests.');
    }
    
    // Test getting current user
    console.log('\n--- Test 3: Get Current User ---');
    const currentUserSuccess = await testGetCurrentUser(tokens.access);
    
    // Test token refresh
    console.log('\n--- Test 4: Token Refresh ---');
    const newAccessToken = await testRefreshToken(tokens.refresh);
    
    // Test getting current user with new token
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
console.log('🚀 Starting SmartFarm API Authentication Tests\n');
console.log(`Test user email: ${TEST_USER.email}`);
console.log(`API Base URL: ${API_BASE_URL}\n`);

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
