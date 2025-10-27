# Task Templates API - Test Examples

This document provides comprehensive examples for testing all Task Templates API endpoints.

## Base URL
```
http://localhost:3001
```

## 1. Create a Task Template

### Basic Template Creation
```bash
curl -X POST http://localhost:3001/api/task-templates \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Template",
    "description": "Test task template",
    "templateType": "Task and Data Object Template",
    "id": "TEMPLATE_1757019500905",
    "tasks": [
      {
        "id": "DT5732",
        "type": "transfer",
        "x": 193.45306396484375,
        "y": 205.00521087646484,
        "name": "Data Transfer Task",
        "description": "Transfer data between systems",
        "attributes": {
          "mandatory": true,
          "bypassable": false,
          "parallelExecution": false
        }
      },
      {
        "id": "NT8395",
        "type": "notification",
        "x": 496.45306396484375,
        "y": 225.00521087646484,
        "name": "Notification Task",
        "description": "Send notification to stakeholders",
        "attributes": {
          "mandatory": true,
          "bypassable": false,
          "parallelExecution": false
        }
      }
    ],
    "connectors": [
      {
        "id": "conn_1757019434017",
        "from": "DT5732",
        "to": "NT8395",
        "dependencyType": "sequential",
        "attributes": {
          "mandatory": true,
          "parallelExecution": false
        }
      }
    ]
  }'
```

### Complex Workflow Template
```bash
curl -X POST http://localhost:3001/api/task-templates \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Order Processing Workflow",
    "description": "Complete order processing workflow template",
    "templateType": "Workflow Template",
    "id": "TEMPLATE_ORDER_001",
    "tasks": [
      {
        "id": "ORDER_VALIDATION",
        "type": "validation",
        "x": 100,
        "y": 100,
        "name": "Order Validation",
        "description": "Validate incoming order data",
        "attributes": {
          "mandatory": true,
          "bypassable": false,
          "parallelExecution": false
        }
      },
      {
        "id": "INVENTORY_CHECK",
        "type": "processing",
        "x": 300,
        "y": 100,
        "name": "Inventory Check",
        "description": "Check product availability",
        "attributes": {
          "mandatory": true,
          "bypassable": false,
          "parallelExecution": true
        }
      },
      {
        "id": "PAYMENT_PROCESSING",
        "type": "processing",
        "x": 500,
        "y": 100,
        "name": "Payment Processing",
        "description": "Process payment for order",
        "attributes": {
          "mandatory": true,
          "bypassable": false,
          "parallelExecution": true
        }
      },
      {
        "id": "APPROVAL_TASK",
        "type": "approval",
        "x": 300,
        "y": 300,
        "name": "Manager Approval",
        "description": "Manager approval for high-value orders",
        "attributes": {
          "mandatory": false,
          "bypassable": true,
          "parallelExecution": false
        }
      },
      {
        "id": "ORDER_CONFIRMATION",
        "type": "notification",
        "x": 700,
        "y": 200,
        "name": "Order Confirmation",
        "description": "Send order confirmation to customer",
        "attributes": {
          "mandatory": true,
          "bypassable": false,
          "parallelExecution": false
        }
      }
    ],
    "connectors": [
      {
        "id": "conn_validation_inventory",
        "from": "ORDER_VALIDATION",
        "to": "INVENTORY_CHECK",
        "dependencyType": "sequential",
        "attributes": {
          "mandatory": true,
          "parallelExecution": false
        }
      },
      {
        "id": "conn_validation_payment",
        "from": "ORDER_VALIDATION",
        "to": "PAYMENT_PROCESSING",
        "dependencyType": "parallel",
        "attributes": {
          "mandatory": true,
          "parallelExecution": true
        }
      },
      {
        "id": "conn_inventory_approval",
        "from": "INVENTORY_CHECK",
        "to": "APPROVAL_TASK",
        "dependencyType": "conditional",
        "attributes": {
          "mandatory": false,
          "parallelExecution": false
        }
      },
      {
        "id": "conn_payment_approval",
        "from": "PAYMENT_PROCESSING",
        "to": "APPROVAL_TASK",
        "dependencyType": "conditional",
        "attributes": {
          "mandatory": false,
          "parallelExecution": false
        }
      },
      {
        "id": "conn_approval_confirmation",
        "from": "APPROVAL_TASK",
        "to": "ORDER_CONFIRMATION",
        "dependencyType": "sequential",
        "attributes": {
          "mandatory": true,
          "parallelExecution": false
        }
      }
    ],
    "tags": ["order-processing", "workflow", "e-commerce"],
    "status": "active"
  }'
```

## 2. Get All Task Templates

### Basic List
```bash
curl -X GET http://localhost:3001/api/task-templates
```

### With Pagination
```bash
curl -X GET "http://localhost:3001/api/task-templates?page=1&limit=5"
```

### Filter by Status
```bash
curl -X GET "http://localhost:3001/api/task-templates?status=active"
```

### Filter by Template Type
```bash
curl -X GET "http://localhost:3001/api/task-templates?templateType=Workflow Template"
```

### Filter by Task Type
```bash
curl -X GET "http://localhost:3001/api/task-templates?taskType=transfer"
```

### Search by Name or Description
```bash
curl -X GET "http://localhost:3001/api/task-templates?search=workflow"
```

### Sort by Creation Date
```bash
curl -X GET "http://localhost:3001/api/task-templates?sortBy=createdAt&sortOrder=desc"
```

## 3. Get Single Task Template

### By MongoDB ID
```bash
curl -X GET http://localhost:3001/api/task-templates/64f8a1b2c3d4e5f6a7b8c9d0
```

### By Custom Template ID
```bash
curl -X GET http://localhost:3001/api/task-templates/by-template-id/TEMPLATE_1757019500905
```

## 4. Update Task Template

### Update Basic Information
```bash
curl -X PUT http://localhost:3001/api/task-templates/64f8a1b2c3d4e5f6a7b8c9d0 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Template Name",
    "description": "Updated description",
    "tags": ["updated", "modified"]
  }'
```

### Update Status
```bash
curl -X PATCH http://localhost:3001/api/task-templates/64f8a1b2c3d4e5f6a7b8c9d0/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "active"
  }'
```

## 5. Search Templates by Task

### Get All Templates Containing a Specific Task
```bash
curl -X GET http://localhost:3001/api/task-templates/search/by-task/DT5732
```

### Include Inactive Templates
```bash
curl -X GET "http://localhost:3001/api/task-templates/search/by-task/DT5732?includeInactive=true"
```

## 6. Get Statistics

### Overview Statistics
```bash
curl -X GET http://localhost:3001/api/task-templates/stats/overview
```

## 7. Get Metadata

### Get All Template Types
```bash
curl -X GET http://localhost:3001/api/task-templates/meta/template-types
```

### Get All Task Types
```bash
curl -X GET http://localhost:3001/api/task-templates/meta/task-types
```

### Get All Tags
```bash
curl -X GET http://localhost:3001/api/task-templates/meta/tags
```

## 8. Delete Task Template

```bash
curl -X DELETE http://localhost:3001/api/task-templates/64f8a1b2c3d4e5f6a7b8c9d0
```

## 9. Advanced Search Examples

### Search with Multiple Filters
```bash
curl -X GET "http://localhost:3001/api/task-templates?status=active&templateType=Workflow Template&taskType=approval&tags=workflow&sortBy=createdAt&sortOrder=desc&page=1&limit=10"
```

### Search with Date Range
```bash
curl -X GET "http://localhost:3001/api/task-templates?startDate=2025-01-01&endDate=2025-12-31"
```

## Expected Response Formats

### Successful Response
```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "Test Template",
    "description": "Test task template",
    "templateType": "Task and Data Object Template",
    "id": "TEMPLATE_1757019500905",
    "tasks": [...],
    "connectors": [...],
    "status": "draft",
    "totalTasks": 2,
    "totalConnectors": 1,
    "complexity": "simple",
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

## Testing Tips

1. **Start with creating a simple template** using the first example
2. **Test the search functionality** by creating multiple templates with different task types
3. **Use the statistics endpoint** to verify your data
4. **Test error handling** by sending invalid data
5. **Use the metadata endpoints** to understand available options

## Common Use Cases

1. **Workflow Design**: Create templates for different business processes
2. **Task Management**: Define reusable task patterns
3. **Process Automation**: Build templates for automated workflows
4. **Approval Processes**: Create approval workflow templates
5. **Integration Templates**: Define data transfer and integration patterns

## Task Types Supported

- `transfer` - Data transfer tasks
- `notification` - Notification tasks
- `approval` - Approval tasks
- `validation` - Validation tasks
- `processing` - Processing tasks
- `review` - Review tasks
- `execution` - Execution tasks
- `monitoring` - Monitoring tasks
- `reporting` - Reporting tasks
- `integration` - Integration tasks
- `transformation` - Data transformation tasks
- `verification` - Verification tasks
- `confirmation` - Confirmation tasks
- `scheduling` - Scheduling tasks
- `routing` - Routing tasks

## Dependency Types Supported

- `sequential` - Tasks must be executed in sequence
- `parallel` - Tasks can be executed in parallel
- `conditional` - Tasks are executed based on conditions
- `optional` - Tasks are optional and can be skipped


