const axios = require('axios');

// Test the exact payload structure from the user
const testPayload = {
  "permissions": {
    "read": [],
    "write": [],
    "execute": []
  },
  "id": "X1761159464171",
  "name": "test",
  "description": "test",
  "type": "validation",
  "dataObject": "customer",
  "status": "active",
  "conditions": [
    {
      "id": 1,
      "field": "rag",
      "operator": "equals",
      "value": "",
      "logicalOperator": "AND"
    }
  ],
  "actions": [
    {
      "id": 1,
      "type": "setField",
      "field": "out",
      "message": ""
    }
  ],
  "regexPattern": "",
  "priority": 1,
  "enabled": true,
  "version": "1.0.0",
  "createdBy": "John Doe",
  "isActive": true,
  "tags": ["general", "rule"],
  "usageCount": 0,
  "executionCount": 0,
  "successCount": 0,
  "failureCount": 0,
  "conditionCount": 1,
  "actionCount": 1,
  "dependencies": [],
  "scope": "dataObject",
  "decisionTable": [
    {
      "id": 1761159442841,
      "conditions": [
        {
          "id": "condition_1761159426717",
          "field": "rag",
          "operator": "equals",
          "value": "12"
        }
      ],
      "actions": [
        {
          "id": "action_1761159433271",
          "type": "setField",
          "field": "out",
          "value": "100"
        }
      ]
    }
  ],
  "checkTable": []
};

async function testDecisionTableRule() {
  const baseURL = 'http://localhost:3001/api/business-rules';
  
  try {
    console.log('🧪 Testing decision table rule creation...\n');
    console.log('📝 Payload structure:');
    console.log(`   Rule ID: ${testPayload.id}`);
    console.log(`   Rule Name: ${testPayload.name}`);
    console.log(`   Type: ${testPayload.type}`);
    console.log(`   Data Object: ${testPayload.dataObject}`);
    console.log(`   Decision Table Rows: ${testPayload.decisionTable.length}`);
    console.log(`   Conditions: ${testPayload.conditions.length}`);
    console.log(`   Actions: ${testPayload.actions.length}\n`);
    
    console.log('📋 Decision Table Structure:');
    testPayload.decisionTable.forEach((row, index) => {
      console.log(`   Row ${index + 1}:`);
      console.log(`     ID: ${row.id}`);
      console.log(`     Conditions: ${row.conditions.length}`);
      row.conditions.forEach((condition, i) => {
        console.log(`       Condition ${i + 1}: ${condition.field} ${condition.operator} ${condition.value}`);
      });
      console.log(`     Actions: ${row.actions.length}`);
      row.actions.forEach((action, i) => {
        console.log(`       Action ${i + 1}: ${action.type} ${action.field} = ${action.value}`);
      });
    });
    console.log('');
    
    const response = await axios.post(baseURL, testPayload);
    
    if (response.data.success) {
      console.log('✅ Success! Decision table rule created successfully');
      console.log(`📋 Rule ID: ${response.data.data._id}`);
      console.log(`📋 Rule Name: ${response.data.data.name}`);
      console.log(`📋 Decision Table Rows: ${response.data.data.decisionTable.length}`);
      console.log(`📋 Conditions: ${response.data.data.conditions.length}`);
      console.log(`📋 Actions: ${response.data.data.actions.length}`);
      
      // Verify the decision table structure was saved correctly
      console.log('\n🔍 Verifying saved structure:');
      const savedRule = response.data.data;
      savedRule.decisionTable.forEach((row, index) => {
        console.log(`   Row ${index + 1}:`);
        console.log(`     ID: ${row.id}`);
        console.log(`     Conditions: ${row.conditions.length}`);
        row.conditions.forEach((condition, i) => {
          console.log(`       Condition ${i + 1}: ${condition.field} ${condition.operator} ${condition.value}`);
        });
        console.log(`     Actions: ${row.actions.length}`);
        row.actions.forEach((action, i) => {
          console.log(`       Action ${i + 1}: ${action.type} ${action.field} = ${action.value}`);
        });
      });
      
    } else {
      console.log('❌ API Error:', response.data.message);
      if (response.data.errors) {
        console.log('📝 Validation Errors:');
        response.data.errors.forEach((error, index) => {
          console.log(`   ${index + 1}. ${error}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Network Error:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📝 Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the test
testDecisionTableRule();

