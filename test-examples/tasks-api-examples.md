# Tasks API - Test Examples

This document provides comprehensive examples for testing all Tasks API endpoints.

## Base URL
```
http://localhost:3001
```

## 1. Create a Task

### Basic Task Creation
```bash
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "id": "task_1758665248735",
    "name": "Process Order Data",
    "description": "Process incoming order data and validate",
    "dataObject": "ORDER_DATA",
    "taskType": "automatic",
    "communicationSubType": "api_call",
    "assignedTo": "user123",
    "priority": "High",
    "icon": "list",
    "allowedStatuses": ["pending", "in_progress", "completed", "failed"],
    "status": "pending",
    "sla": "2 hours",
    "retryOnFailure": true,
    "sendNotifications": true,
    "requiresApproval": false,
    "enableLogging": true,
    "retryCount": 3,
    "timeout": 30,
    "executionOrder": 1,
    "dependencies": "task_1758665248734",
    "bapiParameters": {
      "functionName": "BAPI_ORDER_CREATE",
      "parameters": {
        "orderHeader": "ORDER_HEADER",
        "orderItems": "ORDER_ITEMS"
      }
    },
    "createdBy": "current_user",
    "version": "1.0.0",
    "isActive": true,
    "tags": ["order-processing", "automation"]
  }'
```

### Manual Task Creation
```bash
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "id": "task_manual_001",
    "name": "Review Customer Application",
    "description": "Manual review of customer application documents",
    "dataObject": "CUSTOMER_APPLICATION",
    "taskType": "manual",
    "assignedTo": "reviewer123",
    "priority": "Medium",
    "icon": "document",
    "allowedStatuses": ["pending", "in_progress", "completed", "rejected"],
    "status": "pending",
    "sla": "24 hours",
    "retryOnFailure": false,
    "sendNotifications": true,
    "requiresApproval": true,
    "enableLogging": true,
    "retryCount": 0,
    "timeout": 60,
    "executionOrder": 2,
    "dependencies": "",
    "bapiParameters": null,
    "createdBy": "admin_user",
    "version": "1.0.0",
    "isActive": true,
    "tags": ["manual-review", "customer-service"],
    "dueDate": "2025-01-20T10:00:00.000Z"
  }'
```

### Scheduled Task Creation
```bash
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "id": "task_scheduled_001",
    "name": "Daily Report Generation",
    "description": "Generate daily sales report automatically",
    "dataObject": "SALES_REPORT",
    "taskType": "scheduled",
    "assignedTo": "system",
    "priority": "Low",
    "icon": "chart",
    "allowedStatuses": ["pending", "in_progress", "completed", "failed"],
    "status": "pending",
    "sla": "1 hour",
    "retryOnFailure": true,
    "sendNotifications": false,
    "requiresApproval": false,
    "enableLogging": true,
    "retryCount": 2,
    "timeout": 15,
    "executionOrder": 1,
    "dependencies": "",
    "bapiParameters": {
      "functionName": "BAPI_REPORT_GENERATE",
      "parameters": {
        "reportType": "DAILY_SALES",
        "dateRange": "YESTERDAY"
      }
    },
    "createdBy": "system",
    "version": "1.0.0",
    "isActive": true,
    "tags": ["scheduled", "reporting", "automation"]
  }'
```

## 2. Get All Tasks

### Basic List
```bash
curl -X GET http://localhost:3001/api/tasks
```

### With Pagination
```bash
curl -X GET "http://localhost:3001/api/tasks?page=1&limit=5"
```

### Filter by Status
```bash
curl -X GET "http://localhost:3001/api/tasks?status=pending"
```

### Filter by Task Type
```bash
curl -X GET "http://localhost:3001/api/tasks?taskType=automatic"
```

### Filter by Priority
```bash
curl -X GET "http://localhost:3001/api/tasks?priority=High"
```

### Filter by Assigned User
```bash
curl -X GET "http://localhost:3001/api/tasks?assignedTo=user123"
```

### Filter by Created By
```bash
curl -X GET "http://localhost:3001/api/tasks?createdBy=current_user"
```

### Filter by Active Status
```bash
curl -X GET "http://localhost:3001/api/tasks?isActive=true"
```

### Filter by Tags
```bash
curl -X GET "http://localhost:3001/api/tasks?tags=automation"
```

### Filter by Overdue Tasks
```bash
curl -X GET "http://localhost:3001/api/tasks?overdue=true"
```

### Search with Best Match Sorting
```bash
curl -X GET "http://localhost:3001/api/tasks?search=order&sortBy=bestMatch"
```

### Sort by Creation Date
```bash
curl -X GET "http://localhost:3001/api/tasks?sortBy=createdAt&sortOrder=desc"
```

### Sort by Priority
```bash
curl -X GET "http://localhost:3001/api/tasks?sortBy=priority&sortOrder=desc"
```

## 3. Get Single Task

### By MongoDB ID
```bash
curl -X GET http://localhost:3001/api/tasks/64f8a1b2c3d4e5f6a7b8c9d0
```

### By Custom Task ID
```bash
curl -X GET http://localhost:3001/api/tasks/by-task-id/task_1758665248735
```

## 4. Update Task

### Update Basic Information
```bash
curl -X PUT http://localhost:3001/api/tasks/64f8a1b2c3d4e5f6a7b8c9d0 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Task Name",
    "description": "Updated description",
    "priority": "Critical",
    "tags": ["updated", "modified"]
  }'
```

### Update Task Status
```bash
curl -X PATCH http://localhost:3001/api/tasks/64f8a1b2c3d4e5f6a7b8c9d0/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress",
    "lastModifiedBy": "user123"
  }'
```

### Assign Task to User
```bash
curl -X PATCH http://localhost:3001/api/tasks/64f8a1b2c3d4e5f6a7b8c9d0/assign \
  -H "Content-Type: application/json" \
  -d '{
    "assignedTo": "new_user456",
    "lastModifiedBy": "admin_user"
  }'
```

## 5. Get Tasks by User

### Get All Tasks for a User
```bash
curl -X GET http://localhost:3001/api/tasks/user/user123
```

### Include Inactive Tasks
```bash
curl -X GET "http://localhost:3001/api/tasks/user/user123?includeInactive=true"
```

## 6. Get Statistics

### Overview Statistics
```bash
curl -X GET http://localhost:3001/api/tasks/stats/overview
```

## 7. Get Metadata

### Get All Task Types
```bash
curl -X GET http://localhost:3001/api/tasks/meta/task-types
```

### Get All Priorities
```bash
curl -X GET http://localhost:3001/api/tasks/meta/priorities
```

### Get All Tags
```bash
curl -X GET http://localhost:3001/api/tasks/meta/tags
```

## 8. Delete Task

```bash
curl -X DELETE http://localhost:3001/api/tasks/64f8a1b2c3d4e5f6a7b8c9d0
```

## 9. Advanced Search Examples

### Search with Multiple Filters
```bash
curl -X GET "http://localhost:3001/api/tasks?status=pending&taskType=automatic&priority=High&assignedTo=user123&tags=automation&sortBy=createdAt&sortOrder=desc&page=1&limit=10"
```

### Search with Date Range
```bash
curl -X GET "http://localhost:3001/api/tasks?startDate=2025-01-01&endDate=2025-12-31"
```

### Search Overdue Tasks
```bash
curl -X GET "http://localhost:3001/api/tasks?overdue=true&status=pending"
```

## Expected Response Formats

### Successful Response
```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "id": "task_1758665248735",
    "name": "Process Order Data",
    "description": "Process incoming order data and validate",
    "dataObject": "ORDER_DATA",
    "taskType": "automatic",
    "priority": "High",
    "status": "pending",
    "assignedTo": "user123",
    "createdBy": "current_user",
    "isActive": true,
    "duration": null,
    "ageInDays": 5,
    "isOverdue": false,
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
      "id": "task_1758665248735",
      "name": "Process Order Data",
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

## Testing Tips

1. **Start with creating a simple task** using the first example
2. **Test the search functionality** by creating multiple tasks with different types and priorities
3. **Use the statistics endpoint** to verify your data
4. **Test error handling** by sending invalid data
5. **Use the metadata endpoints** to understand available options
6. **Test the best match search** with various search terms

## Common Use Cases

1. **Task Management**: Create, assign, and track tasks
2. **Workflow Automation**: Set up automated task processing
3. **SAP Integration**: Use BAPI parameters for SAP system integration
4. **User Assignment**: Assign tasks to specific users
5. **Priority Management**: Handle tasks based on priority levels
6. **SLA Monitoring**: Track task completion against SLA requirements

## Task Types Supported

- `manual` - Manual tasks requiring human intervention
- `automatic` - Fully automated tasks
- `semi-automatic` - Partially automated tasks
- `scheduled` - Time-based scheduled tasks
- `event-driven` - Tasks triggered by events
- `api-call` - Tasks that make API calls
- `data-processing` - Data processing tasks
- `notification` - Notification tasks
- `approval` - Approval workflow tasks
- `validation` - Data validation tasks
- `integration` - System integration tasks
- `workflow` - Workflow management tasks

## Priority Levels

- `Low` - Low priority tasks
- `Medium` - Medium priority tasks (default)
- `High` - High priority tasks
- `Critical` - Critical priority tasks
- `Urgent` - Urgent priority tasks

## Task Statuses

- `draft` - Task is in draft state
- `pending` - Task is waiting to be started
- `in_progress` - Task is currently being executed
- `completed` - Task has been completed successfully
- `cancelled` - Task has been cancelled
- `failed` - Task execution failed
- `on_hold` - Task is temporarily on hold
