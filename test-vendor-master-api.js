const axios = require('axios');

// Test script to verify Vendor Master Request APIs
const BASE_URL = 'http://localhost:3001/api/vendor-master-requests';

// Example payload based on user's request (with requestItems for backward compatibility)
const examplePayload = {
  "requestId": "REQ-MHCLBPA1-LVVUB",
  "requestType": "Vendor Master Request",
  "requestDescription": "Vendor Request",
  "businessJustification": "Vendor Request",
  "requesterId": "USER001",
  "requestItems": [
    {
      "requestAction": "Create",
      "vendorId": "123123",
      "accountGroup": "LIFA",
      "vendorName1": "Vendor Request",
      "companyCode": "GB01",
      "purchasingOrg": "EUP1",
      "notes": "2342342"
    }
  ]
};

// Alternative payload using requestItems (preferred)
const examplePayloadRequestItems = {
  "requestId": "REQ-MHCLBPA1-LVVUB2",
  "requestType": "Vendor Master Request",
  "requestDescription": "Vendor Request",
  "businessJustification": "Vendor Request",
  "requesterId": "USER001",
  "requestItems": [
    {
      "requestAction": "Create",
      "vendorId": "123123",
      "accountGroup": "LIFA",
      "vendorName1": "Vendor Request",
      "companyCode": "GB01",
      "purchasingOrg": "EUP1",
      "notes": "2342342"
    }
  ]
};

async function testCreateVendorMasterRequest() {
  console.log('📝 Testing POST /vendor-master-requests (with requestItems)');
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

async function testCreateVendorMasterRequestWithRequestItems() {
  console.log('\n📝 Testing POST /vendor-master-requests (with requestItems)');
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

async function testGetAllVendorMasterRequests() {
  console.log('\n📋 Testing GET /vendor-master-requests');
  
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

async function testGetVendorMasterRequestById(id) {
  console.log(`\n🔍 Testing GET /vendor-master-requests/${id}`);
  
  try {
    const response = await axios.get(`${BASE_URL}/${id}`);
    console.log('✅ Success!');
    console.log('📋 Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

async function testUpdateVendorMasterRequest(id) {
  console.log(`\n✏️  Testing PUT /vendor-master-requests/${id}`);
  
  const updatePayload = {
    "requestDescription": "Updated Vendor Master Request",
    "requestItems": [
      {
        "requestAction": "Update",
        "vendorId": "123123",
        "accountGroup": "LIFA",
        "vendorName1": "Vendor Updated",
        "companyCode": "GB01",
        "purchasingOrg": "EUP1",
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
  console.log('\n📊 Testing GET /vendor-master-requests/stats/overview');
  
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
  console.log('🚀 Starting Vendor Master Request API Tests\n');
  console.log('='.repeat(60));
  
  try {
    // Test 1: Create (with requestItems - backward compatibility)
    const id = await testCreateVendorMasterRequest();
    
    // Test 2: Create (with requestItems - preferred)
    await testCreateVendorMasterRequestWithRequestItems();
    
    // Test 3: Get All
    await testGetAllVendorMasterRequests();
    
    // Test 4: Get By ID
    if (id) {
      await testGetVendorMasterRequestById(id);
      
      // Test 5: Update
      await testUpdateVendorMasterRequest(id);
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
