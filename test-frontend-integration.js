const axios = require('axios');

// Test the exact same request your frontend is making
async function testFrontendIntegration() {
  console.log('🧪 Testing Frontend Integration (localhost:3002 → localhost:3001)\n');
  
  try {
    // Simulate the exact request your frontend makes
    const response = await axios.get('http://localhost:3001/api/tasks', {
      headers: {
        'Origin': 'http://localhost:3001',
        'Accept': 'application/json, text/plain, */*',
        'Cache-Control': 'no-cache'
      }
    });
    
    console.log('✅ SUCCESS! API Response:');
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`CORS Header: ${response.headers['access-control-allow-origin']}`);
    console.log(`Cache Control: ${response.headers['cache-control']}`);
    console.log(`Content Type: ${response.headers['content-type']}`);
    
    if (response.data.success) {
      console.log(`\n📊 Data Summary:`);
      console.log(`Total tasks: ${response.data.data.length}`);
      console.log(`Pagination: Page ${response.data.pagination.page} of ${response.data.pagination.pages}`);
      console.log(`Total in database: ${response.data.pagination.total}`);
      
      console.log(`\n📋 Task List:`);
      response.data.data.forEach((task, index) => {
        console.log(`${index + 1}. ${task.name} (${task.status}) - ${task.priority} priority`);
      });
      
      console.log('\n🎉 Your frontend should now work perfectly!');
      console.log('The "Error Loading Data" message should be resolved.');
      
    } else {
      console.log('❌ API returned success: false');
      console.log('Message:', response.data.message);
    }
    
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    
    if (error.response) {
      console.log('Response Status:', error.response.status);
      console.log('Response Headers:', error.response.headers);
      console.log('Response Data:', error.response.data);
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure your backend server is running:');
      console.log('   node server.js');
    }
  }
}

// Test with different scenarios
async function testAllScenarios() {
  console.log('🔍 Testing All Scenarios\n');
  
  const scenarios = [
    {
      name: 'Basic Request',
      url: 'http://localhost:3001/api/tasks',
      headers: { 'Origin': 'http://localhost:3002' }
    },
    {
      name: 'With Search',
      url: 'http://localhost:3001/api/tasks?search=data',
      headers: { 'Origin': 'http://localhost:3002' }
    },
    {
      name: 'Filter by Status',
      url: 'http://localhost:3001/api/tasks?status=pending',
      headers: { 'Origin': 'http://localhost:3002' }
    },
    {
      name: 'Filter by Priority',
      url: 'http://localhost:3001/api/tasks?priority=High',
      headers: { 'Origin': 'http://localhost:3002' }
    }
  ];
  
  for (const scenario of scenarios) {
    try {
      console.log(`Testing: ${scenario.name}`);
      const response = await axios.get(scenario.url, { headers: scenario.headers });
      
      if (response.data.success) {
        console.log(`  ✅ Success - Found ${response.data.data.length} tasks`);
      } else {
        console.log(`  ❌ Failed - ${response.data.message}`);
      }
    } catch (error) {
      console.log(`  ❌ Error - ${error.message}`);
    }
  }
}

// Run all tests
async function runAllTests() {
  await testFrontendIntegration();
  console.log('\n' + '='.repeat(60) + '\n');
  await testAllScenarios();
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Refresh your frontend page (localhost:3002)');
  console.log('2. Clear browser cache if needed (Ctrl+Shift+R or Cmd+Shift+R)');
  console.log('3. Check the Network tab in DevTools - you should see 200 OK responses');
  console.log('4. The "Error Loading Data" message should be gone!');
}

runAllTests();
