const axios = require('axios');

// Test function to call the Tasks API
async function testTasksAPI() {
  try {
    console.log('🚀 Testing Tasks API...\n');
    
    // First, let's create some sample data
    console.log('📝 Creating sample tasks...');
    
    const sampleTasks = [
      {
        id: "task_1758665248735",
        name: "Process Order Data",
        description: "Process incoming order data and validate",
        dataObject: "ORDER_DATA",
        taskType: "automatic",
        communicationSubType: "api_call",
        assignedTo: "user123",
        priority: "High",
        icon: "list",
        allowedStatuses: ["pending", "in_progress", "completed", "failed"],
        status: "pending",
        sla: "2 hours",
        retryOnFailure: true,
        sendNotifications: true,
        requiresApproval: false,
        enableLogging: true,
        retryCount: 3,
        timeout: 30,
        executionOrder: 1,
        dependencies: "",
        bapiParameters: {
          functionName: "BAPI_ORDER_CREATE",
          parameters: {
            orderHeader: "ORDER_HEADER",
            orderItems: "ORDER_ITEMS"
          }
        },
        createdBy: "current_user",
        version: "1.0.0",
        isActive: true,
        tags: ["order-processing", "automation"]
      },
      {
        id: "task_manual_001",
        name: "Review Customer Application",
        description: "Manual review of customer application documents",
        dataObject: "CUSTOMER_APPLICATION",
        taskType: "manual",
        assignedTo: "reviewer123",
        priority: "Medium",
        icon: "document",
        allowedStatuses: ["pending", "in_progress", "completed", "rejected"],
        status: "pending",
        sla: "24 hours",
        retryOnFailure: false,
        sendNotifications: true,
        requiresApproval: true,
        enableLogging: true,
        retryCount: 0,
        timeout: 60,
        executionOrder: 2,
        dependencies: "",
        bapiParameters: null,
        createdBy: "admin_user",
        version: "1.0.0",
        isActive: true,
        tags: ["manual-review", "customer-service"]
      },
      {
        id: "task_scheduled_001",
        name: "Daily Report Generation",
        description: "Generate daily sales report automatically",
        dataObject: "SALES_REPORT",
        taskType: "scheduled",
        assignedTo: "system",
        priority: "Low",
        icon: "chart",
        allowedStatuses: ["pending", "in_progress", "completed", "failed"],
        status: "pending",
        sla: "1 hour",
        retryOnFailure: true,
        sendNotifications: false,
        requiresApproval: false,
        enableLogging: true,
        retryCount: 2,
        timeout: 15,
        executionOrder: 1,
        dependencies: "",
        bapiParameters: {
          functionName: "BAPI_REPORT_GENERATE",
          parameters: {
            reportType: "DAILY_SALES",
            dateRange: "YESTERDAY"
          }
        },
        createdBy: "system",
        version: "1.0.0",
        isActive: true,
        tags: ["scheduled", "reporting", "automation"]
      }
    ];

    // Create tasks one by one
    for (const task of sampleTasks) {
      try {
        const createResponse = await axios.post('http://localhost:3001/api/tasks', task);
        console.log(`✅ Created task: ${task.name} (${task.id})`);
      } catch (error) {
        if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
          console.log(`⚠️  Task ${task.id} already exists, skipping...`);
        } else {
          console.log(`❌ Error creating task ${task.id}:`, error.response?.data?.message || error.message);
        }
      }
    }

    console.log('\n📋 Fetching all tasks...\n');

    // Now call the API to get the list
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: 'http://localhost:3001/api/tasks',
      headers: {},
      data: ''
    };

    const response = await axios.request(config);
    
    console.log('🎉 API Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Display summary
    if (response.data.success && response.data.data) {
      console.log(`\n📊 Summary:`);
      console.log(`- Total tasks found: ${response.data.data.length}`);
      console.log(`- Tasks:`);
      response.data.data.forEach((task, index) => {
        console.log(`  ${index + 1}. ${task.name} (${task.id}) - Status: ${task.status} - Priority: ${task.priority}`);
      });
    }

    // Test best match search
    console.log('\n🔍 Testing best match search...');
    try {
      const searchResponse = await axios.get('http://localhost:3001/api/tasks?search=order&sortBy=bestMatch');
      console.log('Search results:', searchResponse.data.data.length, 'tasks found');
    } catch (error) {
      console.log('Search error:', error.message);
    }

  } catch (error) {
    console.log('❌ Error calling API:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.log('No response received:', error.message);
    } else {
      console.log('Error:', error.message);
    }
  }
}

// Run the test
testTasksAPI();
