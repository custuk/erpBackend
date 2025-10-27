const mongoose = require('mongoose');
const ModuleConfiguration = require('./models/ModuleConfiguration');
require('dotenv').config({ path: './config.env' });

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI_DEV;
    await mongoose.connect(mongoURI);
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

// Sample module configurations
const moduleConfigurations = [
  // Supply Chain Route modules - MOVED TO CONFIG SCOPE
  {
    moduleId: 'add-supply-chain-route',
    moduleName: 'Add Supply Chain Route',
    moduleDescription: 'Create a new supply chain route for pharmaceutical business with drag-and-drop interface',
    declarationScope: 'Config', // MOVED FROM ERP TO CONFIG
    category: 'Supply Chain & Finance Route',
    subCategory: 'Route Management',
    icon: 'fa-route',
    color: '#3B82F6',
    route: '/config/add-supply-chain-route',
    apiEndpoint: '/api/supply-chain-routes',
    features: ['Drag & Drop Interface', 'Location Types Management', 'Transport Mode Configuration'],
    isActive: true,
    order: 1,
    permissions: {
      read: ['admin', 'manager', 'user'],
      write: ['admin', 'manager'],
      execute: ['admin', 'manager']
    }
  },
  {
    moduleId: 'manage-supply-chain-routes',
    moduleName: 'Manage Supply Chain Routes',
    moduleDescription: 'View, edit, and manage existing supply chain routes with comprehensive management tools',
    declarationScope: 'Config', // MOVED FROM ERP TO CONFIG
    category: 'Supply Chain & Finance Route',
    subCategory: 'Route Management',
    icon: 'fa-cogs',
    color: '#10B981',
    route: '/config/manage-supply-chain-routes',
    apiEndpoint: '/api/supply-chain-routes',
    features: ['Route Overview & Management', 'Status Tracking', 'Filtering & Search', 'Bulk Operations'],
    isActive: true,
    order: 2,
    permissions: {
      read: ['admin', 'manager', 'user'],
      write: ['admin', 'manager'],
      execute: ['admin', 'manager']
    }
  },
  {
    moduleId: 'view-supply-chain-routes',
    moduleName: 'View Supply Chain Routes',
    moduleDescription: 'View and analyze supply chain routes with detailed reporting and analytics',
    declarationScope: 'Config', // MOVED FROM ERP TO CONFIG
    category: 'Supply Chain & Finance Route',
    subCategory: 'Route Management',
    icon: 'fa-eye',
    color: '#8B5CF6',
    route: '/config/view-supply-chain-routes',
    apiEndpoint: '/api/supply-chain-routes',
    features: ['Route Analytics', 'Performance Metrics', 'Export Reports', 'Visualization'],
    isActive: true,
    order: 3,
    permissions: {
      read: ['admin', 'manager', 'user'],
      write: [],
      execute: ['admin', 'manager', 'user']
    }
  },
  
  // ERP Scope modules (keeping existing ones)
  {
    moduleId: 'data-orchestration-sap',
    moduleName: 'Data Orchestration (SAP)',
    moduleDescription: 'Orchestrate data flow between SAP and other systems',
    declarationScope: 'ERP',
    category: 'Data Management',
    subCategory: 'SAP Integration',
    icon: 'fa-sync',
    color: '#F59E0B',
    route: '/erp/data-orchestration-sap',
    apiEndpoint: '/api/data-objects',
    features: ['SAP Integration', 'Data Synchronization', 'Error Handling', 'Monitoring'],
    isActive: true,
    order: 1,
    permissions: {
      read: ['admin', 'manager', 'user'],
      write: ['admin', 'manager'],
      execute: ['admin', 'manager']
    }
  },
  {
    moduleId: 'material-master-sap',
    moduleName: 'Material Master (SAP)',
    moduleDescription: 'Manage material master data in SAP system',
    declarationScope: 'ERP',
    category: 'Data Management',
    subCategory: 'SAP Integration',
    icon: 'fa-box',
    color: '#EF4444',
    route: '/erp/material-master-sap',
    apiEndpoint: '/api/products',
    features: ['Material Management', 'SAP Integration', 'Data Validation', 'Bulk Operations'],
    isActive: true,
    order: 2,
    permissions: {
      read: ['admin', 'manager', 'user'],
      write: ['admin', 'manager'],
      execute: ['admin', 'manager']
    }
  },
  {
    moduleId: 'create-data-request',
    moduleName: 'Create Data Request',
    moduleDescription: 'Create new data requests for processing and approval',
    declarationScope: 'ERP',
    category: 'Data Management',
    subCategory: 'Request Management',
    icon: 'fa-plus-circle',
    color: '#06B6D4',
    route: '/erp/create-data-request',
    apiEndpoint: '/api/material-requests',
    features: ['Request Creation', 'Form Validation', 'Workflow Integration', 'Status Tracking'],
    isActive: true,
    order: 3,
    permissions: {
      read: ['admin', 'manager', 'user'],
      write: ['admin', 'manager', 'user'],
      execute: ['admin', 'manager', 'user']
    }
  },
  {
    moduleId: 'manage-material-data-request',
    moduleName: 'Manage Material Data Request',
    moduleDescription: 'Manage and process material data requests',
    declarationScope: 'ERP',
    category: 'Data Management',
    subCategory: 'Request Management',
    icon: 'fa-tasks',
    color: '#84CC16',
    route: '/erp/manage-material-data-request',
    apiEndpoint: '/api/material-requests',
    features: ['Request Management', 'Approval Workflow', 'Status Tracking', 'Bulk Operations'],
    isActive: true,
    order: 4,
    permissions: {
      read: ['admin', 'manager', 'user'],
      write: ['admin', 'manager'],
      execute: ['admin', 'manager']
    }
  },
  
  // GB Customs Scope modules
  {
    moduleId: 'customs-declaration',
    moduleName: 'Customs Declaration',
    moduleDescription: 'Manage customs declarations for import/export',
    declarationScope: 'GB Customs',
    category: 'Customs Management',
    subCategory: 'Declarations',
    icon: 'fa-file-alt',
    color: '#10B981',
    route: '/gb-customs/customs-declaration',
    apiEndpoint: '/api/customs-declarations',
    features: ['Declaration Forms', 'Document Management', 'Compliance Checking', 'Submission'],
    isActive: true,
    order: 1,
    permissions: {
      read: ['admin', 'manager', 'customs-user'],
      write: ['admin', 'manager', 'customs-user'],
      execute: ['admin', 'manager', 'customs-user']
    }
  },
  {
    moduleId: 'duty-calculator',
    moduleName: 'Duty Calculator',
    moduleDescription: 'Calculate customs duties and taxes',
    declarationScope: 'GB Customs',
    category: 'Customs Management',
    subCategory: 'Calculations',
    icon: 'fa-calculator',
    color: '#F59E0B',
    route: '/gb-customs/duty-calculator',
    apiEndpoint: '/api/duty-calculations',
    features: ['Duty Calculation', 'Tax Computation', 'Rate Lookup', 'Export Reports'],
    isActive: true,
    order: 2,
    permissions: {
      read: ['admin', 'manager', 'customs-user'],
      write: ['admin', 'manager'],
      execute: ['admin', 'manager', 'customs-user']
    }
  }
];

async function seedModuleConfigurations() {
  try {
    console.log('🌱 Starting Module Configuration Seeding...\n');

    // Clear existing configurations
    await ModuleConfiguration.deleteMany({});
    console.log('🗑️  Cleared existing module configurations');

    // Insert new configurations
    const createdModules = await ModuleConfiguration.insertMany(moduleConfigurations);
    console.log(`✅ Created ${createdModules.length} module configurations`);

    // Display summary by scope
    console.log('\n📊 Module Configuration Summary:');
    
    const scopes = ['ERP', 'Config', 'GB Customs'];
    for (const scope of scopes) {
      const modules = await ModuleConfiguration.find({ declarationScope: scope, isActive: true });
      console.log(`\n🔹 ${scope} Scope (${modules.length} modules):`);
      modules.forEach(module => {
        console.log(`   • ${module.moduleName} (${module.category})`);
      });
    }

    console.log('\n🎉 Module configuration seeding completed successfully!');
    console.log('\n📋 Key Changes Made:');
    console.log('   • Moved Supply Chain Route modules from ERP to Config scope');
    console.log('   • Created comprehensive module configuration system');
    console.log('   • Added proper permissions and features for each module');
    
  } catch (error) {
    console.error('❌ Error seeding module configurations:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the seeding
connectDB().then(() => {
  seedModuleConfigurations();
});
