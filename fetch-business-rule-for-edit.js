const axios = require('axios');

// Function to fetch business rule by ID for editing
async function fetchBusinessRuleForEdit(ruleId) {
  try {
    console.log(`🔍 Fetching business rule for editing: ${ruleId}\n`);
    
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `http://localhost:3001/api/business-rules/${ruleId}`,
      headers: {}
    };

    const response = await axios.request(config);
    
    if (response.data.success) {
      const rule = response.data.data;
      
      console.log('✅ Business rule fetched successfully!\n');
      
      // Display rule information for form population
      console.log('📋 Rule Information for Form Population:');
      console.log('==========================================');
      
      // Basic Information
      console.log('\n🔧 Basic Information:');
      console.log(`   Rule ID: ${rule.id}`);
      console.log(`   Name: ${rule.name}`);
      console.log(`   Description: ${rule.description}`);
      console.log(`   Type: ${rule.type}`);
      console.log(`   Data Object: ${rule.dataObject}`);
      console.log(`   Status: ${rule.status}`);
      console.log(`   Scope: ${rule.scope}`);
      console.log(`   Priority: ${rule.priority}`);
      console.log(`   Enabled: ${rule.enabled}`);
      console.log(`   Version: ${rule.version}`);
      console.log(`   Created By: ${rule.createdBy}`);
      console.log(`   Tags: ${rule.tags.join(', ')}`);
      
      // Conditions
      console.log('\n📝 Conditions:');
      if (rule.conditions && rule.conditions.length > 0) {
        rule.conditions.forEach((condition, index) => {
          console.log(`   ${index + 1}. Field: ${condition.field}`);
          console.log(`      Operator: ${condition.operator}`);
          console.log(`      Value: ${condition.value}`);
          console.log(`      Logical Operator: ${condition.logicalOperator}`);
        });
      } else {
        console.log('   No conditions defined');
      }
      
      // Actions
      console.log('\n⚡ Actions:');
      if (rule.actions && rule.actions.length > 0) {
        rule.actions.forEach((action, index) => {
          console.log(`   ${index + 1}. Type: ${action.type}`);
          console.log(`      Field: ${action.field}`);
          console.log(`      Value: ${action.value || 'N/A'}`);
          console.log(`      Message: ${action.message || 'N/A'}`);
        });
      } else {
        console.log('   No actions defined');
      }
      
      // Decision Table
      console.log('\n📊 Decision Table:');
      if (rule.decisionTable && rule.decisionTable.length > 0) {
        rule.decisionTable.forEach((row, index) => {
          console.log(`   Row ${index + 1} (ID: ${row.id}):`);
          console.log(`     Priority: ${row.priority}`);
          console.log(`     Conditions: ${row.conditions.length}`);
          row.conditions.forEach((condition, i) => {
            console.log(`       ${i + 1}. ${condition.field} ${condition.operator} ${condition.value}`);
          });
          console.log(`     Actions: ${row.actions.length}`);
          row.actions.forEach((action, i) => {
            console.log(`       ${i + 1}. ${action.type} ${action.field} = ${action.value}`);
          });
        });
      } else {
        console.log('   No decision table defined');
      }
      
      // Check Table
      console.log('\n🔍 Check Table:');
      if (rule.checkTable && rule.checkTable.length > 0) {
        rule.checkTable.forEach((row, index) => {
          console.log(`   ${index + 1}. Field: ${row.field}`);
          console.log(`      Operator: ${row.operator}`);
          console.log(`      Value: ${row.value}`);
          console.log(`      Result: ${row.result}`);
        });
      } else {
        console.log('   No check table defined');
      }
      
      // Regex Pattern
      if (rule.regexPattern) {
        console.log(`\n🔤 Regex Pattern: ${rule.regexPattern}`);
      }
      
      // Statistics
      console.log('\n📈 Execution Statistics:');
      console.log(`   Usage Count: ${rule.usageCount}`);
      console.log(`   Execution Count: ${rule.executionCount}`);
      console.log(`   Success Count: ${rule.successCount}`);
      console.log(`   Failure Count: ${rule.failureCount}`);
      console.log(`   Success Rate: ${rule.successRate}%`);
      console.log(`   Complexity Score: ${rule.complexityScore}`);
      console.log(`   Is Effective: ${rule.isEffective}`);
      
      // Form Population Instructions
      console.log('\n🎯 Form Population Instructions:');
      console.log('===============================');
      console.log('1. Rule Configuration:');
      console.log(`   - Rule Name: "${rule.name}"`);
      console.log(`   - Description: "${rule.description}"`);
      
      console.log('\n2. Rule Scope:');
      if (rule.scope === 'dataObject') {
        console.log('   - Select: "Data Object Specific"');
      } else if (rule.scope === 'global') {
        console.log('   - Select: "Generic Rule"');
      } else if (rule.scope === 'field') {
        console.log('   - Select: "Cross Object Rule"');
      }
      
      console.log('\n3. Rule Type:');
      console.log(`   - Select: "${rule.type.charAt(0).toUpperCase() + rule.type.slice(1)} Rule"`);
      
      console.log('\n4. Data Object:');
      console.log(`   - Select: "${rule.dataObject}"`);
      
      console.log('\n5. Conditions:');
      if (rule.conditions && rule.conditions.length > 0) {
        rule.conditions.forEach((condition, index) => {
          console.log(`   - Condition ${index + 1}:`);
          console.log(`     Field: ${condition.field}`);
          console.log(`     Operator: ${condition.operator}`);
          console.log(`     Value: ${condition.value}`);
          console.log(`     Logical: ${condition.logicalOperator}`);
        });
      }
      
      console.log('\n6. Actions:');
      if (rule.actions && rule.actions.length > 0) {
        rule.actions.forEach((action, index) => {
          console.log(`   - Action ${index + 1}:`);
          console.log(`     Type: ${action.type}`);
          console.log(`     Field: ${action.field}`);
          console.log(`     Value: ${action.value || 'N/A'}`);
        });
      }
      
      console.log('\n7. Decision Table:');
      if (rule.decisionTable && rule.decisionTable.length > 0) {
        console.log('   - Populate decision table with:');
        rule.decisionTable.forEach((row, index) => {
          console.log(`     Row ${index + 1}:`);
          console.log(`       Conditions: ${JSON.stringify(row.conditions)}`);
          console.log(`       Actions: ${JSON.stringify(row.actions)}`);
        });
      }
      
      console.log('\n8. Additional Settings:');
      console.log(`   - Priority: ${rule.priority}`);
      console.log(`   - Enabled: ${rule.enabled}`);
      console.log(`   - Status: ${rule.status}`);
      console.log(`   - Tags: ${rule.tags.join(', ')}`);
      
      return rule;
      
    } else {
      console.log('❌ Failed to fetch business rule:', response.data.message);
      return null;
    }
    
  } catch (error) {
    console.error('❌ Error fetching business rule:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
    return null;
  }
}

// Test with the provided rule ID
const ruleId = '68f92fd8e17843ebd8cac693';
fetchBusinessRuleForEdit(ruleId);

