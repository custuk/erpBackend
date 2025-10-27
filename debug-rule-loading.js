const axios = require('axios');

// Debug script to test rule loading and identify the exact issue
async function debugRuleLoading() {
  const ruleId = '68f92fd8e17843ebd8cac693';
  
  try {
    console.log('🔍 Debugging rule loading for ID:', ruleId);
    
    // Test 1: Fetch the rule
    console.log('\n1️⃣ Testing API fetch...');
    const response = await axios.get(`http://localhost:3001/api/business-rules/${ruleId}`);
    
    if (response.data.success) {
      console.log('✅ API fetch successful');
      const rule = response.data.data;
      
      // Test 2: Check rule structure
      console.log('\n2️⃣ Analyzing rule structure...');
      console.log('📋 Rule Details:');
      console.log(`   ID: ${rule.id}`);
      console.log(`   Name: ${rule.name}`);
      console.log(`   Description: ${rule.description}`);
      console.log(`   Type: ${rule.type}`);
      console.log(`   Data Object: ${rule.dataObject}`);
      console.log(`   Status: ${rule.status}`);
      console.log(`   Scope: ${rule.scope}`);
      
      // Test 3: Check conditions
      console.log('\n3️⃣ Checking conditions...');
      if (rule.conditions && rule.conditions.length > 0) {
        console.log(`   ✅ Found ${rule.conditions.length} conditions`);
        rule.conditions.forEach((condition, index) => {
          console.log(`   Condition ${index + 1}:`);
          console.log(`     Field: ${condition.field}`);
          console.log(`     Operator: ${condition.operator}`);
          console.log(`     Value: ${condition.value}`);
          console.log(`     Logical: ${condition.logicalOperator}`);
        });
      } else {
        console.log('   ❌ No conditions found');
      }
      
      // Test 4: Check actions
      console.log('\n4️⃣ Checking actions...');
      if (rule.actions && rule.actions.length > 0) {
        console.log(`   ✅ Found ${rule.actions.length} actions`);
        rule.actions.forEach((action, index) => {
          console.log(`   Action ${index + 1}:`);
          console.log(`     Type: ${action.type}`);
          console.log(`     Field: ${action.field}`);
          console.log(`     Value: ${action.value}`);
          console.log(`     Message: ${action.message}`);
        });
      } else {
        console.log('   ❌ No actions found');
      }
      
      // Test 5: Check decision table
      console.log('\n5️⃣ Checking decision table...');
      if (rule.decisionTable && rule.decisionTable.length > 0) {
        console.log(`   ✅ Found ${rule.decisionTable.length} decision table rows`);
        rule.decisionTable.forEach((row, index) => {
          console.log(`   Row ${index + 1}:`);
          console.log(`     ID: ${row.id}`);
          console.log(`     Priority: ${row.priority}`);
          console.log(`     Conditions: ${row.conditions.length}`);
          console.log(`     Actions: ${row.actions.length}`);
        });
      } else {
        console.log('   ❌ No decision table found');
      }
      
      // Test 6: Generate frontend form population code
      console.log('\n6️⃣ Generating frontend form population code...');
      console.log('📝 Copy this code to your frontend:');
      console.log(`
// Form population code for frontend
function populateEditForm(rule) {
  // Basic information
  document.getElementById('ruleName').value = '${rule.name}';
  document.getElementById('ruleDescription').value = '${rule.description}';
  
  // Rule scope
  selectRuleScope('${rule.scope}');
  
  // Rule type
  selectRuleType('${rule.type}');
  
  // Data object
  document.getElementById('dataObject').value = '${rule.dataObject}';
  
  // Priority and status
  document.getElementById('priority').value = ${rule.priority};
  document.getElementById('status').value = '${rule.status}';
  document.getElementById('enabled').checked = ${rule.enabled};
  document.getElementById('tags').value = '${(rule.tags || []).join(', ')}';
  
  // Populate conditions
  populateConditions(${JSON.stringify(rule.conditions)});
  
  // Populate actions
  populateActions(${JSON.stringify(rule.actions)});
  
  // Populate decision table
  populateDecisionTable(${JSON.stringify(rule.decisionTable)});
}

function selectRuleScope(scope) {
  document.querySelectorAll('.scope-option').forEach(option => {
    option.classList.remove('active');
  });
  
  let scopeElement;
  switch (scope) {
    case 'global':
      scopeElement = document.querySelector('[data-scope="generic"]');
      break;
    case 'dataObject':
      scopeElement = document.querySelector('[data-scope="dataObject"]');
      break;
    case 'field':
      scopeElement = document.querySelector('[data-scope="crossObject"]');
      break;
  }
  
  if (scopeElement) {
    scopeElement.classList.add('active');
  }
}

function selectRuleType(type) {
  document.querySelectorAll('.rule-type-option').forEach(option => {
    option.classList.remove('active');
  });
  
  const typeElement = document.querySelector(\`[data-rule-type="\${type}"]\`);
  if (typeElement) {
    typeElement.classList.add('active');
  }
}

function populateConditions(conditions) {
  const container = document.getElementById('conditionsContainer');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (conditions && conditions.length > 0) {
    conditions.forEach((condition, index) => {
      addConditionRow(condition, index);
    });
  } else {
    addConditionRow({}, 0);
  }
}

function addConditionRow(condition = {}, index = 0) {
  const container = document.getElementById('conditionsContainer');
  const row = document.createElement('div');
  row.className = 'condition-row';
  row.innerHTML = \`
    <div class="condition-field">
      <input type="text" value="\${condition.field || ''}" placeholder="Field" />
    </div>
    <div class="condition-operator">
      <select>
        <option value="equals" \${condition.operator === 'equals' ? 'selected' : ''}>Equals</option>
        <option value="notEquals" \${condition.operator === 'notEquals' ? 'selected' : ''}>Not Equals</option>
        <option value="greaterThan" \${condition.operator === 'greaterThan' ? 'selected' : ''}>Greater Than</option>
        <option value="lessThan" \${condition.operator === 'lessThan' ? 'selected' : ''}>Less Than</option>
        <option value="contains" \${condition.operator === 'contains' ? 'selected' : ''}>Contains</option>
        <option value="isEmpty" \${condition.operator === 'isEmpty' ? 'selected' : ''}>Is Empty</option>
        <option value="isNotEmpty" \${condition.operator === 'isNotEmpty' ? 'selected' : ''}>Is Not Empty</option>
      </select>
    </div>
    <div class="condition-value">
      <input type="text" value="\${condition.value || ''}" placeholder="Value" />
    </div>
    <div class="condition-logical">
      <select>
        <option value="AND" \${condition.logicalOperator === 'AND' ? 'selected' : ''}>AND</option>
        <option value="OR" \${condition.logicalOperator === 'OR' ? 'selected' : ''}>OR</option>
        <option value="NOT" \${condition.logicalOperator === 'NOT' ? 'selected' : ''}>NOT</option>
      </select>
    </div>
    <div>
      <button type="button" onclick="removeCondition(this)">Remove</button>
    </div>
  \`;
  container.appendChild(row);
}

function populateActions(actions) {
  const container = document.getElementById('actionsContainer');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (actions && actions.length > 0) {
    actions.forEach((action, index) => {
      addActionRow(action, index);
    });
  } else {
    addActionRow({}, 0);
  }
}

function addActionRow(action = {}, index = 0) {
  const container = document.getElementById('actionsContainer');
  const row = document.createElement('div');
  row.className = 'action-row';
  row.innerHTML = \`
    <div class="action-type">
      <select>
        <option value="setField" \${action.type === 'setField' ? 'selected' : ''}>Set Field</option>
        <option value="clearField" \${action.type === 'clearField' ? 'selected' : ''}>Clear Field</option>
        <option value="showField" \${action.type === 'showField' ? 'selected' : ''}>Show Field</option>
        <option value="hideField" \${action.type === 'hideField' ? 'selected' : ''}>Hide Field</option>
        <option value="validate" \${action.type === 'validate' ? 'selected' : ''}>Validate</option>
        <option value="showMessage" \${action.type === 'showMessage' ? 'selected' : ''}>Show Message</option>
      </select>
    </div>
    <div class="action-field">
      <input type="text" value="\${action.field || ''}" placeholder="Field" />
    </div>
    <div class="action-value">
      <input type="text" value="\${action.value || ''}" placeholder="Value" />
    </div>
    <div class="action-message">
      <input type="text" value="\${action.message || ''}" placeholder="Message" />
    </div>
    <div>
      <button type="button" onclick="removeAction(this)">Remove</button>
    </div>
  \`;
  container.appendChild(row);
}

function populateDecisionTable(decisionTable) {
  const container = document.getElementById('decisionTableContainer');
  if (!container) return;
  
  if (decisionTable && decisionTable.length > 0) {
    container.innerHTML = '';
    decisionTable.forEach((row, index) => {
      addDecisionTableRow(row, index);
    });
  } else {
    container.innerHTML = '<p>No decision table rows defined.</p>';
  }
}

function addDecisionTableRow(row = {}, index = 0) {
  const container = document.getElementById('decisionTableContainer');
  const rowElement = document.createElement('div');
  rowElement.className = 'decision-table-row';
  rowElement.innerHTML = \`
    <div class="row-header">
      <h4>Row \${index + 1} (ID: \${row.id || 'New'})</h4>
      <button type="button" onclick="removeDecisionTableRow(this)">Remove Row</button>
    </div>
    <div class="row-conditions">
      <h5>Conditions:</h5>
      <div class="conditions-list">
        \${(row.conditions || []).map(condition => \`
          <div class="condition-item">
            <span>\${condition.field} \${condition.operator} \${condition.value}</span>
          </div>
        \`).join('')}
      </div>
    </div>
    <div class="row-actions">
      <h5>Actions:</h5>
      <div class="actions-list">
        \${(row.actions || []).map(action => \`
          <div class="action-item">
            <span>\${action.type} \${action.field} = \${action.value}</span>
          </div>
        \`).join('')}
      </div>
    </div>
  \`;
  container.appendChild(rowElement);
}
      `);
      
      // Test 7: Check for common issues
      console.log('\n7️⃣ Checking for common issues...');
      
      // Check if required fields are missing
      const requiredFields = ['name', 'type', 'dataObject'];
      const missingFields = requiredFields.filter(field => !rule[field]);
      
      if (missingFields.length > 0) {
        console.log(`   ❌ Missing required fields: ${missingFields.join(', ')}`);
      } else {
        console.log('   ✅ All required fields present');
      }
      
      // Check if form elements exist (this would be checked in frontend)
      console.log('   📝 Frontend form elements to check:');
      console.log('     - ruleName input field');
      console.log('     - ruleDescription textarea');
      console.log('     - dataObject select field');
      console.log('     - conditionsContainer div');
      console.log('     - actionsContainer div');
      console.log('     - decisionTableContainer div');
      
      console.log('\n✅ Rule data is valid and ready for form population');
      
    } else {
      console.log('❌ API returned error:', response.data.message);
    }
    
  } catch (error) {
    console.error('❌ Error debugging rule loading:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
  }
}

// Run the debug
debugRuleLoading();

