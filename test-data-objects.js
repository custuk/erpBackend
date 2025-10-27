const axios = require('axios');

// Test function to call the Data Objects API
async function testDataObjectsAPI() {
  try {
    console.log('🚀 Testing Data Objects API...\n');
    
    // First, let's create some sample data
    console.log('📝 Creating sample data objects...');
    
    const sampleObjects = [
      {
        id: "data_object_1758665982571",
        name: "Material Master Data",
        description: "Central repository for material master data",
        category: "Material Management",
        icon: "package",
        color: "#f59e0b",
        status: "Active",
        formId: "MATERIAL_FORM_001",
        enableValidation: true,
        enableAuditTrail: true,
        enableWorkflow: false,
        enableNotifications: true,
        enableVersioning: true,
        enableAccessControl: true,
        enableDataEncryption: false,
        enableBackup: true,
        enableApiAccess: true,
        enableBulkOperations: true,
        enableSearch: true,
        enableExport: true,
        enableImport: true,
        retentionPeriod: 365,
        maxFileSize: 10,
        allowedFileTypes: ["pdf", "doc", "docx", "xlsx", "csv"],
        createdBy: "current_user",
        version: "1.0.0",
        isActive: true,
        tags: ["material", "master-data", "inventory"]
      },
      {
        id: "data_object_customer_001",
        name: "Customer Master Data",
        description: "Customer information and relationship management",
        category: "Customer Management",
        icon: "users",
        color: "#3b82f6",
        status: "Active",
        formId: "CUSTOMER_FORM_001",
        enableValidation: true,
        enableAuditTrail: true,
        enableWorkflow: true,
        enableNotifications: true,
        enableVersioning: true,
        enableAccessControl: true,
        enableDataEncryption: true,
        enableBackup: true,
        enableApiAccess: true,
        enableBulkOperations: true,
        enableSearch: true,
        enableExport: true,
        enableImport: true,
        retentionPeriod: 2555,
        maxFileSize: 25,
        allowedFileTypes: ["pdf", "doc", "docx", "xlsx", "csv", "jpg", "png"],
        createdBy: "admin_user",
        version: "1.0.0",
        isActive: true,
        tags: ["customer", "crm", "relationship-management"]
      },
      {
        id: "data_object_financial_001",
        name: "Financial Transactions",
        description: "Financial transaction records and accounting data",
        category: "Financial Management",
        icon: "dollar-sign",
        color: "#10b981",
        status: "Active",
        formId: "FINANCIAL_FORM_001",
        enableValidation: true,
        enableAuditTrail: true,
        enableWorkflow: true,
        enableNotifications: true,
        enableVersioning: true,
        enableAccessControl: true,
        enableDataEncryption: true,
        enableBackup: true,
        enableApiAccess: true,
        enableBulkOperations: false,
        enableSearch: true,
        enableExport: true,
        enableImport: false,
        retentionPeriod: 2555,
        maxFileSize: 5,
        allowedFileTypes: ["pdf", "xlsx", "csv"],
        createdBy: "finance_admin",
        version: "1.0.0",
        isActive: true,
        tags: ["financial", "accounting", "transactions", "audit"]
      }
    ];

    // Create objects one by one
    for (const obj of sampleObjects) {
      try {
        const createResponse = await axios.post('http://localhost:3001/api/data-objects', obj);
        console.log(`✅ Created object: ${obj.name} (${obj.id})`);
      } catch (error) {
        if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
          console.log(`⚠️  Object ${obj.id} already exists, skipping...`);
        } else {
          console.log(`❌ Error creating object ${obj.id}:`, error.response?.data?.message || error.message);
        }
      }
    }

    console.log('\n📋 Fetching all data objects...\n');

    // Now call the API to get the list
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: 'http://localhost:3001/api/data-objects',
      headers: {},
      data: ''
    };

    const response = await axios.request(config);
    
    console.log('🎉 API Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Display summary
    if (response.data.success && response.data.data) {
      console.log(`\n📊 Summary:`);
      console.log(`- Total objects found: ${response.data.data.length}`);
      console.log(`- Objects:`);
      response.data.data.forEach((obj, index) => {
        console.log(`  ${index + 1}. ${obj.name} (${obj.id}) - Status: ${obj.status} - Category: ${obj.category}`);
      });
    }

    // Test best match search
    console.log('\n🔍 Testing best match search...');
    try {
      const searchResponse = await axios.get('http://localhost:3001/api/data-objects?search=material&sortBy=bestMatch');
      console.log('Search results:', searchResponse.data.data.length, 'objects found');
    } catch (error) {
      console.log('Search error:', error.message);
    }

    // Test category filter
    console.log('\n📂 Testing category filter...');
    try {
      const categoryResponse = await axios.get('http://localhost:3001/api/data-objects?category=Material Management');
      console.log('Category filter results:', categoryResponse.data.data.length, 'objects found');
    } catch (error) {
      console.log('Category filter error:', error.message);
    }

    // Test statistics
    console.log('\n📈 Testing statistics...');
    try {
      const statsResponse = await axios.get('http://localhost:3001/api/data-objects/stats/overview');
      console.log('Statistics:', JSON.stringify(statsResponse.data.data.overview, null, 2));
    } catch (error) {
      console.log('Statistics error:', error.message);
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
testDataObjectsAPI();
