const axios = require('axios');

// Test script to verify Data Request APIs
const BASE_URL = 'http://localhost:3001/api/data-requests';

// Example payload based on user's request
const examplePayload = {
  "requestId": "REQ-MHCN1OCF-RPRSS",
  "requestType": "Material Request",
  "requestDescription": "Material",
  "businessJustification": "Material",
  "requesterId": "USER001",
  "requestItems": [
    {
      "action": "Create",
      "materialId": "100001",
      "description": "Materail",
      "uom": "M2",
      "materialType": "FERT",
      "materialGroup": "SHEETMETAL",
      "setupType": "SupplyChainRoute",
      "fromLocation": "GB01",
      "toLocation": "FR01",
      "notes": "Test"
    }
  ]
};

async function testCreateDataRequest() {
  console.log('📝 Testing POST /data-requests');
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

async function testGetAllDataRequests() {
  console.log('\n📋 Testing GET /data-requests');
  
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

async function testGetDataRequestById(id) {
  console.log(`\n🔍 Testing GET /data-requests/${id}`);
  
  try {
    const response = await axios.get(`${BASE_URL}/${id}`);
    console.log('✅ Success!');
    console.log('📋 Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

async function testUpdateDataRequest(id) {
  console.log(`\n✏️  Testing PUT /data-requests/${id}`);
  
  const updatePayload = {
    "requestDescription": "Updated Material Request",
    "requestItems": [
      {
        "action": "Update",
        "materialId": "100001",
        "description": "Updated Material",
        "uom": "M2",
        "materialType": "FERT",
        "materialGroup": "SHEETMETAL",
        "setupType": "SingleLocation",
        "location": "GB01",
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
  console.log('\n📊 Testing GET /data-requests/stats/overview');
  
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
  console.log('🚀 Starting Data Request API Tests\n');
  console.log('='.repeat(60));
  
  try {
    // Test 1: Create
    const id = await testCreateDataRequest();
    
    // Test 2: Get All
    await testGetAllDataRequests();
    
    // Test 3: Get By ID
    if (id) {
      await testGetDataRequestById(id);
      
      // Test 4: Update
      await testUpdateDataRequest(id);
    }
    
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
