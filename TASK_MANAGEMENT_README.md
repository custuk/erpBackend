# Dynamic Task Management System

This implementation provides a complete dynamic task loading system for the ERP Task Management interface, replacing hardcoded tasks with real-time data from the API.

## 🚀 Quick Start

### 1. Seed the Database
First, populate your database with sample tasks:

```bash
node seed-tasks.js
```

This will create 10 sample tasks including both business process tasks and transportation/logistics tasks.

### 2. Start the Backend Server
```bash
npm start
# or
node server.js
```

### 3. Test the API
```bash
node test-task-api.js
```

### 4. Open the Demo Interface
Open `public/task-management.html` in your browser to see the dynamic task loading in action.

## 📁 File Structure

```
├── public/
│   ├── js/
│   │   └── task-management.js          # Main JavaScript class for dynamic loading
│   └── task-management.html            # Demo HTML interface
├── seed-tasks.js                      # Database seeder with sample tasks
├── test-task-api.js                   # Comprehensive API testing client
└── TASK_MANAGEMENT_README.md          # This documentation
```

## 🔧 API Endpoints

### Get All Tasks
```http
GET /api/tasks?page=1&limit=10&status=pending&taskType=manual&priority=High&search=keyword
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `status` - Filter by status (pending, in_progress, completed, failed, cancelled)
- `taskType` - Filter by task type (manual, system, communication, quality, decision)
- `priority` - Filter by priority (Critical, High, Medium, Low)
- `assignedTo` - Filter by assigned user
- `search` - Search in name, description, or data object
- `sortBy` - Sort field (createdAt, name, priority, status)
- `sortOrder` - Sort direction (asc, desc)

### Get Task Statistics
```http
GET /api/tasks/stats/overview
```

### Get Filter Options
```http
GET /api/tasks/meta/task-types
GET /api/tasks/meta/priorities
GET /api/tasks/meta/tags
```

## 🎯 Features

### Dynamic Loading
- ✅ Real-time task loading from API
- ✅ Pagination support
- ✅ Search functionality
- ✅ Multiple filter options
- ✅ Sorting capabilities
- ✅ Loading states and error handling

### Task Management
- ✅ View task details
- ✅ Edit tasks
- ✅ Update task status
- ✅ Assign tasks
- ✅ Create new tasks
- ✅ Delete tasks

### UI Components
- ✅ Responsive table layout
- ✅ Status badges with color coding
- ✅ Priority indicators
- ✅ Action buttons (View, Edit, Add)
- ✅ Loading spinners
- ✅ Error modals
- ✅ Pagination controls

## 📊 Sample Data

The seeder creates tasks across different categories:

### Business Process Tasks
- Data Entry tasks
- Approval workflows
- SAP API calls
- Email notifications
- Data validation
- Conditional logic

### Transportation & Logistics Tasks
- Route planning
- Load planning
- Carrier selection
- Shipment creation
- Pickup/delivery scheduling
- Customs documentation
- Tracking and monitoring

## 🔌 Integration Guide

### 1. Include the JavaScript Class
```html
<script src="js/task-management.js"></script>
```

### 2. Initialize the Task Manager
```javascript
// The class auto-initializes on DOMContentLoaded
// Or manually initialize:
const taskManager = new TaskManagement();
```

### 3. Customize Configuration
```javascript
const taskManager = new TaskManagement();
taskManager.apiBaseUrl = 'https://your-api.com/api/tasks';
taskManager.pageSize = 500;
```

### 4. Handle Events
```javascript
// Listen for task updates
taskManager.on('taskUpdated', (task) => {
    console.log('Task updated:', task);
});

// Listen for errors
taskManager.on('error', (error) => {
    console.error('Task manager error:', error);
});
```

## 🎨 Customization

### Styling
The system uses Tailwind CSS classes. You can customize the appearance by modifying the CSS classes in the JavaScript file.

### API Integration
To integrate with a different API, modify the `apiBaseUrl` and update the request handling in the `loadTasks()` method.

### Task Display
Customize how tasks are displayed by modifying the `createTaskRow()` method in the TaskManagement class.

## 🧪 Testing

### Run API Tests
```bash
node test-task-api.js
```

### Test Specific Endpoints
```bash
# Get all tasks
curl "http://localhost:3001/api/tasks"

# Search tasks
curl "http://localhost:3001/api/tasks?search=data"

# Filter by status
curl "http://localhost:3001/api/tasks?status=pending"

# Get statistics
curl "http://localhost:3001/api/tasks/stats/overview"
```

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Ensure the backend server is running on port 3001
   - Check CORS configuration
   - Verify the API endpoint is accessible

2. **No Tasks Displayed**
   - Run the seeder: `node seed-tasks.js`
   - Check browser console for errors
   - Verify API response format

3. **Filter Options Not Loading**
   - Check network requests in browser dev tools
   - Ensure the meta endpoints are working
   - Verify the API is returning data in the expected format

### Debug Mode
Enable debug logging by opening browser console. The TaskManagement class logs all API calls and responses.

## 📈 Performance Considerations

- **Pagination**: Default page size is 10 tasks. Increase for better performance with large datasets.
- **Caching**: Consider implementing client-side caching for frequently accessed data.
- **Debouncing**: Search input is debounced to prevent excessive API calls.
- **Error Handling**: Comprehensive error handling prevents UI crashes.

## 🔒 Security Notes

- API endpoints should be protected with authentication
- Input validation should be implemented on both client and server
- CORS should be properly configured for production
- Sensitive data should not be logged in the console

## 🚀 Production Deployment

1. **Update API URLs**: Change `http://localhost:3001` to your production API URL
2. **Enable Authentication**: Implement proper authentication for API calls
3. **Add Error Monitoring**: Integrate with error tracking services
4. **Optimize Performance**: Implement caching and optimize database queries
5. **Security Headers**: Add proper security headers and CORS configuration

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "data": [
    {
      "_id": "task_id",
      "name": "Task Name",
      "description": "Task Description",
      "status": "pending",
      "priority": "High",
      "taskType": "manual",
      "assignedTo": "John Doe",
      "sla": "2 days",
      "createdAt": "2024-01-20T10:00:00.000Z",
      "tags": ["tag1", "tag2"]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of the ERP Backend system and follows the same licensing terms.
