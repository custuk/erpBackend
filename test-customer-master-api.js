const axios = require('axios');

// Test script to verify Customer Master Request APIs
const BASE_URL = 'http://localhost:3001/api/customer-master-requests';

// Example payload based on user's request
const examplePayload = {
  "requestId": "REQ-MHCK5RQ5-NP2M1",
  "requestType": "Customer Master Request",
  "requestDescription": "Customer Master",
  "businessJustification": "Customer Master",
  "requesterId": "USER001",
  "requestItems": [
    {
      "requestAction": "Create",
      "customerId": "2131231",
      "accountGroup": "ZCUS",
      "customerRoles": "All",
      "name1": "Customer New",
      "companyCode": "0001",
      "salesOrg": "GB01",
      "notes": "Test"
    }
  ]
};

async function testCreateCustomerMasterRequest() {
  console.log('📝 Testing POST /customer-master-requests');
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

async function testGetAllCustomerMasterRequests() {
  console.log('\n📋 Testing GET /customer-master-requests');
  
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

async function testGetCustomerMasterRequestById(id) {
  console.log(`\n🔍 Testing GET /customer-master-requests/${id}`);
  
  try {
    const response = await axios.get(`${BASE_URL}/${id}`);
    console.log('✅ Success!');
    console.log('📋 Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

async function testUpdateCustomerMasterRequest(id) {
  console.log(`\n✏️  Testing PUT /customer-master-requests/${id}`);
  
  const updatePayload = {
    "requestDescription": "Updated Customer Master Request",
    "requestItems": [
      {
        "requestAction": "Update",
        "customerId": "2131231",
        "accountGroup": "ZCUS",
        "customerRoles": "All",
        "name1": "Customer Updated",
        "companyCode": "0001",
        "salesOrg": "GB01",
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
  console.log('\n📊 Testing GET /customer-master-requests/stats/overview');
  
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
  console.log('🚀 Starting Customer Master Request API Tests\n');
  console.log('='.repeat(60));
  
  try {
    // Test 1: Create
    const id = await testCreateCustomerMasterRequest();
    
    // Test 2: Get All
    await testGetAllCustomerMasterRequests();
    
    // Test 3: Get By ID
    await testGetCustomerMasterRequestById(id);
    
    // Test 4: Update
    await testUpdateCustomerMasterRequest(id);
    
    // Test 5: Get Stats
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
