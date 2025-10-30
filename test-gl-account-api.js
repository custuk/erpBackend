const axios = require('axios');

// Test script to verify GL Account Request APIs
const BASE_URL = 'http://localhost:3001/api/gl-account-requests';

// Example payload based on user's request (with requestItems for backward compatibility)
const examplePayload = {
  "requestId": "REQ-MHCLBPA1-LVVUB",
  "requestType": "GL Account Request",
  "requestDescription": "GL Account",
  "businessJustification": "GL Account",
  "requesterId": "USER001",
  "requestItems": [
    {
      "requestAction": "Create",
      "glAccountNumber": "23123123",
      "accountType": "Asset",
      "accountGroup": "BSAS",
      "glAccountNameShort": "GL Account",
      "chartOfAccounts": "GBCH",
      "companyCode": "GB01",
      "notes": "2342342"
    }
  ]
};

// Alternative payload using requestItems (preferred)
const examplePayloadRequestItems = {
  "requestId": "REQ-MHCLBPA1-LVVUB2",
  "requestType": "GL Account Request",
  "requestDescription": "GL Account",
  "businessJustification": "GL Account",
  "requesterId": "USER001",
  "requestItems": [
    {
      "requestAction": "Create",
      "glAccountNumber": "23123123",
      "accountType": "Asset",
      "accountGroup": "BSAS",
      "glAccountNameShort": "GL Account",
      "chartOfAccounts": "GBCH",
      "companyCode": "GB01",
      "notes": "2342342"
    }
  ]
};

async function testCreateGLAccountRequest() {
  console.log('📝 Testing POST /gl-account-requests (with requestItems)');
  console.log('📋 Payload:', JSON.stringify(examplePayload, null, 2));
  
  try {
    const response = await axios.post(BASE_URL, examplePayload);
    console.log('✅ Success!');
    console.log('📋 Response:', JSON.stringify(response.data, null, 2));
    return response.data.data._id;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Connection Error: Server is not running. Please start the server first.');
    } else {
      console.error('❌ Error:', error.response?.data || error.message);
      if (error.response) {
        console.error('   Status:', error.response.status);
        console.error('   Data:', JSON.stringify(error.response.data, null, 2));
      }
    }
    throw error;
  }
}

async function testCreateGLAccountRequestWithRequestItems() {
  console.log('\n📝 Testing POST /gl-account-requests (with requestItems)');
  console.log('📋 Payload:', JSON.stringify(examplePayloadRequestItems, null, 2));
  
  try {
    const response = await axios.post(BASE_URL, examplePayloadRequestItems);
    console.log('✅ Success!');
    console.log('📋 Response:', JSON.stringify(response.data, null, 2));
    return response.data.data._id;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
}

async function testGetAllGLAccountRequests() {
  console.log('\n📋 Testing GET /gl-account-requests');
  
  try {
    const response = await axios.get(BASE_URL);
    console.log('✅ Success!');
    console.log(`📊 Total requests: ${response.data.pagination.total}`);
    if (response.data.data.length > 0) {
      console.log('📋 First request:', JSON.stringify(response.data.data[0], null, 2));
    }
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

async function testGetGLAccountRequestById(id) {
  console.log(`\n🔍 Testing GET /gl-account-requests/${id}`);
  
  try {
    const response = await axios.get(`${BASE_URL}/${id}`);
    console.log('✅ Success!');
    console.log('📋 Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

async function testUpdateGLAccountRequest(id) {
  console.log(`\n✏️  Testing PUT /gl-account-requests/${id}`);
  
  const updatePayload = {
    "requestDescription": "Updated GL Account Request",
    "requestItems": [
      {
        "requestAction": "Update",
        "glAccountNumber": "23123123",
        "accountType": "Liability",
        "accountGroup": "BSAS",
        "glAccountNameShort": "GL Account Updated",
        "chartOfAccounts": "GBCH",
        "companyCode": "GB01",
        "notes": "Updated test notes"
      }
    ]
  };
  
  try {
    const response = await axios.put(`${BASE_URL}/${id}`, updatePayload);
    console.log('✅ Success!');
    console.log('📋 Updated response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

async function testGetStats() {
  console.log('\n📊 Testing GET /gl-account-requests/stats/overview');
  
  try {
    const response = await axios.get(`${BASE_URL}/stats/overview`);
    console.log('✅ Success!');
    console.log('📋 Stats:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting GL Account Request API Tests\n');
  console.log('='.repeat(60));
  
  try {
    // Test 1: Create (with requestItems - backward compatibility)
    const id = await testCreateGLAccountRequest();
    
    // Test 2: Create (with requestItems - preferred)
    await testCreateGLAccountRequestWithRequestItems();
    
    // Test 3: Get All
    await testGetAllGLAccountRequests();
    
    // Test 4: Get By ID
    if (id) {
      await testGetGLAccountRequestById(id);
      
      // Test 5: Update
      await testUpdateGLAccountRequest(id);
    }
    
    // Test 6: Get Stats
    await testGetStats();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests completed!');
  } catch (error) {
    console.log('\n' + '='.repeat(60));
    console.error('❌ Tests failed:', error.message);
  }
}

// Run tests
runAllTests();
