# Business Rules API - Test Examples

This document provides comprehensive examples for testing all Business Rules API endpoints.

## Base URL
```
http://localhost:3001
```

## 1. Create a Business Rule

### Basic Business Rule Creation
```bash
curl -X POST http://localhost:3001/api/business-rules \
  -H "Content-Type: application/json" \
  -d '{
    "id": "rule_1703123456789",
    "name": "Customer Credit Limit Validation",
    "description": "Validates customer credit limits",
    "type": "validation",
    "dataObject": "customer",
    "status": "draft",
    "conditions": [
      {
        "id": 1703123456790,
        "field": "creditLimit",
        "operator": "greaterThan",
        "value": "10000",
        "logicalOperator": "AND"
      }
    ],
    "actions": [
      {
        "id": 1703123456791,
        "type": "setField",
        "field": "status",
        "value": "approved"
      }
    ],
    "decisionTable": [],
    "expression": "creditLimit > 10000",
    "regexPattern": "",
    "checkTable": [],
    "priority": 1,
    "enabled": true,
    "version": "1.0.0",
    "createdBy": "current_user",
    "updatedBy": "current_user",
    "isActive": true,
    "tags": ["validation", "credit", "customer"]
  }'
```

### Order Processing Rule
```bash
curl -X POST http://localhost:3001/api/business-rules \
  -H "Content-Type: application/json" \
  -d '{
    "id": "rule_order_processing_001",
    "name": "Order Amount Validation",
    "description": "Validates order amounts and applies discounts",
    "type": "business",
    "dataObject": "order",
    "status": "active",
    "conditions": [
      {
        "id": 1703123456792,
        "field": "orderAmount",
        "operator": "greaterThan",
        "value": "1000",
        "logicalOperator": "AND"
      },
      {
        "id": 1703123456793,
        "field": "customerType",
        "operator": "equals",
        "value": "premium",
        "logicalOperator": "AND"
      }
    ],
    "actions": [
      {
        "id": 1703123456794,
        "type": "setField",
        "field": "discount",
        "value": "10"
      },
      {
        "id": 1703123456795,
        "type": "showMessage",
        "message": "Premium customer discount applied"
      }
    ],
    "decisionTable": [
      {
        "id": 1,
        "conditions": ["orderAmount > 1000", "customerType = premium"],
        "actions": ["applyDiscount", "showMessage"],
        "priority": 1
      }
    ],
    "expression": "orderAmount > 1000 && customerType === 'premium'",
    "regexPattern": "",
    "checkTable": [],
    "priority": 2,
    "enabled": true,
    "version": "1.0.0",
    "createdBy": "business_analyst",
    "updatedBy": "business_analyst",
    "isActive": true,
    "tags": ["order", "discount", "premium", "business"]
  }'
```

### Material Validation Rule
```bash
curl -X POST http://localhost:3001/api/business-rules \
  -H "Content-Type: application/json" \
  -d '{
    "id": "rule_material_validation_001",
    "name": "Material Code Format Validation",
    "description": "Validates material code format using regex",
    "type": "validation",
    "dataObject": "material",
    "status": "active",
    "conditions": [
      {
        "id": 1703123456796,
        "field": "materialCode",
        "operator": "regex",
        "value": "^MAT-[0-9]{6}$",
        "logicalOperator": "AND"
      }
    ],
    "actions": [
      {
        "id": 1703123456797,
        "type": "setField",
        "field": "validationStatus",
        "value": "valid"
      },
      {
        "id": 1703123456798,
        "type": "showMessage",
        "message": "Material code format is valid"
      }
    ],
    "decisionTable": [],
    "expression": "/^MAT-[0-9]{6}$/.test(materialCode)",
    "regexPattern": "^MAT-[0-9]{6}$",
    "checkTable": [
      {
        "id": 1,
        "field": "materialCode",
        "operator": "regex",
        "value": "^MAT-[0-9]{6}$",
        "result": "valid"
      }
    ],
    "priority": 1,
    "enabled": true,
    "version": "1.0.0",
    "createdBy": "material_admin",
    "updatedBy": "material_admin",
    "isActive": true,
    "tags": ["material", "validation", "regex", "format"]
  }'
```

## 2. Get All Business Rules

### Basic List
```bash
curl -X GET http://localhost:3001/api/business-rules
```

### With Pagination
```bash
curl -X GET "http://localhost:3001/api/business-rules?page=1&limit=5"
```

### Filter by Status
```bash
curl -X GET "http://localhost:3001/api/business-rules?status=active"
```

### Filter by Type
```bash
curl -X GET "http://localhost:3001/api/business-rules?type=validation"
```

### Filter by Data Object
```bash
curl -X GET "http://localhost:3001/api/business-rules?dataObject=customer"
```

### Filter by Created By
```bash
curl -X GET "http://localhost:3001/api/business-rules?createdBy=current_user"
```

### Filter by Active Status
```bash
curl -X GET "http://localhost:3001/api/business-rules?isActive=true"
```

### Filter by Enabled Status
```bash
curl -X GET "http://localhost:3001/api/business-rules?enabled=true"
```

### Filter by Tags
```bash
curl -X GET "http://localhost:3001/api/business-rules?tags=validation"
```

### Filter by Category
```bash
curl -X GET "http://localhost:3001/api/business-rules?category=credit"
```

### Filter by Scope
```bash
curl -X GET "http://localhost:3001/api/business-rules?scope=dataObject"
```

### Filter by Priority Range
```bash
curl -X GET "http://localhost:3001/api/business-rules?minPriority=1&maxPriority=5"
```

### Filter by Date Range
```bash
curl -X GET "http://localhost:3001/api/business-rules?startDate=2025-01-01&endDate=2025-12-31"
```

### Filter by Execution Count
```bash
curl -X GET "http://localhost:3001/api/business-rules?minExecutions=10"
```

### Filter by Success Rate
```bash
curl -X GET "http://localhost:3001/api/business-rules?minSuccessRate=80"
```

### Search with Best Match Sorting
```bash
curl -X GET "http://localhost:3001/api/business-rules?search=validation&sortBy=bestMatch"
```

### Sort by Priority
```bash
curl -X GET "http://localhost:3001/api/business-rules?sortBy=priority&sortOrder=asc"
```

### Sort by Creation Date
```bash
curl -X GET "http://localhost:3001/api/business-rules?sortBy=createdAt&sortOrder=desc"
```

## 3. Get Single Business Rule

### By MongoDB ID
```bash
curl -X GET http://localhost:3001/api/business-rules/64f8a1b2c3d4e5f6a7b8c9d0
```

### By Custom Rule ID
```bash
curl -X GET http://localhost:3001/api/business-rules/by-rule-id/rule_1703123456789
```

## 4. Update Business Rule

### Update Basic Information
```bash
curl -X PUT http://localhost:3001/api/business-rules/64f8a1b2c3d4e5f6a7b8c9d0 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Customer Credit Limit Validation",
    "description": "Updated description for credit limit validation",
    "tags": ["updated", "validation", "credit"]
  }'
```

### Update Rule Status
```bash
curl -X PATCH http://localhost:3001/api/business-rules/64f8a1b2c3d4e5f6a7b8c9d0/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "active",
    "updatedBy": "admin_user"
  }'
```

### Update Enabled Status
```bash
curl -X PATCH http://localhost:3001/api/business-rules/64f8a1b2c3d4e5f6a7b8c9d0/enabled \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": false,
    "updatedBy": "admin_user"
  }'
```

### Update Priority
```bash
curl -X PATCH http://localhost:3001/api/business-rules/64f8a1b2c3d4e5f6a7b8c9d0/priority \
  -H "Content-Type: application/json" \
  -d '{
    "priority": 5,
    "updatedBy": "admin_user"
  }'
```

## 5. Execute Business Rule

### Execute Rule with Data
```bash
curl -X POST http://localhost:3001/api/business-rules/64f8a1b2c3d4e5f6a7b8c9d0/execute \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "creditLimit": 15000,
      "customerType": "premium",
      "orderAmount": 2500
    }
  }'
```

## 6. Get Business Rules by Data Object

### Get All Rules for Data Object
```bash
curl -X GET http://localhost:3001/api/business-rules/data-object/customer
```

### Include Inactive Rules
```bash
curl -X GET "http://localhost:3001/api/business-rules/data-object/customer?includeInactive=true"
```

## 7. Get Business Rules by Type

### Get All Rules by Type
```bash
curl -X GET http://localhost:3001/api/business-rules/type/validation
```

### Include Inactive Rules
```bash
curl -X GET "http://localhost:3001/api/business-rules/type/validation?includeInactive=true"
```

## 8. Get Business Rules by User

### Get All Rules Created by User
```bash
curl -X GET http://localhost:3001/api/business-rules/user/current_user
```

### Include Inactive Rules
```bash
curl -X GET "http://localhost:3001/api/business-rules/user/current_user?includeInactive=true"
```

## 9. Get Statistics

### Overview Statistics
```bash
curl -X GET http://localhost:3001/api/business-rules/stats/overview
```

## 10. Get Metadata

### Get All Rule Types
```bash
curl -X GET http://localhost:3001/api/business-rules/meta/types
```

### Get All Data Objects
```bash
curl -X GET http://localhost:3001/api/business-rules/meta/data-objects
```

### Get All Statuses
```bash
curl -X GET http://localhost:3001/api/business-rules/meta/statuses
```

### Get All Tags
```bash
curl -X GET http://localhost:3001/api/business-rules/meta/tags
```

### Get All Categories
```bash
curl -X GET http://localhost:3001/api/business-rules/meta/categories
```

## 11. Delete Business Rule

```bash
curl -X DELETE http://localhost:3001/api/business-rules/64f8a1b2c3d4e5f6a7b8c9d0
```

## 12. Advanced Search Examples

### Search with Multiple Filters
```bash
curl -X GET "http://localhost:3001/api/business-rules?status=active&type=validation&dataObject=customer&enabled=true&tags=credit&sortBy=priority&sortOrder=asc&page=1&limit=10"
```

### Search with Priority and Success Rate
```bash
curl -X GET "http://localhost:3001/api/business-rules?minPriority=1&maxPriority=3&minSuccessRate=90"
```

### Search with Execution Metrics
```bash
curl -X GET "http://localhost:3001/api/business-rules?minExecutions=5&startDate=2025-01-01"
```

## Expected Response Formats

### Successful Response
```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "id": "rule_1703123456789",
    "name": "Customer Credit Limit Validation",
    "description": "Validates customer credit limits",
    "type": "validation",
    "dataObject": "customer",
    "status": "draft",
    "conditions": [
      {
        "id": 1703123456790,
        "field": "creditLimit",
        "operator": "greaterThan",
        "value": "10000",
        "logicalOperator": "AND"
      }
    ],
    "actions": [
      {
        "id": 1703123456791,
        "type": "setField",
        "field": "status",
        "value": "approved"
      }
    ],
    "decisionTable": [],
    "expression": "creditLimit > 10000",
    "regexPattern": "",
    "checkTable": [],
    "priority": 1,
    "enabled": true,
    "version": "1.0.0",
    "createdBy": "current_user",
    "updatedBy": "current_user",
    "isActive": true,
    "tags": ["validation", "credit", "customer"],
    "usageCount": 0,
    "executionCount": 0,
    "successCount": 0,
    "failureCount": 0,
    "conditionCount": 1,
    "actionCount": 1,
    "ageInDays": 5,
    "complexityScore": 7,
    "successRate": 0,
    "isEffective": false,
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

### List Response with Pagination
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### Best Match Search Response
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "id": "rule_1703123456789",
      "name": "Customer Credit Limit Validation",
      "matchScore": 150,
      ...
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  }
}
```

### Rule Execution Response
```json
{
  "success": true,
  "data": {
    "ruleId": "rule_1703123456789",
    "ruleName": "Customer Credit Limit Validation",
    "conditionsMet": true,
    "actionsExecuted": [
      {
        "actionId": 1703123456791,
        "type": "setField",
        "success": true,
        "message": "Field status set to approved"
      }
    ],
    "success": true,
    "message": "Rule executed successfully"
  }
}
```

### Statistics Response
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalRules": 50,
      "activeRules": 45,
      "enabledRules": 40,
      "activeStatusRules": 35,
      "draftRules": 10,
      "archivedRules": 0,
      "totalExecutions": 1250,
      "totalSuccesses": 1100,
      "totalFailures": 150
    },
    "byType": [
      {
        "_id": "validation",
        "count": 20,
        "totalExecutions": 500,
        "totalSuccesses": 450
      },
      {
        "_id": "business",
        "count": 15,
        "totalExecutions": 300,
        "totalSuccesses": 280
      }
    ],
    "byDataObject": [
      {
        "_id": "customer",
        "count": 15,
        "totalExecutions": 400
      },
      {
        "_id": "order",
        "count": 10,
        "totalExecutions": 300
      }
    ],
    "monthly": [
      {
        "_id": { "year": 2025, "month": 1 },
        "count": 25
      }
    ]
  }
}
```

## Testing Tips

1. **Start with creating a simple business rule** using the first example
2. **Test the search functionality** by creating multiple rules with different types
3. **Use the statistics endpoint** to verify your data
4. **Test error handling** by sending invalid data
5. **Use the metadata endpoints** to understand available options
6. **Test the best match search** with various search terms
7. **Test rule execution** with different data scenarios
8. **Test priority and enabled status** to see how they affect rule behavior

## Common Use Cases

1. **Business Logic**: Implement complex business rules and logic
2. **Data Validation**: Validate data based on custom rules
3. **Workflow Automation**: Automate business processes
4. **Decision Making**: Implement decision tables and logic
5. **Data Transformation**: Transform data based on rules
6. **Integration**: Connect rules with external systems
7. **Monitoring**: Track rule execution and effectiveness

## Rule Types Supported

- `validation` - Data validation rules
- `calculation` - Calculation and computation rules
- `workflow` - Workflow automation rules
- `notification` - Notification and alert rules
- `integration` - System integration rules
- `security` - Security and access control rules
- `business` - Business logic rules
- `data` - Data processing rules
- `ui` - User interface rules
- `api` - API and service rules

## Condition Operators

- `equals` - Equal to
- `notEquals` - Not equal to
- `greaterThan` - Greater than
- `greaterThanOrEqual` - Greater than or equal to
- `lessThan` - Less than
- `lessThanOrEqual` - Less than or equal to
- `contains` - Contains string
- `notContains` - Does not contain string
- `startsWith` - Starts with string
- `endsWith` - Ends with string
- `isEmpty` - Is empty
- `isNotEmpty` - Is not empty
- `isNull` - Is null
- `isNotNull` - Is not null
- `in` - In array
- `notIn` - Not in array
- `between` - Between values
- `regex` - Regular expression match

## Action Types

- `setField` - Set field value
- `clearField` - Clear field value
- `showField` - Show field
- `hideField` - Hide field
- `enableField` - Enable field
- `disableField` - Disable field
- `setRequired` - Set field as required
- `setOptional` - Set field as optional
- `setReadonly` - Set field as readonly
- `setEditable` - Set field as editable
- `setValue` - Set value
- `calculate` - Perform calculation
- `validate` - Validate data
- `showMessage` - Show message
- `hideMessage` - Hide message
- `redirect` - Redirect user
- `callAPI` - Call external API
- `executeFunction` - Execute function
- `sendNotification` - Send notification
- `logEvent` - Log event
- `triggerWorkflow` - Trigger workflow

## Logical Operators

- `AND` - Logical AND
- `OR` - Logical OR
- `NOT` - Logical NOT

## Rule Statuses

- `draft` - Rule is in draft state
- `active` - Rule is active and executing
- `inactive` - Rule is inactive but not deleted
- `archived` - Rule is archived
- `deprecated` - Rule is deprecated

## Rule Scopes

- `global` - Global scope
- `dataObject` - Data object scope
- `field` - Field scope
- `user` - User scope
- `role` - Role scope
