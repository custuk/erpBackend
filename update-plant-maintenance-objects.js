const axios = require('axios');

// Objects to update from Service Management to Plant Maintenance
const objectsToUpdate = [
  'Measuring Points',
  'Maintenance Plans',
  'Serial Numbers',
  'Work Centers',
  'Functional Locations',
  'Equipment',
  'Service Master'
];

// Missing Plant Maintenance objects to add
const missingPlantMaintenanceObjects = [
  {
    id: 'data_object_location_site_plant_address_001',
    name: 'Location (Site/Plant/Address)',
    description: 'Site, plant, and address locations for plant maintenance',
    category: 'Plant Maintenance',
    icon: 'map-marker-alt',
    color: '#3b82f6',
    status: 'Active',
    formId: 'location-form',
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
    tags: ['location', 'site', 'plant', 'address', 'maintenance']
  },
  {
    id: 'data_object_bill_of_materials_001',
    name: 'Bill of Materials (BOMs)',
    description: 'Bill of materials for equipment and maintenance',
    category: 'Plant Maintenance',
    icon: 'list-alt',
    color: '#10b981',
    status: 'Active',
    formId: 'bom-form',
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
    tags: ['bom', 'bill-of-materials', 'equipment', 'parts', 'maintenance']
  }
];

async function updatePlantMaintenanceObjects() {
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
    
    console.log(`🚀 Updating and adding Plant Maintenance Data Objects on ${baseUrl}...\n`);

    // Step 1: Fetch all Service Management objects
    console.log('📋 Step 1: Fetching Service Management objects...');
    const response = await axios.get(`${baseUrl}/api/data-objects`, {
      params: {
        category: 'Service Management',
        status: 'Active',
        limit: 100
      }
    });

    const serviceMgmtObjects = response.data.data || [];
    console.log(`   Found ${serviceMgmtObjects.length} Service Management objects\n`);

    // Step 2: Update objects to Plant Maintenance
    console.log('📝 Step 2: Updating objects from Service Management to Plant Maintenance...');
    let updatedCount = 0;
    let notFoundCount = 0;

    for (const objName of objectsToUpdate) {
      const obj = serviceMgmtObjects.find(o => o.name === objName);
      if (obj) {
        try {
          // Update category to Plant Maintenance
          await axios.put(`${baseUrl}/api/data-objects/${obj._id}`, {
            category: 'Plant Maintenance'
          });
          console.log(`   ✅ Updated: ${objName} → Plant Maintenance`);
          updatedCount++;
        } catch (error) {
          const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message;
          console.error(`   ❌ Error updating ${objName}: ${errorMsg}`);
        }
      } else {
        console.log(`   ⚠️  Not found in Service Management: ${objName}`);
        notFoundCount++;
      }
    }

    console.log(`\n   Updated: ${updatedCount}`);
    console.log(`   Not found: ${notFoundCount}\n`);

    // Step 3: Add missing objects
    console.log('➕ Step 3: Adding missing Plant Maintenance objects...');
    let createdCount = 0;
    let skippedCount = 0;

    for (const objData of missingPlantMaintenanceObjects) {
      try {
        const response = await axios.post(`${baseUrl}/api/data-objects`, objData);
        console.log(`   ✅ Created: ${objData.name} (${objData.id})`);
        createdCount++;
      } catch (error) {
        if (error.response?.status === 400 && 
            (error.response?.data?.message?.includes('already exists') || 
             error.response?.data?.message?.includes('duplicate'))) {
          console.log(`   ⚠️  Skipping ${objData.name} (${objData.id}) - already exists`);
          skippedCount++;
        } else {
          const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Unknown error';
          console.error(`   ❌ Error creating ${objData.name}: ${errorMsg}`);
        }
      }
    }

    console.log(`\n   Created: ${createdCount}`);
    console.log(`   Skipped: ${skippedCount}\n`);

    // Step 4: List all Plant Maintenance objects
    console.log('📋 Step 4: All Plant Maintenance Data Objects:');
    try {
      const pmResponse = await axios.get(`${baseUrl}/api/data-objects`, {
        params: {
          category: 'Plant Maintenance',
          status: 'Active',
          limit: 100
        }
      });

      if (pmResponse.data.success && pmResponse.data.data) {
        const objects = pmResponse.data.data.sort((a, b) => a.name.localeCompare(b.name));
        objects.forEach((obj, index) => {
          console.log(`   ${index + 1}. ${obj.name} (${obj.id})`);
        });
        console.log(`\n   Total: ${objects.length} Plant Maintenance objects`);
      }
    } catch (error) {
      console.error('   Error fetching objects:', error.response?.data?.message || error.message);
    }

    console.log('\n✅ Process completed successfully!');
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
updatePlantMaintenanceObjects();

