const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let authToken = '';

// Test login
async function testLogin() {
  try {
    console.log('\n🔐 Testing Login...');
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'landlord@example.com',
      password: '123456',
    });
    
    if (response.data.success) {
      authToken = response.data.data.token;
      console.log('✅ Login successful!');
      console.log('Token:', authToken.substring(0, 50) + '...');
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return false;
  }
}

// Test profile endpoint
async function testProfile() {
  try {
    console.log('\n👤 Testing Profile...');
    const response = await axios.get(`${API_URL}/landlord/profile`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    
    console.log('✅ Profile retrieved successfully!');
    console.log('Profile:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Profile failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('Headers:', error.response?.headers);
    return false;
  }
}

// Test rooms endpoint
async function testRooms() {
  try {
    console.log('\n🏠 Testing Rooms...');
    const response = await axios.get(`${API_URL}/landlord/rooms`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    
    console.log('✅ Rooms retrieved successfully!');
    console.log('Rooms count:', response.data.data?.length || 0);
    return true;
  } catch (error) {
    console.error('❌ Rooms failed:', error.response?.data || error.message);
    return false;
  }
}

// Test rental requests endpoint
async function testRequests() {
  try {
    console.log('\n📋 Testing Rental Requests...');
    const response = await axios.get(`${API_URL}/landlord/rental-requests`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    
    console.log('✅ Rental requests retrieved successfully!');
    console.log('Requests count:', response.data.data?.length || 0);
    return true;
  } catch (error) {
    console.error('❌ Rental requests failed:', error.response?.data || error.message);
    return false;
  }
}

// Test dashboard stats endpoint
async function testDashboard() {
  try {
    console.log('\n📊 Testing Dashboard Stats...');
    const response = await axios.get(`${API_URL}/landlord/dashboard/statistics`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    
    console.log('✅ Dashboard stats retrieved successfully!');
    console.log('Stats:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Dashboard stats failed:', error.response?.data || error.message);
    return false;
  }
}

// Test new conversation details endpoint
async function testConversationDetails() {
  try {
    console.log('\n💬 Testing Conversation Details (GET /conversations/:id)...');
    // Using ID 999 which shouldn't exist, but we expect "Conversation not found" instead of "Cannot GET /api/landlord/conversations/999" (Route 404)
    const response = await axios.get(`${API_URL}/landlord/conversations/999`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log('✅ Conversation details endpoint returned:', response.data);
    return true;
  } catch (error) {
    if (error.response?.status === 404 && error.response?.data?.message === 'Conversation not found.') {
      console.log('✅ Conversation details route exists and works! (Correctly returned 404 Conversation Not Found instead of 404 Route Not Found)');
      return true;
    }
    console.error('❌ Conversation details failed:', error.response?.data || error.message);
    return false;
  }
}

// Test new POST change password endpoint
async function testChangePasswordPost() {
  try {
    console.log('\n🔑 Testing Change Password (POST /profile/change-password)...');
    const response = await axios.post(`${API_URL}/landlord/profile/change-password`, {
      oldPassword: '123456',
      newPassword: '123456', // keep the same for test safety
    }, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log('✅ Change password via POST succeeded:', response.data.message);
    return true;
  } catch (error) {
    console.error('❌ Change password via POST failed:', error.response?.data || error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting Landlord API Tests...');
  console.log('='.repeat(50));
  
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    console.log('\n❌ Cannot proceed without login. Exiting...');
    process.exit(1);
  }
  
  await testProfile();
  await testRooms();
  await testRequests();
  await testDashboard();
  await testConversationDetails();
  await testChangePasswordPost();
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ All tests completed!');
  process.exit(0);
}

runTests();
