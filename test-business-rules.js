const axios = require('axios');

// Test function to call the Business Rules API
async function testBusinessRulesAPI() {
  try {
    console.log('🚀 Testing Business Rules API...\n');
    
    // First, let's create some sample data
    console.log('📝 Creating sample business rules...');
    
    const sampleRules = [
      {
        id: "rule_1703123456789",
        name: "Customer Credit Limit Validation",
        description: "Validates customer credit limits",
        type: "validation",
        dataObject: "customer",
        status: "draft",
        conditions: [
          {
            id: 1703123456790,
            field: "creditLimit",
            operator: "greaterThan",
            value: "10000",
            logicalOperator: "AND"
          }
        ],
        actions: [
          {
            id: 1703123456791,
            type: "setField",
            field: "status",
            value: "approved"
          }
        ],
        decisionTable: [],
        expression: "creditLimit > 10000",
        regexPattern: "",
        checkTable: [],
        priority: 1,
        enabled: true,
        version: "1.0.0",
        createdBy: "current_user",
        updatedBy: "current_user",
        isActive: true,
        tags: ["validation", "credit", "customer"]
      },
      {
        id: "rule_order_processing_001",
        name: "Order Amount Validation",
        description: "Validates order amounts and applies discounts",
        type: "business",
        dataObject: "order",
        status: "active",
        conditions: [
          {
            id: 1703123456792,
            field: "orderAmount",
            operator: "greaterThan",
            value: "1000",
            logicalOperator: "AND"
          },
          {
            id: 1703123456793,
            field: "customerType",
            operator: "equals",
            value: "premium",
            logicalOperator: "AND"
          }
        ],
        actions: [
          {
            id: 1703123456794,
            type: "setField",
            field: "discount",
            value: "10"
          },
          {
            id: 1703123456795,
            type: "showMessage",
            message: "Premium customer discount applied"
          }
        ],
        decisionTable: [
          {
            id: 1,
            conditions: ["orderAmount > 1000", "customerType = premium"],
            actions: ["applyDiscount", "showMessage"],
            priority: 1
          }
        ],
        expression: "orderAmount > 1000 && customerType === 'premium'",
        regexPattern: "",
        checkTable: [],
        priority: 2,
        enabled: true,
        version: "1.0.0",
        createdBy: "business_analyst",
        updatedBy: "business_analyst",
        isActive: true,
        tags: ["order", "discount", "premium", "business"]
      },
      {
        id: "rule_material_validation_001",
        name: "Material Code Format Validation",
        description: "Validates material code format using regex",
        type: "validation",
        dataObject: "material",
        status: "active",
        conditions: [
          {
            id: 1703123456796,
            field: "materialCode",
            operator: "regex",
            value: "^MAT-[0-9]{6}$",
            logicalOperator: "AND"
          }
        ],
        actions: [
          {
            id: 1703123456797,
            type: "setField",
            field: "validationStatus",
            value: "valid"
          },
          {
            id: 1703123456798,
            type: "showMessage",
            message: "Material code format is valid"
          }
        ],
        decisionTable: [],
        expression: "/^MAT-[0-9]{6}$/.test(materialCode)",
        regexPattern: "^MAT-[0-9]{6}$",
        checkTable: [
          {
            id: 1,
            field: "materialCode",
            operator: "regex",
            value: "^MAT-[0-9]{6}$",
            result: "valid"
          }
        ],
        priority: 1,
        enabled: true,
        version: "1.0.0",
        createdBy: "material_admin",
        updatedBy: "material_admin",
        isActive: true,
        tags: ["material", "validation", "regex", "format"]
      }
    ];

    // Create rules one by one
    for (const rule of sampleRules) {
      try {
        const createResponse = await axios.post('http://localhost:3001/api/business-rules', rule);
        console.log(`✅ Created rule: ${rule.name} (${rule.id})`);
      } catch (error) {
        if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
          console.log(`⚠️  Rule ${rule.id} already exists, skipping...`);
        } else {
          console.log(`❌ Error creating rule ${rule.id}:`, error.response?.data?.message || error.message);
        }
      }
    }

    console.log('\n📋 Fetching all business rules...\n');

    // Now call the API to get the list
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: 'http://localhost:3001/api/business-rules',
      headers: {},
      data: ''
    };

    const response = await axios.request(config);
    
    console.log('🎉 API Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Display summary
    if (response.data.success && response.data.data) {
      console.log(`\n📊 Summary:`);
      console.log(`- Total rules found: ${response.data.data.length}`);
      console.log(`- Rules:`);
      response.data.data.forEach((rule, index) => {
        console.log(`  ${index + 1}. ${rule.name} (${rule.id}) - Status: ${rule.status} - Type: ${rule.type}`);
      });
    }

    // Test best match search
    console.log('\n🔍 Testing best match search...');
    try {
      const searchResponse = await axios.get('http://localhost:3001/api/business-rules?search=validation&sortBy=bestMatch');
      console.log('Search results:', searchResponse.data.data.length, 'rules found');
    } catch (error) {
      console.log('Search error:', error.message);
    }

    // Test type filter
    console.log('\n📂 Testing type filter...');
    try {
      const typeResponse = await axios.get('http://localhost:3001/api/business-rules?type=validation');
      console.log('Type filter results:', typeResponse.data.data.length, 'rules found');
    } catch (error) {
      console.log('Type filter error:', error.message);
    }

    // Test data object filter
    console.log('\n📊 Testing data object filter...');
    try {
      const dataObjectResponse = await axios.get('http://localhost:3001/api/business-rules?dataObject=customer');
      console.log('Data object filter results:', dataObjectResponse.data.data.length, 'rules found');
    } catch (error) {
      console.log('Data object filter error:', error.message);
    }

    // Test statistics
    console.log('\n📈 Testing statistics...');
    try {
      const statsResponse = await axios.get('http://localhost:3001/api/business-rules/stats/overview');
      console.log('Statistics:', JSON.stringify(statsResponse.data.data.overview, null, 2));
    } catch (error) {
      console.log('Statistics error:', error.message);
    }

    // Test rule execution
    console.log('\n⚡ Testing rule execution...');
    try {
      const executeResponse = await axios.post('http://localhost:3001/api/business-rules/64f8a1b2c3d4e5f6a7b8c9d0/execute', {
        data: {
          creditLimit: 15000,
          customerType: "premium",
          orderAmount: 2500
        }
      });
      console.log('Rule execution result:', JSON.stringify(executeResponse.data.data, null, 2));
    } catch (error) {
      console.log('Rule execution error:', error.message);
    }

    // Test metadata
    console.log('\n🔧 Testing metadata...');
    try {
      const typesResponse = await axios.get('http://localhost:3001/api/business-rules/meta/types');
      console.log('Rule types:', typesResponse.data.data.length, 'types available');
    } catch (error) {
      console.log('Metadata error:', error.message);
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
testBusinessRulesAPI();
