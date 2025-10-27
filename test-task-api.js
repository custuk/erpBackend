const axios = require('axios');

// Enhanced API client for testing tasks
class TaskAPIClient {
  constructor(baseURL = 'http://localhost:3001/api/tasks') {
    this.baseURL = baseURL;
    this.axios = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // Test basic API connectivity
  async testConnection() {
    try {
      console.log('🔍 Testing API connection...');
      const response = await this.axios.get('/');
      console.log('✅ API is accessible');
      console.log('Response:', response.data);
      return true;
    } catch (error) {
      console.error('❌ API connection failed:', error.message);
      return false;
    }
  }

  // Get all tasks with pagination
  async getAllTasks(page = 1, limit = 10) {
    try {
      console.log(`📋 Fetching tasks (page ${page}, limit ${limit})...`);
      const response = await this.axios.get(`/?page=${page}&limit=${limit}`);
      
      if (response.data.success) {
        console.log(`✅ Found ${response.data.data.length} tasks`);
        console.log(`📊 Total: ${response.data.pagination.total} tasks`);
        console.log(`📄 Pages: ${response.data.pagination.pages}`);
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('❌ Error fetching tasks:', error.message);
      throw error;
    }
  }

  // Search tasks
  async searchTasks(searchTerm) {
    try {
      console.log(`🔍 Searching for: "${searchTerm}"`);
      const response = await this.axios.get(`/?search=${encodeURIComponent(searchTerm)}`);
      
      if (response.data.success) {
        console.log(`✅ Found ${response.data.data.length} matching tasks`);
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('❌ Error searching tasks:', error.message);
      throw error;
    }
  }

  // Filter tasks by status
  async getTasksByStatus(status) {
    try {
      console.log(`📊 Fetching tasks with status: ${status}`);
      const response = await this.axios.get(`/?status=${status}`);
      
      if (response.data.success) {
        console.log(`✅ Found ${response.data.data.length} tasks with status "${status}"`);
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('❌ Error fetching tasks by status:', error.message);
      throw error;
    }
  }

  // Filter tasks by type
  async getTasksByType(taskType) {
    try {
      console.log(`📊 Fetching tasks with type: ${taskType}`);
      const response = await this.axios.get(`/?taskType=${taskType}`);
      
      if (response.data.success) {
        console.log(`✅ Found ${response.data.data.length} tasks with type "${taskType}"`);
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('❌ Error fetching tasks by type:', error.message);
      throw error;
    }
  }

  // Filter tasks by priority
  async getTasksByPriority(priority) {
    try {
      console.log(`📊 Fetching tasks with priority: ${priority}`);
      const response = await this.axios.get(`/?priority=${priority}`);
      
      if (response.data.success) {
        console.log(`✅ Found ${response.data.data.length} tasks with priority "${priority}"`);
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('❌ Error fetching tasks by priority:', error.message);
      throw error;
    }
  }

  // Get task statistics
  async getTaskStatistics() {
    try {
      console.log('📊 Fetching task statistics...');
      const response = await this.axios.get('/stats/overview');
      
      if (response.data.success) {
        console.log('✅ Task statistics retrieved');
        console.log('Overview:', response.data.data.overview);
        console.log('By Priority:', response.data.data.byPriority);
        console.log('By Task Type:', response.data.data.byTaskType);
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('❌ Error fetching statistics:', error.message);
      throw error;
    }
  }

  // Get task by ID
  async getTaskById(taskId) {
    try {
      console.log(`🔍 Fetching task with ID: ${taskId}`);
      const response = await this.axios.get(`/${taskId}`);
      
      if (response.data.success) {
        console.log('✅ Task found');
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('❌ Error fetching task by ID:', error.message);
      throw error;
    }
  }

  // Create a new task
  async createTask(taskData) {
    try {
      console.log('➕ Creating new task...');
      const response = await this.axios.post('/', taskData);
      
      if (response.data.success) {
        console.log('✅ Task created successfully');
        console.log('Task ID:', response.data.data._id);
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('❌ Error creating task:', error.message);
      throw error;
    }
  }

  // Update task status
  async updateTaskStatus(taskId, status, lastModifiedBy = 'test_user') {
    try {
      console.log(`🔄 Updating task ${taskId} status to: ${status}`);
      const response = await this.axios.patch(`/${taskId}/status`, {
        status,
        lastModifiedBy
      });
      
      if (response.data.success) {
        console.log('✅ Task status updated successfully');
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('❌ Error updating task status:', error.message);
      throw error;
    }
  }

  // Assign task
  async assignTask(taskId, assignedTo, lastModifiedBy = 'test_user') {
    try {
      console.log(`👤 Assigning task ${taskId} to: ${assignedTo}`);
      const response = await this.axios.patch(`/${taskId}/assign`, {
        assignedTo,
        lastModifiedBy
      });
      
      if (response.data.success) {
        console.log('✅ Task assigned successfully');
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('❌ Error assigning task:', error.message);
      throw error;
    }
  }

  // Get filter options
  async getFilterOptions() {
    try {
      console.log('🔧 Fetching filter options...');
      
      const [taskTypes, priorities, tags] = await Promise.all([
        this.axios.get('/meta/task-types'),
        this.axios.get('/meta/priorities'),
        this.axios.get('/meta/tags')
      ]);

      console.log('✅ Filter options retrieved');
      console.log('Task Types:', taskTypes.data.data);
      console.log('Priorities:', priorities.data.data);
      console.log('Tags:', tags.data.data);

      return {
        taskTypes: taskTypes.data.data,
        priorities: priorities.data.data,
        tags: tags.data.data
      };
    } catch (error) {
      console.error('❌ Error fetching filter options:', error.message);
      throw error;
    }
  }

  // Display task in a formatted way
  displayTask(task) {
    console.log('\n📋 Task Details:');
    console.log('================');
    console.log(`ID: ${task._id}`);
    console.log(`Name: ${task.name}`);
    console.log(`Description: ${task.description || 'N/A'}`);
    console.log(`Data Object: ${task.dataObject || 'N/A'}`);
    console.log(`Type: ${task.taskType || 'N/A'}`);
    console.log(`Status: ${task.status || 'N/A'}`);
    console.log(`Priority: ${task.priority || 'N/A'}`);
    console.log(`Assigned To: ${task.assignedTo || 'Unassigned'}`);
    console.log(`SLA: ${task.sla || 'N/A'}`);
    console.log(`Created: ${new Date(task.createdAt).toLocaleString()}`);
    console.log(`Tags: ${task.tags ? task.tags.join(', ') : 'N/A'}`);
  }

  // Display multiple tasks in a table format
  displayTasks(tasks) {
    if (!tasks || tasks.length === 0) {
      console.log('No tasks found');
      return;
    }

    console.log('\n📋 Tasks List:');
    console.log('==============');
    console.log('Name'.padEnd(30) + 'Type'.padEnd(12) + 'Status'.padEnd(12) + 'Priority'.padEnd(10) + 'Assigned To');
    console.log('-'.repeat(80));

    tasks.forEach(task => {
      const name = (task.name || 'N/A').substring(0, 29);
      const type = (task.taskType || 'N/A').substring(0, 11);
      const status = (task.status || 'N/A').substring(0, 11);
      const priority = (task.priority || 'N/A').substring(0, 9);
      const assignedTo = (task.assignedTo || 'Unassigned').substring(0, 20);

      console.log(
        name.padEnd(30) + 
        type.padEnd(12) + 
        status.padEnd(12) + 
        priority.padEnd(10) + 
        assignedTo
      );
    });
  }
}

// Test function
async function runTests() {
  const client = new TaskAPIClient();

  try {
    console.log('🚀 Starting Task API Tests\n');

    // Test 1: Connection
    const isConnected = await client.testConnection();
    if (!isConnected) {
      console.log('❌ Cannot proceed without API connection');
      return;
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: Get all tasks
    const allTasks = await client.getAllTasks(1, 5);
    client.displayTasks(allTasks.data);

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 3: Search tasks
    const searchResults = await client.searchTasks('data');
    client.displayTasks(searchResults.data);

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 4: Filter by status
    const pendingTasks = await client.getTasksByStatus('pending');
    client.displayTasks(pendingTasks.data);

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 5: Filter by type
    const manualTasks = await client.getTasksByType('manual');
    client.displayTasks(manualTasks.data);

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 6: Filter by priority
    const highPriorityTasks = await client.getTasksByPriority('High');
    client.displayTasks(highPriorityTasks.data);

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 7: Get statistics
    await client.getTaskStatistics();

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 8: Get filter options
    await client.getFilterOptions();

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 9: Get specific task (if any exist)
    if (allTasks.data.length > 0) {
      const firstTask = allTasks.data[0];
      await client.getTaskById(firstTask._id);
      client.displayTask(firstTask);
    }

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = TaskAPIClient;
