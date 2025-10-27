# Forms API - Test Examples

This document provides comprehensive examples for testing all Forms API endpoints.

## Base URL
```
http://localhost:3001
```

## 1. Create a Form

### Basic Form Creation
```bash
curl -X POST http://localhost:3001/api/forms \
  -H "Content-Type: application/json" \
  -d '{
    "id": "form_1758666738899",
    "name": "Material Creation Form",
    "description": "Form for creating new material master data",
    "version": "1.0.0",
    "status": "draft",
    "dataObject": "material",
    "sapTable": "MARA",
    "sapStructure": "BAPI_MATERIAL_SAVE",
    "config": {
      "layout": "vertical",
      "columns": 1,
      "spacing": "medium",
      "showLabels": true,
      "showRequiredIndicator": true,
      "submitButtonText": "Save",
      "cancelButtonText": "Cancel",
      "resetButtonText": "Reset",
      "showResetButton": false,
      "autoSave": false,
      "autoSaveInterval": 30000,
      "validationMode": "onChange"
    },
    "tabs": [
      {
        "id": "main",
        "name": "Main Information",
        "description": "Primary data fields",
        "order": 1,
        "visible": true,
        "sections": [
          {
            "id": "main-section",
            "name": "General Information",
            "description": "Basic information fields",
            "order": 1,
            "visible": true,
            "fields": [],
            "layout": "grid",
            "columns": 1,
            "collapsible": false,
            "collapsed": false
          }
        ]
      }
    ],
    "fields": [],
    "validation": {
      "rules": [],
      "customValidators": []
    },
    "rules": [],
    "createdBy": "current_user",
    "updatedBy": "current_user",
    "isActive": true,
    "tags": ["material", "form", "creation"]
  }'
```

### Customer Registration Form
```bash
curl -X POST http://localhost:3001/api/forms \
  -H "Content-Type: application/json" \
  -d '{
    "id": "form_customer_registration",
    "name": "Customer Registration Form",
    "description": "Form for registering new customers",
    "version": "1.0.0",
    "status": "active",
    "dataObject": "customer",
    "sapTable": "KNA1",
    "sapStructure": "BAPI_CUSTOMER_CREATE",
    "config": {
      "layout": "vertical",
      "columns": 2,
      "spacing": "medium",
      "showLabels": true,
      "showRequiredIndicator": true,
      "submitButtonText": "Register",
      "cancelButtonText": "Cancel",
      "resetButtonText": "Clear",
      "showResetButton": true,
      "autoSave": true,
      "autoSaveInterval": 60000,
      "validationMode": "onBlur"
    },
    "tabs": [
      {
        "id": "personal",
        "name": "Personal Information",
        "description": "Customer personal details",
        "order": 1,
        "visible": true,
        "sections": [
          {
            "id": "basic-info",
            "name": "Basic Information",
            "description": "Name and contact details",
            "order": 1,
            "visible": true,
            "fields": [],
            "layout": "grid",
            "columns": 2,
            "collapsible": false,
            "collapsed": false
          }
        ]
      },
      {
        "id": "business",
        "name": "Business Information",
        "description": "Business and company details",
        "order": 2,
        "visible": true,
        "sections": [
          {
            "id": "company-info",
            "name": "Company Details",
            "description": "Company information",
            "order": 1,
            "visible": true,
            "fields": [],
            "layout": "grid",
            "columns": 1,
            "collapsible": true,
            "collapsed": false
          }
        ]
      }
    ],
    "fields": [],
    "validation": {
      "rules": [
        {
          "field": "email",
          "type": "email",
          "message": "Please enter a valid email address",
          "enabled": true
        },
        {
          "field": "phone",
          "type": "required",
          "message": "Phone number is required",
          "enabled": true
        }
      ],
      "customValidators": []
    },
    "rules": [],
    "createdBy": "admin_user",
    "updatedBy": "admin_user",
    "isActive": true,
    "tags": ["customer", "registration", "business"]
  }'
```

### Order Processing Form
```bash
curl -X POST http://localhost:3001/api/forms \
  -H "Content-Type: application/json" \
  -d '{
    "id": "form_order_processing",
    "name": "Order Processing Form",
    "description": "Form for processing customer orders",
    "version": "1.0.0",
    "status": "active",
    "dataObject": "order",
    "sapTable": "VBAK",
    "sapStructure": "BAPI_SALESORDER_CREATE",
    "config": {
      "layout": "horizontal",
      "columns": 3,
      "spacing": "large",
      "showLabels": true,
      "showRequiredIndicator": true,
      "submitButtonText": "Process Order",
      "cancelButtonText": "Cancel",
      "resetButtonText": "Reset",
      "showResetButton": false,
      "autoSave": true,
      "autoSaveInterval": 30000,
      "validationMode": "onSubmit"
    },
    "tabs": [
      {
        "id": "order-details",
        "name": "Order Details",
        "description": "Order information and items",
        "order": 1,
        "visible": true,
        "sections": [
          {
            "id": "order-header",
            "name": "Order Header",
            "description": "Order header information",
            "order": 1,
            "visible": true,
            "fields": [],
            "layout": "grid",
            "columns": 2,
            "collapsible": false,
            "collapsed": false
          },
          {
            "id": "order-items",
            "name": "Order Items",
            "description": "Order line items",
            "order": 2,
            "visible": true,
            "fields": [],
            "layout": "grid",
            "columns": 1,
            "collapsible": true,
            "collapsed": false
          }
        ]
      }
    ],
    "fields": [],
    "validation": {
      "rules": [
        {
          "field": "customerId",
          "type": "required",
          "message": "Customer ID is required",
          "enabled": true
        },
        {
          "field": "orderDate",
          "type": "required",
          "message": "Order date is required",
          "enabled": true
        }
      ],
      "customValidators": [
        {
          "name": "validateOrderItems",
          "function": "function validateOrderItems(items) { return items.length > 0; }",
          "description": "Validate that order has at least one item",
          "enabled": true
        }
      ]
    },
    "rules": [
      {
        "id": "rule_001",
        "name": "Auto-calculate Total",
        "description": "Automatically calculate order total",
        "condition": "items.length > 0",
        "action": "calculateTotal()",
        "priority": 1,
        "enabled": true
      }
    ],
    "createdBy": "order_admin",
    "updatedBy": "order_admin",
    "isActive": true,
    "tags": ["order", "processing", "sales"]
  }'
```

## 2. Get All Forms

### Basic List
```bash
curl -X GET http://localhost:3001/api/forms
```

### With Pagination
```bash
curl -X GET "http://localhost:3001/api/forms?page=1&limit=5"
```

### Filter by Status
```bash
curl -X GET "http://localhost:3001/api/forms?status=active"
```

### Filter by Data Object
```bash
curl -X GET "http://localhost:3001/api/forms?dataObject=material"
```

### Filter by Created By
```bash
curl -X GET "http://localhost:3001/api/forms?createdBy=current_user"
```

### Filter by Active Status
```bash
curl -X GET "http://localhost:3001/api/forms?isActive=true"
```

### Filter by Tags
```bash
curl -X GET "http://localhost:3001/api/forms?tags=material"
```

### Filter by SAP Table
```bash
curl -X GET "http://localhost:3001/api/forms?sapTable=MARA"
```

### Filter by Version
```bash
curl -X GET "http://localhost:3001/api/forms?version=1.0.0"
```

### Filter by Date Range
```bash
curl -X GET "http://localhost:3001/api/forms?startDate=2025-01-01&endDate=2025-12-31"
```

### Filter by Field Count
```bash
curl -X GET "http://localhost:3001/api/forms?minFields=5&maxFields=20"
```

### Search with Best Match Sorting
```bash
curl -X GET "http://localhost:3001/api/forms?search=material&sortBy=bestMatch"
```

### Sort by Creation Date
```bash
curl -X GET "http://localhost:3001/api/forms?sortBy=createdAt&sortOrder=desc"
```

### Sort by Name
```bash
curl -X GET "http://localhost:3001/api/forms?sortBy=name&sortOrder=asc"
```

## 3. Get Single Form

### By MongoDB ID
```bash
curl -X GET http://localhost:3001/api/forms/64f8a1b2c3d4e5f6a7b8c9d0
```

### By Custom Form ID
```bash
curl -X GET http://localhost:3001/api/forms/by-form-id/form_1758666738899
```

## 4. Update Form

### Update Basic Information
```bash
curl -X PUT http://localhost:3001/api/forms/64f8a1b2c3d4e5f6a7b8c9d0 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Material Creation Form",
    "description": "Updated description for material creation",
    "tags": ["updated", "material", "form"]
  }'
```

### Update Form Status
```bash
curl -X PATCH http://localhost:3001/api/forms/64f8a1b2c3d4e5f6a7b8c9d0/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "active",
    "updatedBy": "admin_user"
  }'
```

### Update Form Configuration
```bash
curl -X PATCH http://localhost:3001/api/forms/64f8a1b2c3d4e5f6a7b8c9d0/config \
  -H "Content-Type: application/json" \
  -d '{
    "config": {
      "layout": "horizontal",
      "columns": 2,
      "spacing": "large",
      "showLabels": true,
      "showRequiredIndicator": true,
      "submitButtonText": "Submit",
      "cancelButtonText": "Cancel",
      "resetButtonText": "Reset",
      "showResetButton": true,
      "autoSave": true,
      "autoSaveInterval": 45000,
      "validationMode": "onBlur"
    },
    "updatedBy": "admin_user"
  }'
```

### Add Field to Form
```bash
curl -X PATCH http://localhost:3001/api/forms/64f8a1b2c3d4e5f6a7b8c9d0/fields \
  -H "Content-Type: application/json" \
  -d '{
    "field": {
      "id": "material_name",
      "name": "materialName",
      "label": "Material Name",
      "type": "text",
      "placeholder": "Enter material name",
      "required": true,
      "order": 1,
      "validation": {
        "minLength": 3,
        "maxLength": 50
      },
      "helpText": "Enter the material name"
    },
    "updatedBy": "admin_user"
  }'
```

## 5. Get Forms by Data Object

### Get All Forms for Data Object
```bash
curl -X GET http://localhost:3001/api/forms/data-object/material
```

### Include Inactive Forms
```bash
curl -X GET "http://localhost:3001/api/forms/data-object/material?includeInactive=true"
```

## 6. Get Forms by User

### Get All Forms Created by User
```bash
curl -X GET http://localhost:3001/api/forms/user/current_user
```

### Include Inactive Forms
```bash
curl -X GET "http://localhost:3001/api/forms/user/current_user?includeInactive=true"
```

## 7. Get Statistics

### Overview Statistics
```bash
curl -X GET http://localhost:3001/api/forms/stats/overview
```

## 8. Get Metadata

### Get All Data Objects
```bash
curl -X GET http://localhost:3001/api/forms/meta/data-objects
```

### Get All Statuses
```bash
curl -X GET http://localhost:3001/api/forms/meta/statuses
```

### Get All Tags
```bash
curl -X GET http://localhost:3001/api/forms/meta/tags
```

### Get All Field Types
```bash
curl -X GET http://localhost:3001/api/forms/meta/field-types
```

## 9. Delete Form

```bash
curl -X DELETE http://localhost:3001/api/forms/64f8a1b2c3d4e5f6a7b8c9d0
```

## 10. Advanced Search Examples

### Search with Multiple Filters
```bash
curl -X GET "http://localhost:3001/api/forms?status=active&dataObject=material&createdBy=current_user&tags=form&sortBy=createdAt&sortOrder=desc&page=1&limit=10"
```

### Search with Field Count and Date Range
```bash
curl -X GET "http://localhost:3001/api/forms?minFields=5&startDate=2025-01-01&endDate=2025-12-31"
```

### Search with SAP Integration
```bash
curl -X GET "http://localhost:3001/api/forms?sapTable=MARA&status=active"
```

## Expected Response Formats

### Successful Response
```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "id": "form_1758666738899",
    "name": "Material Creation Form",
    "description": "Form for creating new material master data",
    "version": "1.0.0",
    "status": "draft",
    "dataObject": "material",
    "sapTable": "MARA",
    "sapStructure": "BAPI_MATERIAL_SAVE",
    "config": {
      "layout": "vertical",
      "columns": 1,
      "spacing": "medium",
      "showLabels": true,
      "showRequiredIndicator": true,
      "submitButtonText": "Save",
      "cancelButtonText": "Cancel",
      "resetButtonText": "Reset",
      "showResetButton": false,
      "autoSave": false,
      "autoSaveInterval": 30000,
      "validationMode": "onChange"
    },
    "tabs": [...],
    "fields": [...],
    "validation": {
      "rules": [...],
      "customValidators": [...]
    },
    "rules": [...],
    "createdBy": "current_user",
    "updatedBy": "current_user",
    "isActive": true,
    "tags": ["material", "form", "creation"],
    "usageCount": 0,
    "ageInDays": 5,
    "complexityScore": 15,
    "isComplete": false,
    "totalFields": 0,
    "totalTabs": 1,
    "totalSections": 1,
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
      "id": "form_1758666738899",
      "name": "Material Creation Form",
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

### Statistics Response
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalForms": 50,
      "activeForms": 45,
      "activeStatusForms": 40,
      "draftForms": 5,
      "archivedForms": 0,
      "totalUsage": 1250,
      "totalFields": 500,
      "totalTabs": 100,
      "totalSections": 200
    },
    "byDataObject": [
      {
        "_id": "material",
        "count": 15,
        "totalUsage": 500,
        "totalFields": 150
      },
      {
        "_id": "customer",
        "count": 10,
        "totalUsage": 300,
        "totalFields": 100
      }
    ],
    "byStatus": [
      {
        "_id": "active",
        "count": 40
      },
      {
        "_id": "draft",
        "count": 5
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

1. **Start with creating a simple form** using the first example
2. **Test the search functionality** by creating multiple forms with different data objects
3. **Use the statistics endpoint** to verify your data
4. **Test error handling** by sending invalid data
5. **Use the metadata endpoints** to understand available options
6. **Test the best match search** with various search terms
7. **Test field addition** to see how forms grow in complexity

## Common Use Cases

1. **Form Management**: Create and manage different types of forms
2. **Data Object Integration**: Link forms to specific data objects
3. **SAP Integration**: Configure forms for SAP table operations
4. **Field Management**: Add and configure form fields
5. **Validation Setup**: Configure validation rules and custom validators
6. **Business Rules**: Set up conditional logic and business rules
7. **Form Configuration**: Customize form layout and behavior

## Field Types Supported

- `text` - Text input
- `email` - Email input
- `password` - Password input
- `number` - Number input
- `tel` - Telephone input
- `url` - URL input
- `search` - Search input
- `date` - Date input
- `time` - Time input
- `datetime-local` - Date and time input
- `month` - Month input
- `week` - Week input
- `color` - Color picker
- `range` - Range slider
- `file` - File upload
- `checkbox` - Checkbox
- `radio` - Radio button
- `select` - Dropdown select
- `textarea` - Text area
- `hidden` - Hidden field
- `readonly` - Read-only field

## Form Statuses

- `draft` - Form is in draft state
- `active` - Form is active and available
- `inactive` - Form is inactive but not deleted
- `archived` - Form is archived
- `deprecated` - Form is deprecated

## Layout Options

- `vertical` - Vertical layout
- `horizontal` - Horizontal layout
- `grid` - Grid layout

## Spacing Options

- `small` - Small spacing
- `medium` - Medium spacing
- `large` - Large spacing

## Validation Modes

- `onChange` - Validate on field change
- `onBlur` - Validate on field blur
- `onSubmit` - Validate on form submit
