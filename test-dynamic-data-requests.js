const axios = require('axios');

// Test both payload types
// Generate unique request IDs
const timestamp1 = Date.now().toString(36).toUpperCase();
const randomStr1 = Math.random().toString(36).substr(2, 5).toUpperCase();
const timestamp2 = Date.now().toString(36).toUpperCase();
const randomStr2 = Math.random().toString(36).substr(2, 5).toUpperCase();

const testPayloads = {
  plantMaintenance: {
    "requestId": `REQ-PM-${timestamp1}-${randomStr1}`,
    "requestType": "Plant Maintenance Request",
    "requestDescription": "PM Request",
    "businessJustification": "PM Request",
    "requesterId": "USER001",
    "dataFormat": "Reduced Data Set",
    "specificFields": [],
    "specificFieldsObject": "",
    "requestItems": [{
      "requestAction": "Create",
      "objectId": "R0001",
      "description": "PM Request",
      "requestObject": "equipment",
      "dataObjectId": "data_object_quality_test_equipment_001",
      "action": "Create",
      "setupType": "SingleLocation",
      "equipmentNumber": "10001",
      "equipmentDescription": "PM Request",
      "equipmentCategory": "2",
      "equipmentType": "COMP",
      "approvalSteps": [{
        "stepNumber": 1,
        "approvalTaskId": "MAINTENANCE_APPROVAL",
        "approverRole": "Maintenance",
        "approverType": "Maintenance Manager",
        "required": true,
        "description": "Maintenance approval required for Equipment",
        "approverId": null,
        "targetStatusOnApproval": "Maintenance_Approved",
        "targetStatusOnRejection": "Maintenance_Rejected"
      }, {
        "stepNumber": 2,
        "approvalTaskId": "PLANT_MANAGER_APPROVAL",
        "approverRole": "Plant_Manager",
        "approverType": "Plant Manager",
        "required": true,
        "description": "Plant Manager final approval",
        "approverId": null,
        "targetStatusOnApproval": "Plant_Manager_Approved",
        "targetStatusOnRejection": "Plant_Manager_Rejected"
      }],
      "requestType": "Plant Maintenance Request"
    }]
  },
  materialRequest: {
    "requestId": `REQ-MR-${timestamp2}-${randomStr2}`,
    "requestType": "Material Request",
    "requestDescription": "Material Request",
    "businessJustification": "Material Request",
    "requesterId": "USER001",
    "dataFormat": "Full Data Set",
    "specificFields": [],
    "specificFieldsObject": "",
    "requestItems": [{
      "description": "123123",
      "action": "Update",
      "setupType": "SupplyChainRoute",
      "fromLocation": "GB01",
      "toLocation": "FR01",
      "supplyChainRoute": "68ebc61c04253a862986033b",
      "supplyChainRouteData": {
        "_id": "68ebc61c04253a862986033b",
        "name": "UK to FR - 02",
        "description": "UK to FR",
        "routeType": "Supply Chain Route",
        "locations": [{
          "id": "GB01",
          "type": "manufacturing",
          "x": 201.33331298828125,
          "y": 182.28125,
          "name": "Test",
          "description": "Test"
        }, {
          "id": "FR01",
          "type": "plant",
          "x": 442.33331298828125,
          "y": 184.28125,
          "name": "Test",
          "description": "Test"
        }]
      },
      "attachments": [],
      "materialId": "21123",
      "uom": "KG",
      "materialType": "ROH",
      "materialGroup": "SHEETMETAL",
      "materialIsConfigurable": false,
      "materialIsBatchManaged": false,
      "materialRequiresSerialNumber": false,
      "materialIsHazardous": false,
      "assignedTasks": {
        "FR01": [{
          "id": "TEMPLATE_1761508455316_3eqn39seh",
          "name": "Supplier",
          "description": "Supplier",
          "status": "available",
          "template": "68f42ad39e933651753083bc",
          "type": "dataObject",
          "sequence": 1,
          "mandatory": true,
          "priority": "Medium"
        }],
        "GB01": [{
          "id": "TEMPLATE_1761863656362_dtfli7z8q",
          "name": "Supplier",
          "description": "Supplier",
          "status": "available",
          "template": "68f8faeca6ca128cc7fa3dbc",
          "type": "dataObject",
          "sequence": 1,
          "mandatory": true,
          "priority": "Medium"
        }]
      },
      "requestType": "Material Request"
    }]
  }
};

async function testDynamicDataRequests() {
  try {
    const baseUrl = process.env.API_URL || 'http://localhost:5001';
    
    console.log('🧪 Testing Dynamic Data Request API\n');
    console.log(`📍 Server: ${baseUrl}\n`);
    
    // Test 1: Plant Maintenance Request
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Test 1: Plant Maintenance Request');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    try {
      const pmResponse = await axios.post(`${baseUrl}/api/data-requests`, testPayloads.plantMaintenance);
      console.log('✅ Plant Maintenance Request Created Successfully');
      console.log(`   Request ID: ${pmResponse.data.data.requestId}`);
      console.log(`   Request Type: ${pmResponse.data.data.requestType}`);
      console.log(`   Data Format: ${pmResponse.data.data.dataFormat}`);
      console.log(`   Request Items: ${pmResponse.data.data.requestItems.length}`);
      console.log(`   First Item Keys:`, Object.keys(pmResponse.data.data.requestItems[0]));
      console.log(`   Has approvalSteps:`, !!pmResponse.data.data.requestItems[0].approvalSteps);
      console.log(`   Has equipmentNumber:`, !!pmResponse.data.data.requestItems[0].equipmentNumber);
      console.log(`   Has equipmentDescription:`, !!pmResponse.data.data.requestItems[0].equipmentDescription);
    } catch (error) {
      console.error('❌ Plant Maintenance Request Failed:');
      console.error('   Error:', error.response?.data?.message || error.message);
      if (error.response?.data?.errors) {
        console.error('   Validation Errors:', error.response.data.errors);
      }
    }
    
    console.log('\n');
    
    // Test 2: Material Request
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Test 2: Material Request');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    try {
      const mrResponse = await axios.post(`${baseUrl}/api/data-requests`, testPayloads.materialRequest);
      console.log('✅ Material Request Created Successfully');
      console.log(`   Request ID: ${mrResponse.data.data.requestId}`);
      console.log(`   Request Type: ${mrResponse.data.data.requestType}`);
      console.log(`   Data Format: ${mrResponse.data.data.dataFormat}`);
      console.log(`   Request Items: ${mrResponse.data.data.requestItems.length}`);
      console.log(`   First Item Keys:`, Object.keys(mrResponse.data.data.requestItems[0]));
      console.log(`   Has supplyChainRouteData:`, !!mrResponse.data.data.requestItems[0].supplyChainRouteData);
      console.log(`   Has assignedTasks:`, !!mrResponse.data.data.requestItems[0].assignedTasks);
      console.log(`   Has materialId:`, !!mrResponse.data.data.requestItems[0].materialId);
      console.log(`   Has attachments:`, !!mrResponse.data.data.requestItems[0].attachments);
    } catch (error) {
      console.error('❌ Material Request Failed:');
      console.error('   Error:', error.response?.data?.message || error.message);
      if (error.response?.data?.errors) {
        console.error('   Validation Errors:', error.response.data.errors);
      }
    }
    
    console.log('\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Testing Complete');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('   → Server not running. Please start the server first.');
    }
    process.exit(1);
  }
}

// Run the tests
testDynamicDataRequests();

