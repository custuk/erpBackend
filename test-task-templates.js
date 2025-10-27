const axios = require('axios');

// Test function to call the Task Templates API
async function testTaskTemplatesAPI() {
  try {
    console.log('🚀 Testing Task Templates API...\n');
    
    // First, let's create some sample data
    console.log('📝 Creating sample task templates...');
    
    const sampleTemplate = {
      name: "Test Template",
      description: "Test task template",
      templateType: "Task and Data Object Template",
      id: "TEMPLATE_1757019500905",
      tasks: [
        {
          id: "DT5732",
          type: "transfer",
          x: 193.45306396484375,
          y: 205.00521087646484,
          name: "Data Transfer Task",
          description: "Transfer data between systems",
          attributes: {
            mandatory: true,
            bypassable: false,
            parallelExecution: false
          }
        },
        {
          id: "NT8395",
          type: "notification",
          x: 496.45306396484375,
          y: 225.00521087646484,
          name: "Notification Task",
          description: "Send notification to stakeholders",
          attributes: {
            mandatory: true,
            bypassable: false,
            parallelExecution: false
          }
        }
      ],
      connectors: [
        {
          id: "conn_1757019434017",
          from: "DT5732",
          to: "NT8395",
          dependencyType: "sequential",
          attributes: {
            mandatory: true,
            parallelExecution: false
          }
        }
      ]
    };

    // Create template
    try {
      const createResponse = await axios.post('http://localhost:3001/api/task-templates', sampleTemplate);
      console.log(`✅ Created template: ${sampleTemplate.name} (${sampleTemplate.id})`);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log(`⚠️  Template ${sampleTemplate.id} already exists, skipping...`);
      } else {
        console.log(`❌ Error creating template ${sampleTemplate.id}:`, error.response?.data?.message || error.message);
      }
    }

    console.log('\n📋 Fetching all task templates...\n');

    // Now call the API to get the list
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: 'http://localhost:3001/api/task-templates',
      headers: {},
      data: ''
    };

    const response = await axios.request(config);
    
    console.log('🎉 API Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Display summary
    if (response.data.success && response.data.data) {
      console.log(`\n📊 Summary:`);
      console.log(`- Total templates found: ${response.data.data.length}`);
      console.log(`- Templates:`);
      response.data.data.forEach((template, index) => {
        console.log(`  ${index + 1}. ${template.name} (${template.id}) - Status: ${template.status}`);
      });
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
testTaskTemplatesAPI();


