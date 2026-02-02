const http = require('http');
const https = require('https');
const { URL } = require('url');

const BASE_URL = 'http://localhost:8000/api/v1';

// Test results tracking
let testResults = {
    passed: 0,
    failed: 0,
    errors: []
};

// Helper function to make HTTP requests
function makeRequest(method, url, data = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const isHttps = parsedUrl.protocol === 'https:';
        const httpModule = isHttps ? https : http;
        
        const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || (isHttps ? 443 : 80),
            path: parsedUrl.pathname + parsedUrl.search,
            method: method.toUpperCase(),
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        if (data && (method.toUpperCase() === 'POST' || method.toUpperCase() === 'PUT')) {
            const jsonData = JSON.stringify(data);
            options.headers['Content-Length'] = Buffer.byteLength(jsonData);
        }

        const req = httpModule.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const parsedData = responseData ? JSON.parse(responseData) : {};
                    resolve({
                        status: res.statusCode,
                        data: parsedData,
                        headers: res.headers
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        data: responseData,
                        headers: res.headers
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        if (data && (method.toUpperCase() === 'POST' || method.toUpperCase() === 'PUT')) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

// Helper function to test endpoints
async function testEndpoint(method, endpoint, data = null, token = null, description = '') {
    try {
        const headers = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const url = `${BASE_URL}${endpoint}`;
        const response = await makeRequest(method, url, data, headers);

        console.log(`✅ ${method} ${endpoint} - ${description || 'Success'}`);
        console.log(`   Status: ${response.status}`);
        if (response.data && typeof response.data === 'object') {
            console.log(`   Response: ${JSON.stringify(response.data).substring(0, 200)}...`);
        }
        testResults.passed++;
        return response.data;
    } catch (error) {
        console.log(`❌ ${method} ${endpoint} - ${description || 'Failed'}`);
        console.log(`   Error: ${error.message}`);
        testResults.failed++;
        testResults.errors.push({
            endpoint: `${method} ${endpoint}`,
            error: error.message,
            status: 'Network Error'
        });
        return null;
    }
}

// Main test function
async function runAPITests() {
    console.log('🚀 Starting Backend API Tests...\n');
    console.log(`Testing against: ${BASE_URL}\n`);

    // Test 1: Health Check
    console.log('=== HEALTH CHECK ===');
    await testEndpoint('GET', '/ping', null, null, 'Server health check');
    console.log('');

    // Test 2: Authentication Endpoints
    console.log('=== AUTHENTICATION TESTS ===');
    
    // Test customer registration
    const customerData = {
        name: 'Test Customer',
        email: `test.customer.${Date.now()}@example.com`,
        password: 'testpassword123',
        phone: '1234567890'
    };
    
    const customerRegResult = await testEndpoint('POST', '/auth/customer/register', customerData, null, 'Customer registration');
    
    // Test customer login
    const customerLoginData = {
        email: customerData.email,
        password: customerData.password
    };
    
    const customerLoginResult = await testEndpoint('POST', '/auth/customer/login', customerLoginData, null, 'Customer login');
    const customerToken = customerLoginResult?.token;
    
    // Test restaurant owner registration
    const restaurantOwnerData = {
        name: 'Test Restaurant Owner',
        email: `test.owner.${Date.now()}@example.com`,
        password: 'testpassword123',
        phone: '1234567890'
    };
    
    const ownerRegResult = await testEndpoint('POST', '/auth/restaurant/register', restaurantOwnerData, null, 'Restaurant owner registration');
    
    // Test restaurant owner login
    const ownerLoginData = {
        email: restaurantOwnerData.email,
        password: restaurantOwnerData.password
    };
    
    const ownerLoginResult = await testEndpoint('POST', '/auth/restaurant/login', ownerLoginData, null, 'Restaurant owner login');
    const ownerToken = ownerLoginResult?.token;
    
    console.log('');

    // Test 3: Restaurant Profile Endpoints
    console.log('=== RESTAURANT PROFILE TESTS ===');
    
    // Get all restaurant profiles
    await testEndpoint('GET', '/restaurant-profiles', null, null, 'Get all restaurant profiles');
    
    // Get restaurant profiles with pagination
    await testEndpoint('GET', '/restaurant-profiles?page=1&limit=5', null, null, 'Get restaurant profiles with pagination');
    
    // Search restaurant profiles
    await testEndpoint('GET', '/restaurant-profiles/search?query=restaurant', null, null, 'Search restaurant profiles');
    
    console.log('');

    // Test 4: Restaurant Rooms Endpoints
    console.log('=== RESTAURANT ROOMS TESTS ===');
    
    // Get all restaurant rooms
    await testEndpoint('GET', '/restaurant-rooms', null, null, 'Get all restaurant rooms');
    
    // Search restaurant rooms
    await testEndpoint('GET', '/restaurant-rooms/search?query=room', null, null, 'Search restaurant rooms');
    
    console.log('');

    // Test 5: Booking Endpoints
    console.log('=== BOOKING TESTS ===');
    
    if (customerToken) {
        // Get customer bookings
        await testEndpoint('GET', '/bookings/customer', null, customerToken, 'Get customer bookings');
        
        // Get customer booking requests
        await testEndpoint('GET', '/bookings/customer/requests', null, customerToken, 'Get customer booking requests');
    }
    
    console.log('');

    // Test 6: PDR Consultation Endpoints
    console.log('=== PDR CONSULTATION TESTS ===');
    
    // Get all PDR consultations
    await testEndpoint('GET', '/pdr-consultations', null, null, 'Get all PDR consultations');
    
    // Create PDR consultation request
    const pdrData = {
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '1234567890',
        preferredDate: new Date().toISOString(),
        message: 'Test PDR consultation request'
    };
    
    const pdrResult = await testEndpoint('POST', '/pdr-consultations', pdrData, null, 'Create PDR consultation');
    
    if (pdrResult && pdrResult.data && pdrResult.data._id) {
        // Get specific PDR consultation
        await testEndpoint('GET', `/pdr-consultations/${pdrResult.data._id}`, null, null, 'Get specific PDR consultation');
    }
    
    console.log('');

    // Test 7: Restaurant Management Endpoints (with owner token)
    if (ownerToken) {
        console.log('=== RESTAURANT MANAGEMENT TESTS ===');
        
        // Get restaurant bookings
        await testEndpoint('GET', '/restaurant/bookings', null, ownerToken, 'Get restaurant bookings');
        
        // Get restaurant inquiries
        await testEndpoint('GET', '/restaurant/inquiries', null, ownerToken, 'Get restaurant inquiries');
        
        // Get restaurant gallery
        await testEndpoint('GET', '/restaurant/gallery', null, ownerToken, 'Get restaurant gallery');
        
        // Get restaurant menu
        await testEndpoint('GET', '/restaurant/menu', null, ownerToken, 'Get restaurant menu');
        
        // Get restaurant CRM data
        await testEndpoint('GET', '/restaurant/crm/dashboard', null, ownerToken, 'Get restaurant CRM dashboard');
        
        console.log('');
    }

    // Test 8: Public Endpoints
    console.log('=== PUBLIC ENDPOINTS TESTS ===');
    
    // Get cuisines
    await testEndpoint('GET', '/cuisines', null, null, 'Get all cuisines');
    
    // Get plans
    await testEndpoint('GET', '/plans', null, null, 'Get all plans');
    
    console.log('');

    // Test Summary
    console.log('=== TEST SUMMARY ===');
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`📊 Total: ${testResults.passed + testResults.failed}`);
    
    if (testResults.errors.length > 0) {
        console.log('\n=== FAILED TESTS DETAILS ===');
        testResults.errors.forEach((error, index) => {
            console.log(`${index + 1}. ${error.endpoint}`);
            console.log(`   Status: ${error.status || 'Network Error'}`);
            console.log(`   Error: ${error.error}`);
        });
    }
    
    console.log('\n🏁 API Testing Complete!');
}

// Check if server is running
console.log('🔍 Checking if server is running...');

// Run the tests
runAPITests().catch(error => {
    console.error('❌ Test runner failed:', error.message);
    process.exit(1);
});