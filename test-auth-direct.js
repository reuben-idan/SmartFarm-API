const axios = require('axios');

const API_BASE = 'http://localhost:8000/api';

async function testEndpoints() {
    try {
        // 1. Test API root
        console.log('Testing API root...');
        const root = await axios.get(`${API_BASE}/`);
        console.log('API Root Response:', root.data);

        // 2. Test registration
        console.log('\nTesting registration...');
        const registerData = {
            email: `test_${Date.now()}@example.com`,
            password1: 'testpass123',
            password2: 'testpass123',
            first_name: 'Test',
            last_name: 'User'
        };

        try {
            const register = await axios.post(`${API_BASE}/auth/register/`, registerData);
            console.log('Registration Success:', register.data);
        } catch (error) {
            console.log('Registration Error:', error.response?.data || error.message);
        }

        // 3. Test login
        console.log('\nTesting login...');
        try {
            const login = await axios.post(`${API_BASE}/auth/login/`, {
                email: 'admin@example.com',  // Replace with a known test user
                password: 'adminpass'        // Replace with the correct password
            });
            console.log('Login Success:', {
                access_token: login.data.access?.substring(0, 20) + '...',
                refresh_token: login.data.refresh?.substring(0, 20) + '...'
            });

            // 4. Test protected endpoint
            if (login.data.access) {
                console.log('\nTesting protected endpoint...');
                try {
                    const me = await axios.get(`${API_BASE}/auth/me/`, {
                        headers: {
                            'Authorization': `Bearer ${login.data.access}`
                        }
                    });
                    console.log('Current User:', me.data);
                } catch (error) {
                    console.log('Protected Endpoint Error:', error.response?.data || error.message);
                }
            }
        } catch (error) {
            console.log('Login Error:', error.response?.data || error.message);
        }
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testEndpoints();
