// Frontend JavaScript example for loading business rule into edit form
// This demonstrates how to populate the edit form when "Edit" button is clicked

class BusinessRuleEditor {
  constructor() {
    this.currentRule = null;
    this.apiBaseUrl = 'http://localhost:3001/api/business-rules';
  }

  // Method to handle edit button click
  async handleEditClick(ruleId) {
    try {
      console.log(`🔍 Loading rule for editing: ${ruleId}`);
      
      // Show loading state
      this.showLoadingState();
      
      // Fetch rule data
      const rule = await this.fetchRuleById(ruleId);
      
      if (rule) {
        // Populate the form with rule data
        this.populateEditForm(rule);
        console.log('✅ Rule loaded successfully into edit form');
      } else {
        console.error('❌ Failed to load rule');
        this.showError('Failed to load rule. Please try again.');
      }
      
    } catch (error) {
      console.error('❌ Error loading rule:', error);
      this.showError('Error loading rule. Please try again.');
    }
  }

  // Fetch rule by ID
  async fetchRuleById(ruleId) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/${ruleId}`);
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch rule');
      }
    } catch (error) {
      console.error('Error fetching rule:', error);
      throw error;
    }
  }

  // Populate the edit form with rule data
  populateEditForm(rule) {
    console.log('📝 Populating edit form with rule data...');
    
    // 1. Basic Information
    this.setFieldValue('ruleName', rule.name);
    this.setFieldValue('ruleDescription', rule.description);
    
    // 2. Rule Scope
    this.selectRuleScope(rule.scope);
    
    // 3. Rule Type
    this.selectRuleType(rule.type);
    
    // 4. Data Object
    this.selectDataObject(rule.dataObject);
    
    // 5. Conditions
    this.populateConditions(rule.conditions);
    
    // 6. Actions
    this.populateActions(rule.actions);
    
    // 7. Decision Table
    this.populateDecisionTable(rule.decisionTable);
    
    // 8. Additional Settings
    this.setFieldValue('priority', rule.priority);
    this.setCheckboxValue('enabled', rule.enabled);
    this.setFieldValue('status', rule.status);
    this.setFieldValue('version', rule.version);
    this.setFieldValue('tags', rule.tags.join(', '));
    
    // 9. Regex Pattern (if applicable)
    if (rule.regexPattern) {
      this.setFieldValue('regexPattern', rule.regexPattern);
    }
    
    // Store current rule for updates
    this.currentRule = rule;
    
    console.log('✅ Form populated successfully');
  }

  // Helper methods for form population
  setFieldValue(fieldId, value) {
    const field = document.getElementById(fieldId);
    if (field) {
      field.value = value || '';
    }
  }

  setCheckboxValue(fieldId, checked) {
    const checkbox = document.getElementById(fieldId);
    if (checkbox) {
      checkbox.checked = checked;
    }
  }

  selectRuleScope(scope) {
    // Remove active class from all scope options
    document.querySelectorAll('.scope-option').forEach(option => {
      option.classList.remove('active');
    });
    
    // Add active class to selected scope
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

  selectRuleType(type) {
    // Remove active class from all rule type options
    document.querySelectorAll('.rule-type-option').forEach(option => {
      option.classList.remove('active');
    });
    
    // Add active class to selected rule type
    const typeElement = document.querySelector(`[data-rule-type="${type}"]`);
    if (typeElement) {
      typeElement.classList.add('active');
    }
  }

  selectDataObject(dataObject) {
    const select = document.getElementById('dataObject');
    if (select) {
      select.value = dataObject;
    }
  }

  populateConditions(conditions) {
    const conditionsContainer = document.getElementById('conditionsContainer');
    if (!conditionsContainer || !conditions) return;
    
    // Clear existing conditions
    conditionsContainer.innerHTML = '';
    
    // Add each condition
    conditions.forEach((condition, index) => {
      this.addConditionRow(condition, index);
    });
  }

  addConditionRow(condition, index) {
    const conditionsContainer = document.getElementById('conditionsContainer');
    const conditionRow = document.createElement('div');
    conditionRow.className = 'condition-row';
    conditionRow.innerHTML = `
      <div class="condition-field">
        <input type="text" value="${condition.field}" placeholder="Field" />
      </div>
      <div class="condition-operator">
        <select>
          <option value="equals" ${condition.operator === 'equals' ? 'selected' : ''}>Equals</option>
          <option value="notEquals" ${condition.operator === 'notEquals' ? 'selected' : ''}>Not Equals</option>
          <option value="greaterThan" ${condition.operator === 'greaterThan' ? 'selected' : ''}>Greater Than</option>
          <option value="lessThan" ${condition.operator === 'lessThan' ? 'selected' : ''}>Less Than</option>
          <option value="contains" ${condition.operator === 'contains' ? 'selected' : ''}>Contains</option>
          <option value="isEmpty" ${condition.operator === 'isEmpty' ? 'selected' : ''}>Is Empty</option>
          <option value="isNotEmpty" ${condition.operator === 'isNotEmpty' ? 'selected' : ''}>Is Not Empty</option>
        </select>
      </div>
      <div class="condition-value">
        <input type="text" value="${condition.value || ''}" placeholder="Value" />
      </div>
      <div class="condition-logical">
        <select>
          <option value="AND" ${condition.logicalOperator === 'AND' ? 'selected' : ''}>AND</option>
          <option value="OR" ${condition.logicalOperator === 'OR' ? 'selected' : ''}>OR</option>
          <option value="NOT" ${condition.logicalOperator === 'NOT' ? 'selected' : ''}>NOT</option>
        </select>
      </div>
      <div class="condition-actions">
        <button type="button" onclick="removeCondition(this)">Remove</button>
      </div>
    `;
    
    conditionsContainer.appendChild(conditionRow);
  }

  populateActions(actions) {
    const actionsContainer = document.getElementById('actionsContainer');
    if (!actionsContainer || !actions) return;
    
    // Clear existing actions
    actionsContainer.innerHTML = '';
    
    // Add each action
    actions.forEach((action, index) => {
      this.addActionRow(action, index);
    });
  }

  addActionRow(action, index) {
    const actionsContainer = document.getElementById('actionsContainer');
    const actionRow = document.createElement('div');
    actionRow.className = 'action-row';
    actionRow.innerHTML = `
      <div class="action-type">
        <select>
          <option value="setField" ${action.type === 'setField' ? 'selected' : ''}>Set Field</option>
          <option value="clearField" ${action.type === 'clearField' ? 'selected' : ''}>Clear Field</option>
          <option value="showField" ${action.type === 'showField' ? 'selected' : ''}>Show Field</option>
          <option value="hideField" ${action.type === 'hideField' ? 'selected' : ''}>Hide Field</option>
          <option value="validate" ${action.type === 'validate' ? 'selected' : ''}>Validate</option>
          <option value="showMessage" ${action.type === 'showMessage' ? 'selected' : ''}>Show Message</option>
        </select>
      </div>
      <div class="action-field">
        <input type="text" value="${action.field || ''}" placeholder="Field" />
      </div>
      <div class="action-value">
        <input type="text" value="${action.value || ''}" placeholder="Value" />
      </div>
      <div class="action-message">
        <input type="text" value="${action.message || ''}" placeholder="Message" />
      </div>
      <div class="action-actions">
        <button type="button" onclick="removeAction(this)">Remove</button>
      </div>
    `;
    
    actionsContainer.appendChild(actionRow);
  }

  populateDecisionTable(decisionTable) {
    const decisionTableContainer = document.getElementById('decisionTableContainer');
    if (!decisionTableContainer || !decisionTable) return;
    
    // Clear existing decision table
    decisionTableContainer.innerHTML = '';
    
    // Add each decision table row
    decisionTable.forEach((row, index) => {
      this.addDecisionTableRow(row, index);
    });
  }

  addDecisionTableRow(row, index) {
    const decisionTableContainer = document.getElementById('decisionTableContainer');
    const rowElement = document.createElement('div');
    rowElement.className = 'decision-table-row';
    rowElement.innerHTML = `
      <div class="row-header">
        <h4>Row ${index + 1} (ID: ${row.id})</h4>
        <button type="button" onclick="removeDecisionTableRow(this)">Remove Row</button>
      </div>
      <div class="row-conditions">
        <h5>Conditions:</h5>
        <div class="conditions-list">
          ${row.conditions.map(condition => `
            <div class="condition-item">
              <span>${condition.field} ${condition.operator} ${condition.value}</span>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="row-actions">
        <h5>Actions:</h5>
        <div class="actions-list">
          ${row.actions.map(action => `
            <div class="action-item">
              <span>${action.type} ${action.field} = ${action.value}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    decisionTableContainer.appendChild(rowElement);
  }

  showLoadingState() {
    // Show loading spinner or message
    console.log('⏳ Loading rule data...');
  }

  showError(message) {
    // Show error message to user
    console.error('❌ Error:', message);
    alert(message);
  }

  // Method to save updated rule
  async saveRule() {
    if (!this.currentRule) {
      console.error('No rule loaded for saving');
      return;
    }

    try {
      const updatedRule = this.collectFormData();
      const response = await fetch(`${this.apiBaseUrl}/${this.currentRule._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedRule)
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Rule updated successfully');
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to update rule');
      }
    } catch (error) {
      console.error('❌ Error saving rule:', error);
      throw error;
    }
  }

  collectFormData() {
    // Collect form data and return as rule object
    // This would gather all the form fields and structure them properly
    return {
      name: document.getElementById('ruleName').value,
      description: document.getElementById('ruleDescription').value,
      type: this.getSelectedRuleType(),
      dataObject: document.getElementById('dataObject').value,
      conditions: this.collectConditions(),
      actions: this.collectActions(),
      decisionTable: this.collectDecisionTable(),
      priority: parseInt(document.getElementById('priority').value),
      enabled: document.getElementById('enabled').checked,
      status: document.getElementById('status').value,
      tags: document.getElementById('tags').value.split(',').map(tag => tag.trim())
    };
  }

  getSelectedRuleType() {
    const activeType = document.querySelector('.rule-type-option.active');
    return activeType ? activeType.dataset.ruleType : 'validation';
  }

  collectConditions() {
    const conditions = [];
    const conditionRows = document.querySelectorAll('.condition-row');
    
    conditionRows.forEach((row, index) => {
      const field = row.querySelector('.condition-field input').value;
      const operator = row.querySelector('.condition-operator select').value;
      const value = row.querySelector('.condition-value input').value;
      const logicalOperator = row.querySelector('.condition-logical select').value;
      
      if (field) {
        conditions.push({
          id: index + 1,
          field,
          operator,
          value,
          logicalOperator
        });
      }
    });
    
    return conditions;
  }

  collectActions() {
    const actions = [];
    const actionRows = document.querySelectorAll('.action-row');
    
    actionRows.forEach((row, index) => {
      const type = row.querySelector('.action-type select').value;
      const field = row.querySelector('.action-field input').value;
      const value = row.querySelector('.action-value input').value;
      const message = row.querySelector('.action-message input').value;
      
      if (type) {
        actions.push({
          id: index + 1,
          type,
          field,
          value,
          message
        });
      }
    });
    
    return actions;
  }

  collectDecisionTable() {
    // Implementation for collecting decision table data
    // This would gather all decision table rows and their conditions/actions
    return [];
  }
}

// Usage example:
// const ruleEditor = new BusinessRuleEditor();

// When edit button is clicked:
// ruleEditor.handleEditClick('68f92fd8e17843ebd8cac693');

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BusinessRuleEditor;
}

