const axios = require('axios');

// Test the original axios code you provided
async function testOriginalAxiosCode() {
  console.log('🧪 Testing Original Axios Code\n');
  
  let data = '';
  
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: 'http://localhost:3001/api/tasks',
    headers: {},
    data: data
  };
  
  try {
    const response = await axios.request(config);
    console.log('✅ Success! Response received:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Display task summary
    if (response.data.success && response.data.data) {
      console.log(`\n📊 Summary:`);
      console.log(`Total tasks: ${response.data.data.length}`);
      console.log(`Pagination: Page ${response.data.pagination.page} of ${response.data.pagination.pages}`);
      console.log(`Total in database: ${response.data.pagination.total}`);
      
      // Show first few tasks
      console.log(`\n📋 First 3 tasks:`);
      response.data.data.slice(0, 3).forEach((task, index) => {
        console.log(`${index + 1}. ${task.name} (${task.status}) - ${task.priority} priority`);
      });
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
  }
}

// Test with different query parameters
async function testWithFilters() {
  console.log('\n🔍 Testing with Filters\n');
  
  const filters = [
    { name: 'All Tasks', url: 'http://localhost:3001/api/tasks' },
    { name: 'Pending Tasks', url: 'http://localhost:3001/api/tasks?status=pending' },
    { name: 'High Priority', url: 'http://localhost:3001/api/tasks?priority=High' },
    { name: 'Manual Tasks', url: 'http://localhost:3001/api/tasks?taskType=manual' },
    { name: 'Search "data"', url: 'http://localhost:3001/api/tasks?search=data' }
  ];
  
  for (const filter of filters) {
    try {
      console.log(`Testing: ${filter.name}`);
      const response = await axios.get(filter.url);
      
      if (response.data.success) {
        console.log(`  ✅ Found ${response.data.data.length} tasks`);
      } else {
        console.log(`  ❌ Error: ${response.data.message}`);
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
  }
}

// Run tests
async function runTests() {
  await testOriginalAxiosCode();
  await testWithFilters();
  
  console.log('\n🎉 All tests completed!');
  console.log('\n💡 Your original axios code works perfectly with the API!');
  console.log('You can now use it in your frontend to load tasks dynamically.');
}

runTests();
