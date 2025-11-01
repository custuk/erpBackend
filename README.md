# ERP Backend API Server

A comprehensive Node.js-based ERP (Enterprise Resource Planning) backend API server built with Express.js and MongoDB.

## Features

- **User Management**: Complete CRUD operations for users with role-based access
- **Product Management**: Inventory management with stock tracking and categorization
- **Order Management**: Full order lifecycle with status tracking and payment processing
- **RESTful API**: Clean, consistent API endpoints with proper HTTP status codes
- **Security**: Helmet.js for security headers, CORS configuration, and rate limiting
- **Database**: MongoDB with Mongoose ODM for data modeling and validation
- **Error Handling**: Comprehensive error handling with proper HTTP status codes
- **Validation**: Input validation and sanitization
- **Logging**: Morgan logging for development and production monitoring

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **ODM**: Mongoose
- **Security**: Helmet.js, CORS
- **Rate Limiting**: express-rate-limit
- **Logging**: Morgan
- **Environment**: dotenv

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB instance
- npm or yarn package manager

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd erpBackend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   - Rename `config.env` to `.env` (or create a new `.env` file)
   - Update the MongoDB connection string in your `.env` file:

   ```env
   NODE_ENV=development
   PORT=3001
   MONGO_URI_DEV=mongodb+srv://atul:RE7ovd9AETBXmGbF@custukdev.8bbwpwd.mongodb.net/test?retryWrites=true&w=majority
   MONGO_URI=MONGO_URI_DEV
   ```

4. **Start the server**

   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

The server will start on `http://localhost:3001`

## API Endpoints

### Base URL

```
http://localhost:3001
```

### Health Check

- `GET /health` - Server health status

### Users API

- `GET /api/users` - Get all users (with pagination and filtering)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Deactivate user (soft delete)
- `GET /api/users/stats/overview` - User statistics

### Products API

- `GET /api/products` - Get all products (with pagination, filtering, and search)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Deactivate product (soft delete)
- `PATCH /api/products/:id/inventory` - Update product inventory
- `GET /api/products/stats/overview` - Product statistics
- `GET /api/products/categories/list` - Get all categories
- `GET /api/products/brands/list` - Get all brands

### Orders API

- `GET /api/orders` - Get all orders (with pagination and filtering)
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Cancel order (soft delete)
- `PATCH /api/orders/:id/status` - Update order status
- `PATCH /api/orders/:id/payment` - Update payment status
- `GET /api/orders/stats/overview` - Order statistics

### Material Requests API (SAP Material Setup)

- `GET /api/material-requests` - Get all material requests (with pagination and filtering)
- `GET /api/material-requests/:id` - Get material request by ID
- `POST /api/material-requests` - Create new material request
- `PUT /api/material-requests/:id` - Update material request
- `DELETE /api/material-requests/:id` - Cancel material request (soft delete)
- `PATCH /api/material-requests/:id/status` - Update material request status
- `GET /api/material-requests/stats/overview` - Material request statistics
- `GET /api/material-requests/by-request-id/:requestId` - Get material request by request ID

### Supply Chain Routes API

- `GET /api/supply-chain-routes` - Get all supply chain routes (with pagination and filtering)
- `GET /api/supply-chain-routes/:id` - Get supply chain route by ID
- `GET /api/supply-chain-routes/by-route-id/:routeId` - Get supply chain route by custom route ID
- `POST /api/supply-chain-routes` - Create new supply chain route
- `PUT /api/supply-chain-routes/:id` - Update supply chain route
- `DELETE /api/supply-chain-routes/:id` - Delete supply chain route
- `PATCH /api/supply-chain-routes/:id/status` - Update route status
- `GET /api/supply-chain-routes/search/between-locations` - Search routes between two locations
- `GET /api/supply-chain-routes/search/by-location/:locationId` - Get routes containing specific location
- `GET /api/supply-chain-routes/stats/overview` - Route statistics
- `GET /api/supply-chain-routes/meta/location-types` - Get all location types
- `GET /api/supply-chain-routes/meta/route-types` - Get all route types
- `GET /api/supply-chain-routes/meta/tags` - Get all tags

### Task Templates API

- `GET /api/task-templates` - Get all task templates (with pagination and filtering)
- `GET /api/task-templates/:id` - Get task template by ID
- `GET /api/task-templates/by-template-id/:templateId` - Get task template by custom template ID
- `POST /api/task-templates` - Create new task template
- `PUT /api/task-templates/:id` - Update task template
- `DELETE /api/task-templates/:id` - Delete task template
- `PATCH /api/task-templates/:id/status` - Update template status
- `GET /api/task-templates/search/by-task/:taskId` - Get templates containing specific task
- `GET /api/task-templates/stats/overview` - Template statistics
- `GET /api/task-templates/meta/template-types` - Get all template types
- `GET /api/task-templates/meta/task-types` - Get all task types
- `GET /api/task-templates/meta/tags` - Get all tags

### Tasks API

- `GET /api/tasks` - Get all tasks (with pagination, filtering, and best match search)
- `GET /api/tasks/:id` - Get task by ID
- `GET /api/tasks/by-task-id/:taskId` - Get task by custom task ID
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/status` - Update task status
- `PATCH /api/tasks/:id/assign` - Assign task to user
- `GET /api/tasks/user/:userId` - Get tasks by user (assigned or created)
- `GET /api/tasks/stats/overview` - Task statistics
- `GET /api/tasks/meta/task-types` - Get all task types
- `GET /api/tasks/meta/priorities` - Get all priorities
- `GET /api/tasks/meta/tags` - Get all tags

### Data Objects API

- `GET /api/data-objects` - Get all data objects (with pagination, filtering, and best match search)
- `GET /api/data-objects/:id` - Get data object by ID
- `GET /api/data-objects/by-object-id/:objectId` - Get data object by custom object ID
- `POST /api/data-objects` - Create new data object
- `PUT /api/data-objects/:id` - Update data object
- `DELETE /api/data-objects/:id` - Delete data object
- `PATCH /api/data-objects/:id/status` - Update object status
- `PATCH /api/data-objects/:id/features` - Update feature flags
- `GET /api/data-objects/category/:category` - Get objects by category
- `GET /api/data-objects/user/:userId` - Get objects by user (created by)
- `GET /api/data-objects/stats/overview` - Object statistics
- `GET /api/data-objects/meta/categories` - Get all categories
- `GET /api/data-objects/meta/statuses` - Get all statuses
- `GET /api/data-objects/meta/tags` - Get all tags
- `GET /api/data-objects/expired/list` - Get expired objects

### Forms API

- `GET /api/forms` - Get all forms (with pagination, filtering, and best match search)
- `GET /api/forms/:id` - Get form by ID
- `GET /api/forms/by-form-id/:formId` - Get form by custom form ID
- `POST /api/forms` - Create new form
- `PUT /api/forms/:id` - Update form
- `DELETE /api/forms/:id` - Delete form
- `PATCH /api/forms/:id/status` - Update form status
- `PATCH /api/forms/:id/config` - Update form configuration
- `PATCH /api/forms/:id/fields` - Add field to form
- `GET /api/forms/data-object/:dataObject` - Get forms by data object
- `GET /api/forms/user/:userId` - Get forms by user (created by)
- `GET /api/forms/stats/overview` - Form statistics
- `GET /api/forms/meta/data-objects` - Get all data objects
- `GET /api/forms/meta/statuses` - Get all statuses
- `GET /api/forms/meta/tags` - Get all tags
- `GET /api/forms/meta/field-types` - Get all field types

### Business Rules API

- `GET /api/business-rules` - Get all business rules (with pagination, filtering, and best match search)
- `GET /api/business-rules/:id` - Get business rule by ID
- `GET /api/business-rules/by-rule-id/:ruleId` - Get business rule by custom rule ID
- `POST /api/business-rules` - Create new business rule
- `PUT /api/business-rules/:id` - Update business rule
- `DELETE /api/business-rules/:id` - Delete business rule
- `PATCH /api/business-rules/:id/status` - Update rule status
- `PATCH /api/business-rules/:id/enabled` - Update enabled status
- `PATCH /api/business-rules/:id/priority` - Update rule priority
- `POST /api/business-rules/:id/execute` - Execute business rule
- `GET /api/business-rules/data-object/:dataObject` - Get rules by data object
- `GET /api/business-rules/type/:type` - Get rules by type
- `GET /api/business-rules/user/:userId` - Get rules by user (created by)
- `GET /api/business-rules/stats/overview` - Rule statistics
- `GET /api/business-rules/meta/types` - Get all rule types
- `GET /api/business-rules/meta/data-objects` - Get all data objects
- `GET /api/business-rules/meta/statuses` - Get all statuses
- `GET /api/business-rules/meta/tags` - Get all tags
- `GET /api/business-rules/meta/categories` - Get all categories

## API Usage Examples

### Create a User

```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "employee",
    "department": "Sales"
  }'
```

### Create a Product

```bash
curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "sku": "LAP001",
    "description": "High-performance laptop",
    "category": "Electronics",
    "brand": "TechCorp",
    "price": {
      "cost": 800,
      "selling": 1200,
      "currency": "USD"
    },
    "inventory": {
      "quantity": 50,
      "minStock": 10
    }
  }'
```

### Create an Order

```bash
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer": "USER_ID_HERE",
    "items": [
      {
        "product": "PRODUCT_ID_HERE",
        "quantity": 2
      }
    ],
    "payment": {
      "method": "credit_card"
    },
    "shipping": {
      "method": "standard",
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "USA"
      }
    }
  }'
```

### Create a Material Request (SAP Material Setup)

```bash
curl -X POST http://localhost:3000/api/material-requests \
  -H "Content-Type: application/json" \
  -d '{
    "requestId": "REQ-MFIM9NR3-RCP7X",
    "requestDescription": "New material setup for production line",
    "businessJustification": "Required for new product launch",
    "requesterId": "USER001",
    "setupType": "SingleLocation",
    "location": "GB01",
    "requestItems": [
      {
        "materialId": "MAT001",
        "description": "High-quality steel plate",
        "uom": "PCS",
        "materialType": "Raw Material",
        "materialGroup": "Metals",
        "action": "Create"
      }
    ]
  }'
```

### Create a Supply Chain Route

```bash
curl -X POST http://localhost:3000/api/supply-chain-routes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Route",
    "description": "Test supply chain route",
    "routeType": "Supply Chain Route",
    "id": "ROUTE_1756929652812",
    "locations": [
      {
        "id": "SP01",
        "type": "supplier",
        "x": 150,
        "y": 200,
        "name": "Main Supplier",
        "description": "Primary raw material supplier",
        "attributes": {}
      },
      {
        "id": "CU01",
        "type": "customer",
        "x": 400,
        "y": 200,
        "name": "End Customer",
        "description": "Final product customer",
        "attributes": {}
      }
    ],
    "connectors": [
      {
        "id": "conn_1756929354146",
        "from": "SP01",
        "to": "CU01",
        "parentId": "SP01",
        "childId": "CU01",
        "transportMode": "road",
        "distance": 100,
        "duration": 2,
        "cost": 50,
        "attributes": {}
      }
    ],
    "hierarchicalStructure": {
      "routeName": "Test Route",
      "routeDescription": "Test supply chain route",
      "rootNodes": [],
      "allLocations": {},
      "allConnections": [],
      "generatedAt": "2025-09-03T20:00:52.812Z"
    }
  }'
```

### Create a Task Template

```bash
curl -X POST http://localhost:3000/api/task-templates \
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

### Create a Task

```bash
curl -X POST http://localhost:3000/api/tasks \
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

### Create a Data Object

```bash
curl -X POST http://localhost:3000/api/data-objects \
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

### Create a Form

```bash
curl -X POST http://localhost:3000/api/forms \
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

### Create a Business Rule

```bash
curl -X POST http://localhost:3000/api/business-rules \
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

## Query Parameters

### Pagination

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

### Filtering

- `search`: Search term for text fields
- `category`: Filter by product category
- `brand`: Filter by product brand
- `status`: Filter by order status
- `role`: Filter by user role
- `isActive`: Filter by active status

### Sorting

- `sortBy`: Field to sort by
- `sortOrder`: Sort order (`asc` or `desc`)

## Database Models

### User Model

- Basic info: username, email, password, firstName, lastName
- Role-based access: admin, manager, employee, customer
- Contact info: phone, address
- Work info: department, hireDate
- Status: isActive

### Product Model

- Product details: name, SKU, description, category, brand
- Pricing: cost price, selling price, currency
- Inventory: quantity, min/max stock, location
- Dimensions: length, width, height, weight
- Images and specifications

### Order Model

- Order details: order number, customer, items
- Status tracking: pending, confirmed, processing, shipped, delivered, cancelled
- Financial: subtotal, tax, shipping, total amount
- Payment: method, status, transaction ID
- Shipping: method, address, tracking number

### Material Request Model (materialRequest)

- Request details: request ID, description, business justification, requester
- Setup configuration: setup type (Single Location/Supply Chain Route), locations
- Material items: array of materials with ID, description, UOM, type, group, action
- Status tracking: draft, submitted, approved, rejected, in_progress, completed
- Approval workflow: approver, approval date, rejection reason

### Supply Chain Route Model (supplyChainRoute)

- Route details: name, description, route type, custom ID, version
- Locations: array of locations with coordinates, type, attributes
- Connectors: connections between locations with transport details
- Hierarchical structure: complete route hierarchy with parent-child relationships
- Status tracking: draft, active, inactive, archived
- Metadata: tags, creation/modification tracking

### Task Template Model (taskTemplate)

- Template details: name, description, template type, custom ID, version
- Tasks: array of tasks with coordinates, type, attributes
- Connectors: connections between tasks with dependency types
- Task attributes: mandatory, bypassable, parallel execution settings
- Status tracking: draft, active, inactive, archived
- Metadata: tags, creation/modification tracking

### Task Model (tasks)

- Task details: name, description, data object, custom ID, version
- Task configuration: type, priority, status, SLA, timeout settings
- Execution settings: retry on failure, notifications, approval requirements
- Assignment: assigned user, created by, execution order, dependencies
- BAPI parameters: flexible schema for SAP BAPI calls
- Status tracking: draft, pending, in_progress, completed, cancelled, failed
- Metadata: tags, due dates, completion tracking

### Data Object Model (objects)

- Object details: name, description, category, custom ID, version
- Configuration: feature flags, validation, workflow, notifications
- File settings: allowed types, max size, retention period
- Access control: permissions, encryption, backup settings
- Status tracking: Active, Inactive, Draft, Archived, Deprecated
- Metadata: tags, usage tracking, creation/modification tracking

### Form Model (forms)

- Form details: name, description, version, custom ID, status
- Data object integration: SAP table, structure, data object mapping
- Configuration: layout, columns, spacing, button text, validation mode
- Structure: tabs, sections, fields with comprehensive field types
- Validation: rules, custom validators, business rules
- Status tracking: draft, active, inactive, archived, deprecated
- Metadata: tags, usage tracking, complexity scoring

### Business Rule Model (business-rules)

- Rule details: name, description, type, custom ID, status
- Data object integration: specific data object targeting
- Conditions: field-based conditions with operators and logical operators
- Actions: executable actions with parameters and results
- Decision tables: tabular rule representation
- Expressions: custom expression evaluation
- Execution tracking: success/failure rates, execution counts
- Status tracking: draft, active, inactive, archived, deprecated
- Metadata: tags, usage tracking, complexity scoring, effectiveness metrics

## Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing configuration
- **Rate Limiting**: API rate limiting (100 requests per 15 minutes)
- **Input Validation**: Mongoose schema validation
- **Error Handling**: Comprehensive error handling without exposing sensitive information

## Development

### Project Structure

```
erpBackend/
├── config/
│   └── database.js
├── models/
│   ├── User.js
│   ├── Product.js
│   ├── Order.js
│   ├── MaterialRequest.js
│   ├── SupplyChainRoute.js
│   ├── TaskTemplate.js
│   ├── Task.js
│   ├── DataObject.js
│   ├── Form.js
│   └── BusinessRule.js
├── routes/
│   ├── users.js
│   ├── products.js
│   ├── orders.js
│   ├── materialRequests.js
│   ├── supplyChainRoutes.js
│   ├── taskTemplates.js
│   ├── tasks.js
│   ├── dataObjects.js
│   ├── forms.js
│   └── businessRules.js
├── utils/
│   └── requestIdGenerator.js
├── server.js
├── package.json
├── config.env
└── README.md
```

### Available Scripts

- `npm start`: Start the production server
- `npm run dev`: Start the development server with nodemon
- `npm test`: Run tests (placeholder)

## Environment Variables

| Variable        | Description                           | Default     |
| --------------- | ------------------------------------- | ----------- |
| `NODE_ENV`      | Environment (development/production)  | development |
| `PORT`          | Server port                           | 3001        |
| `MONGO_URI_DEV` | MongoDB development connection string | -           |
| `MONGO_URI`     | MongoDB connection string             | -           |

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (development only)"
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please open an issue in the repository.
