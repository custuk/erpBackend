const axios = require('axios');

// Missing Purchase Management objects to add
const missingPurchaseManagementObjects = [
  {
    id: 'data_object_purchasing_pricing_001',
    name: 'Purchasing Pricing',
    description: 'Purchasing pricing conditions and price agreements',
    category: 'Purchase Management',
    icon: 'dollar-sign',
    color: '#10b981',
    status: 'Active',
    formId: 'purchasing-pricing-form',
    enableValidation: true,
    enableAuditTrail: true,
    enableWorkflow: true,
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
    allowedFileTypes: ['pdf', 'doc', 'docx', 'xlsx', 'csv'],
    createdBy: 'system',
    version: '1.0.0',
    isActive: true,
    tags: ['purchasing', 'pricing', 'price', 'conditions', 'agreement']
  },
  {
    id: 'data_object_outline_agreement_contract_001',
    name: 'Outline Agreement (Contract)',
    description: 'Outline agreements and contracts for long-term procurement',
    category: 'Purchase Management',
    icon: 'file-contract',
    color: '#3b82f6',
    status: 'Active',
    formId: 'outline-agreement-form',
    enableValidation: true,
    enableAuditTrail: true,
    enableWorkflow: true,
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
    retentionPeriod: 2555, // 7 years for contracts
    maxFileSize: 10,
    allowedFileTypes: ['pdf', 'doc', 'docx', 'xlsx', 'csv'],
    createdBy: 'system',
    version: '1.0.0',
    isActive: true,
    tags: ['purchasing', 'outline-agreement', 'contract', 'procurement', 'long-term']
  },
  {
    id: 'data_object_scheduling_agreement_001',
    name: 'Scheduling Agreement',
    description: 'Scheduling agreements for material delivery schedules',
    category: 'Purchase Management',
    icon: 'calendar-alt',
    color: '#8b5cf6',
    status: 'Active',
    formId: 'scheduling-agreement-form',
    enableValidation: true,
    enableAuditTrail: true,
    enableWorkflow: true,
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
    retentionPeriod: 2555, // 7 years for agreements
    maxFileSize: 10,
    allowedFileTypes: ['pdf', 'doc', 'docx', 'xlsx', 'csv'],
    createdBy: 'system',
    version: '1.0.0',
    isActive: true,
    tags: ['purchasing', 'scheduling-agreement', 'delivery', 'schedule', 'procurement']
  }
];

async function addPurchaseManagementObjects() {
  try {
    // Try different ports
    const possiblePorts = [process.env.API_URL, 'http://localhost:5001', 'http://localhost:3001'].filter(Boolean);
    let baseUrl = possiblePorts[0];
    
    // Test connection first on available ports
    for (const url of possiblePorts) {
      try {
        await axios.get(`${url}/api/data-objects`, { timeout: 3000 });
        baseUrl = url;
        console.log(`✅ Server connection successful on ${baseUrl}\n`);
        break;
      } catch (testError) {
        if (testError.code !== 'ECONNREFUSED' && testError.code !== 'ETIMEDOUT') {
          baseUrl = url;
          console.log(`✅ Server found on ${baseUrl}\n`);
          break;
        }
      }
    }
    
    // Final check
    try {
      await axios.get(`${baseUrl}/api/data-objects`, { timeout: 3000 });
    } catch (testError) {
      if (testError.code === 'ECONNREFUSED' || testError.code === 'ETIMEDOUT') {
        console.error(`❌ Cannot connect to server. Tried: ${possiblePorts.join(', ')}`);
        console.error('   Please ensure the server is running: npm start or node server.js\n');
        process.exit(1);
      }
    }
    
    console.log(`🚀 Adding Purchase Management Data Objects to ${baseUrl}...\n`);

    let createdCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Create objects one by one
    for (const objData of missingPurchaseManagementObjects) {
      try {
        const response = await axios.post(`${baseUrl}/api/data-objects`, objData);
        console.log(`✅ Created: ${objData.name} (${objData.id})`);
        createdCount++;
      } catch (error) {
        if (error.response?.status === 400 && 
            (error.response?.data?.message?.includes('already exists') || 
             error.response?.data?.message?.includes('duplicate'))) {
          console.log(`⚠️  Skipping ${objData.name} (${objData.id}) - already exists`);
          skippedCount++;
        } else {
          const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Unknown error';
          console.error(`❌ Error creating ${objData.name}: ${errorMsg}`);
          if (error.code === 'ECONNREFUSED') {
            console.error(`   → Server not running on ${baseUrl}. Please start the server first.`);
          }
          errorCount++;
        }
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   Created: ${createdCount}`);
    console.log(`   Skipped: ${skippedCount}`);
    console.log(`   Errors: ${errorCount}`);
    console.log(`   Total: ${missingPurchaseManagementObjects.length}`);

    // Fetch and list all Purchase Management objects
    console.log('\n📋 All Purchase Management Data Objects:');
    try {
      const response = await axios.get(`${baseUrl}/api/data-objects`, {
        params: {
          category: 'Purchase Management',
          status: 'Active',
          limit: 100
        }
      });

      if (response.data.success && response.data.data) {
        const objects = response.data.data.sort((a, b) => a.name.localeCompare(b.name));
        objects.forEach((obj, index) => {
          console.log(`   ${index + 1}. ${obj.name} (${obj.id})`);
        });
        console.log(`\n   Total: ${objects.length} Purchase Management objects`);
      }
    } catch (error) {
      console.error('   Error fetching objects:', error.response?.data?.message || error.message);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal Error:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the function
addPurchaseManagementObjects();

