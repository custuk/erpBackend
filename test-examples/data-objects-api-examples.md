# Data Objects API - Test Examples

This document provides comprehensive examples for testing all Data Objects API endpoints.

## Base URL
```
http://localhost:3001
```

## 1. Create a Data Object

### Basic Data Object Creation
```bash
curl -X POST http://localhost:3001/api/data-objects \
  -H "Content-Type: application/json" \
  -d '{
    "id": "data_object_1758665982571",
    "name": "Material Master Data",
    "description": "Central repository for material master data",
    "category": "Material Management",
    "icon": "package",
    "color": "#f59e0b",
    "status": "Active",
    "formId": "MATERIAL_FORM_001",
    "enableValidation": true,
    "enableAuditTrail": true,
    "enableWorkflow": false,
    "enableNotifications": true,
    "enableVersioning": true,
    "enableAccessControl": true,
    "enableDataEncryption": false,
    "enableBackup": true,
    "enableApiAccess": true,
    "enableBulkOperations": true,
    "enableSearch": true,
    "enableExport": true,
    "enableImport": true,
    "retentionPeriod": 365,
    "maxFileSize": 10,
    "allowedFileTypes": ["pdf", "doc", "docx", "xlsx", "csv"],
    "createdBy": "current_user",
    "version": "1.0.0",
    "isActive": true,
    "tags": ["material", "master-data", "inventory"]
  }'
```

### Customer Management Object
```bash
curl -X POST http://localhost:3001/api/data-objects \
  -H "Content-Type: application/json" \
  -d '{
    "id": "data_object_customer_001",
    "name": "Customer Master Data",
    "description": "Customer information and relationship management",
    "category": "Customer Management",
    "icon": "users",
    "color": "#3b82f6",
    "status": "Active",
    "formId": "CUSTOMER_FORM_001",
    "enableValidation": true,
    "enableAuditTrail": true,
    "enableWorkflow": true,
    "enableNotifications": true,
    "enableVersioning": true,
    "enableAccessControl": true,
    "enableDataEncryption": true,
    "enableBackup": true,
    "enableApiAccess": true,
    "enableBulkOperations": true,
    "enableSearch": true,
    "enableExport": true,
    "enableImport": true,
    "retentionPeriod": 2555,
    "maxFileSize": 25,
    "allowedFileTypes": ["pdf", "doc", "docx", "xlsx", "csv", "jpg", "png"],
    "createdBy": "admin_user",
    "version": "1.0.0",
    "isActive": true,
    "tags": ["customer", "crm", "relationship-management"]
  }'
```

### Financial Management Object
```bash
curl -X POST http://localhost:3001/api/data-objects \
  -H "Content-Type: application/json" \
  -d '{
    "id": "data_object_financial_001",
    "name": "Financial Transactions",
    "description": "Financial transaction records and accounting data",
    "category": "Financial Management",
    "icon": "dollar-sign",
    "color": "#10b981",
    "status": "Active",
    "formId": "FINANCIAL_FORM_001",
    "enableValidation": true,
    "enableAuditTrail": true,
    "enableWorkflow": true,
    "enableNotifications": true,
    "enableVersioning": true,
    "enableAccessControl": true,
    "enableDataEncryption": true,
    "enableBackup": true,
    "enableApiAccess": true,
    "enableBulkOperations": false,
    "enableSearch": true,
    "enableExport": true,
    "enableImport": false,
    "retentionPeriod": 2555,
    "maxFileSize": 5,
    "allowedFileTypes": ["pdf", "xlsx", "csv"],
    "createdBy": "finance_admin",
    "version": "1.0.0",
    "isActive": true,
    "tags": ["financial", "accounting", "transactions", "audit"]
  }'
```

## 2. Get All Data Objects

### Basic List
```bash
curl -X GET http://localhost:3001/api/data-objects
```

### With Pagination
```bash
curl -X GET "http://localhost:3001/api/data-objects?page=1&limit=5"
```

### Filter by Status
```bash
curl -X GET "http://localhost:3001/api/data-objects?status=Active"
```

### Filter by Category
```bash
curl -X GET "http://localhost:3001/api/data-objects?category=Material Management"
```

### Filter by Created By
```bash
curl -X GET "http://localhost:3001/api/data-objects?createdBy=current_user"
```

### Filter by Active Status
```bash
curl -X GET "http://localhost:3001/api/data-objects?isActive=true"
```

### Filter by Tags
```bash
curl -X GET "http://localhost:3001/api/data-objects?tags=material"
```

### Filter by Feature Flags
```bash
curl -X GET "http://localhost:3001/api/data-objects?enableValidation=true"
curl -X GET "http://localhost:3001/api/data-objects?enableWorkflow=true"
curl -X GET "http://localhost:3001/api/data-objects?enableApiAccess=true"
```

### Filter by Date Range
```bash
curl -X GET "http://localhost:3001/api/data-objects?startDate=2025-01-01&endDate=2025-12-31"
```

### Filter by Retention Expired
```bash
curl -X GET "http://localhost:3001/api/data-objects?retentionExpired=true"
```

### Search with Best Match Sorting
```bash
curl -X GET "http://localhost:3001/api/data-objects?search=material&sortBy=bestMatch"
```

### Sort by Creation Date
```bash
curl -X GET "http://localhost:3001/api/data-objects?sortBy=createdAt&sortOrder=desc"
```

### Sort by Name
```bash
curl -X GET "http://localhost:3001/api/data-objects?sortBy=name&sortOrder=asc"
```

## 3. Get Single Data Object

### By MongoDB ID
```bash
curl -X GET http://localhost:3001/api/data-objects/64f8a1b2c3d4e5f6a7b8c9d0
```

### By Custom Object ID
```bash
curl -X GET http://localhost:3001/api/data-objects/by-object-id/data_object_1758665982571
```

## 4. Update Data Object

### Update Basic Information
```bash
curl -X PUT http://localhost:3001/api/data-objects/64f8a1b2c3d4e5f6a7b8c9d0 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Material Master Data",
    "description": "Updated description for material master data",
    "color": "#ef4444",
    "tags": ["updated", "material", "master-data"]
  }'
```

### Update Object Status
```bash
curl -X PATCH http://localhost:3001/api/data-objects/64f8a1b2c3d4e5f6a7b8c9d0/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Inactive",
    "lastModifiedBy": "admin_user"
  }'
```

### Update Feature Flags
```bash
curl -X PATCH http://localhost:3001/api/data-objects/64f8a1b2c3d4e5f6a7b8c9d0/features \
  -H "Content-Type: application/json" \
  -d '{
    "features": {
      "enableWorkflow": true,
      "enableDataEncryption": true,
      "enableBulkOperations": false
    },
    "lastModifiedBy": "admin_user"
  }'
```

## 5. Get Data Objects by Category

### Get All Objects in Category
```bash
curl -X GET http://localhost:3001/api/data-objects/category/Material Management
```

### Include Inactive Objects
```bash
curl -X GET "http://localhost:3001/api/data-objects/category/Material Management?includeInactive=true"
```

## 6. Get Data Objects by User

### Get All Objects Created by User
```bash
curl -X GET http://localhost:3001/api/data-objects/user/current_user
```

### Include Inactive Objects
```bash
curl -X GET "http://localhost:3001/api/data-objects/user/current_user?includeInactive=true"
```

## 7. Get Statistics

### Overview Statistics
```bash
curl -X GET http://localhost:3001/api/data-objects/stats/overview
```

## 8. Get Metadata

### Get All Categories
```bash
curl -X GET http://localhost:3001/api/data-objects/meta/categories
```

### Get All Statuses
```bash
curl -X GET http://localhost:3001/api/data-objects/meta/statuses
```

### Get All Tags
```bash
curl -X GET http://localhost:3001/api/data-objects/meta/tags
```

## 9. Get Expired Objects

```bash
curl -X GET http://localhost:3001/api/data-objects/expired/list
```

## 10. Delete Data Object

```bash
curl -X DELETE http://localhost:3001/api/data-objects/64f8a1b2c3d4e5f6a7b8c9d0
```

## 11. Advanced Search Examples

### Search with Multiple Filters
```bash
curl -X GET "http://localhost:3001/api/data-objects?status=Active&category=Material Management&enableValidation=true&tags=material&sortBy=createdAt&sortOrder=desc&page=1&limit=10"
```

### Search with Date Range and Feature Flags
```bash
curl -X GET "http://localhost:3001/api/data-objects?startDate=2025-01-01&enableWorkflow=true&enableApiAccess=true"
```

### Search Overdue Objects
```bash
curl -X GET "http://localhost:3001/api/data-objects?retentionExpired=true&status=Active"
```

## Expected Response Formats

### Successful Response
```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "id": "data_object_1758665982571",
    "name": "Material Master Data",
    "description": "Central repository for material master data",
    "category": "Material Management",
    "icon": "package",
    "color": "#f59e0b",
    "status": "Active",
    "enableValidation": true,
    "enableAuditTrail": true,
    "enableWorkflow": false,
    "enableNotifications": true,
    "enableVersioning": true,
    "enableAccessControl": true,
    "enableDataEncryption": false,
    "enableBackup": true,
    "enableApiAccess": true,
    "enableBulkOperations": true,
    "enableSearch": true,
    "enableExport": true,
    "enableImport": true,
    "retentionPeriod": 365,
    "maxFileSize": 10,
    "allowedFileTypes": ["pdf", "doc", "docx", "xlsx", "csv"],
    "createdBy": "current_user",
    "version": "1.0.0",
    "isActive": true,
    "tags": ["material", "master-data", "inventory"],
    "usageCount": 0,
    "ageInDays": 5,
    "isRetentionExpired": false,
    "enabledFeaturesCount": 10,
    "maxFileSizeMB": 10,
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
      "id": "data_object_1758665982571",
      "name": "Material Master Data",
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
      "totalObjects": 50,
      "activeObjects": 45,
      "activeStatusObjects": 40,
      "draftObjects": 5,
      "archivedObjects": 0,
      "totalUsage": 1250
    },
    "byCategory": [
      {
        "_id": "Material Management",
        "count": 15,
        "totalUsage": 500
      },
      {
        "_id": "Customer Management",
        "count": 10,
        "totalUsage": 300
      }
    ],
    "byFeatures": {
      "enableValidation": 45,
      "enableWorkflow": 20,
      "enableApiAccess": 40,
      "enableBulkOperations": 35,
      "enableSearch": 50,
      "enableExport": 45,
      "enableImport": 30
    },
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

1. **Start with creating a simple data object** using the first example
2. **Test the search functionality** by creating multiple objects with different categories
3. **Use the statistics endpoint** to verify your data
4. **Test error handling** by sending invalid data
5. **Use the metadata endpoints** to understand available options
6. **Test the best match search** with various search terms
7. **Test feature flag updates** to see how they affect the object

## Common Use Cases

1. **Data Management**: Create and manage different types of data objects
2. **Feature Configuration**: Enable/disable features based on requirements
3. **Access Control**: Set up permissions and encryption for sensitive data
4. **Workflow Integration**: Configure workflow-enabled objects
5. **File Management**: Set up file type and size restrictions
6. **Retention Management**: Configure data retention policies
7. **Audit Trail**: Track changes and access to data objects

## Categories Supported

- Material Management
- Sales Management
- Purchase Management
- Inventory Management
- Customer Management
- Supplier Management
- Financial Management
- HR Management
- Project Management
- Quality Management
- Compliance Management
- Document Management
- Workflow Management
- Reporting
- Analytics
- Integration
- Configuration
- System Administration
- Other

## Status Values

- `Active` - Object is active and available
- `Inactive` - Object is inactive but not deleted
- `Draft` - Object is in draft state
- `Archived` - Object is archived
- `Deprecated` - Object is deprecated

## Feature Flags

- `enableValidation` - Enable data validation
- `enableAuditTrail` - Enable audit trail tracking
- `enableWorkflow` - Enable workflow integration
- `enableNotifications` - Enable notifications
- `enableVersioning` - Enable version control
- `enableAccessControl` - Enable access control
- `enableDataEncryption` - Enable data encryption
- `enableBackup` - Enable backup functionality
- `enableApiAccess` - Enable API access
- `enableBulkOperations` - Enable bulk operations
- `enableSearch` - Enable search functionality
- `enableExport` - Enable export functionality
- `enableImport` - Enable import functionality
