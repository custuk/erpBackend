const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });
const Task = require('./models/Task');

// Sample tasks data
const sampleTasks = [
  {
    id: 'task_data_entry_001',
    name: 'Fill in missing fields for Data Entry',
    description: 'Complete missing mandatory fields in the data entry form',
    dataObject: 'Material Master',
    taskType: 'manual',
    communicationSubType: 'data_entry',
    assignedTo: 'John Doe',
    priority: 'High',
    icon: 'fa-user',
    allowedStatuses: ['pending', 'in_progress', 'completed', 'failed'],
    status: 'pending',
    sla: '2 days',
    retryOnFailure: false,
    sendNotifications: true,
    requiresApproval: false,
    enableLogging: true,
    retryCount: 0,
    timeout: 30,
    executionOrder: 1,
    dependencies: '',
    bapiParameters: {},
    createdBy: 'system_admin',
    version: '1.0.0',
    isActive: true,
    tags: ['data', 'entry', 'material', 'master']
  },
  {
    id: 'task_vendor_approval_001',
    name: 'Approve new Vendor cr Review/Approval',
    description: 'Review and approve new vendor creation request',
    dataObject: 'Supplier',
    taskType: 'manual',
    communicationSubType: 'approval',
    assignedTo: 'Jane Smith',
    priority: 'Medium',
    icon: 'fa-check-circle',
    allowedStatuses: ['pending', 'in_progress', 'completed', 'failed'],
    status: 'in_progress',
    sla: '1 day',
    retryOnFailure: false,
    sendNotifications: true,
    requiresApproval: true,
    enableLogging: true,
    retryCount: 0,
    timeout: 30,
    executionOrder: 2,
    dependencies: 'task_data_entry_001',
    bapiParameters: {},
    createdBy: 'system_admin',
    version: '1.0.0',
    isActive: true,
    tags: ['vendor', 'approval', 'supplier', 'review']
  },
  {
    id: 'task_sap_api_001',
    name: 'Call SAP API - Create Ma SAP API Call',
    description: 'Execute SAP API call to create material master data',
    dataObject: 'Material Master',
    taskType: 'system',
    communicationSubType: 'api_call',
    assignedTo: 'System',
    priority: 'High',
    icon: 'fa-cog',
    allowedStatuses: ['pending', 'in_progress', 'completed', 'failed'],
    status: 'completed',
    sla: '1 hour',
    retryOnFailure: true,
    sendNotifications: true,
    requiresApproval: false,
    enableLogging: true,
    retryCount: 3,
    timeout: 60,
    executionOrder: 3,
    dependencies: 'task_data_entry_001',
    bapiParameters: {
      materialType: 'FERT',
      industrySector: 'M',
      baseUnitOfMeasure: 'EA'
    },
    createdBy: 'system_admin',
    version: '1.0.0',
    isActive: true,
    tags: ['sap', 'api', 'material', 'creation']
  },
  {
    id: 'task_email_notification_001',
    name: 'Send approval email no Email Notification',
    description: 'Send email notification for approval status',
    dataObject: 'Supplier',
    taskType: 'notification',
    communicationSubType: 'email',
    assignedTo: 'System',
    priority: 'Medium',
    icon: 'fa-envelope',
    allowedStatuses: ['pending', 'in_progress', 'completed', 'failed'],
    status: 'completed',
    sla: '30 minutes',
    retryOnFailure: true,
    sendNotifications: false,
    requiresApproval: false,
    enableLogging: true,
    retryCount: 2,
    timeout: 15,
    executionOrder: 4,
    dependencies: 'task_vendor_approval_001',
    bapiParameters: {
      templateId: 'vendor_approval',
      recipients: ['approver@company.com']
    },
    createdBy: 'system_admin',
    version: '1.0.0',
    isActive: true,
    tags: ['email', 'notification', 'approval', 'communication']
  },
  {
    id: 'task_data_validation_001',
    name: 'Run data validation rep Data Validation',
    description: 'Execute data validation report for quality assurance',
    dataObject: 'Material Master',
    taskType: 'quality',
    communicationSubType: 'validation',
    assignedTo: 'System',
    priority: 'Low',
    icon: 'fa-shield-alt',
    allowedStatuses: ['pending', 'in_progress', 'completed', 'failed'],
    status: 'pending',
    sla: '4 hours',
    retryOnFailure: true,
    sendNotifications: true,
    requiresApproval: false,
    enableLogging: true,
    retryCount: 1,
    timeout: 30,
    executionOrder: 5,
    dependencies: 'task_sap_api_001',
    bapiParameters: {
      validationRules: ['mandatory_fields', 'data_format', 'business_rules']
    },
    createdBy: 'system_admin',
    version: '1.0.0',
    isActive: true,
    tags: ['validation', 'quality', 'report', 'data']
  },
  {
    id: 'task_conditional_logic_001',
    name: 'Conditional step - Chec Conditional Logic',
    description: 'Execute conditional logic based on business rules',
    dataObject: 'Supplier',
    taskType: 'validation',
    communicationSubType: 'conditional',
    assignedTo: 'System',
    priority: 'Medium',
    icon: 'fa-question-circle',
    allowedStatuses: ['pending', 'in_progress', 'completed', 'failed'],
    status: 'pending',
    sla: '2 hours',
    retryOnFailure: true,
    sendNotifications: true,
    requiresApproval: false,
    enableLogging: true,
    retryCount: 2,
    timeout: 20,
    executionOrder: 6,
    dependencies: 'task_vendor_approval_001',
    bapiParameters: {
      conditionType: 'vendor_approval',
      rules: ['credit_check', 'compliance_verification']
    },
    createdBy: 'system_admin',
    version: '1.0.0',
    isActive: true,
    tags: ['conditional', 'logic', 'decision', 'business_rules']
  },
  // Additional transportation and logistics tasks
  {
    id: 'task_route_planning_001',
    name: 'Plan Optimal Delivery Routes',
    description: 'Create and optimize delivery routes for maximum efficiency',
    dataObject: 'logistics',
    taskType: 'planning',
    communicationSubType: 'planning',
    assignedTo: 'logistics_planner',
    priority: 'High',
    icon: 'fa-route',
    allowedStatuses: ['pending', 'in_progress', 'completed', 'failed'],
    status: 'pending',
    sla: '2 hours',
    retryOnFailure: true,
    sendNotifications: true,
    requiresApproval: false,
    enableLogging: true,
    retryCount: 2,
    timeout: 30,
    executionOrder: 1,
    dependencies: '',
    bapiParameters: {},
    createdBy: 'logistics_admin',
    version: '1.0.0',
    isActive: true,
    tags: ['route', 'planning', 'optimization', 'delivery']
  },
  {
    id: 'task_load_planning_001',
    name: 'Plan Vehicle Loads',
    description: 'Optimize vehicle loading for maximum capacity utilization',
    dataObject: 'logistics',
    taskType: 'manual',
    communicationSubType: 'planning',
    assignedTo: 'load_planner',
    priority: 'High',
    icon: 'fa-truck',
    allowedStatuses: ['pending', 'in_progress', 'completed', 'failed'],
    status: 'in_progress',
    sla: '1 hour',
    retryOnFailure: false,
    sendNotifications: true,
    requiresApproval: false,
    enableLogging: true,
    retryCount: 0,
    timeout: 30,
    executionOrder: 2,
    dependencies: 'task_route_planning_001',
    bapiParameters: {},
    createdBy: 'logistics_admin',
    version: '1.0.0',
    isActive: true,
    tags: ['load', 'planning', 'vehicle', 'capacity']
  },
  {
    id: 'task_carrier_selection_001',
    name: 'Select Optimal Carrier',
    description: 'Choose best carrier based on cost, service level, and availability',
    dataObject: 'logistics',
    taskType: 'manual',
    communicationSubType: 'selection',
    assignedTo: 'logistics_coordinator',
    priority: 'High',
    icon: 'fa-handshake',
    allowedStatuses: ['pending', 'in_progress', 'completed', 'failed'],
    status: 'completed',
    sla: '30 minutes',
    retryOnFailure: false,
    sendNotifications: true,
    requiresApproval: true,
    enableLogging: true,
    retryCount: 0,
    timeout: 15,
    executionOrder: 3,
    dependencies: 'task_load_planning_001',
    bapiParameters: {},
    createdBy: 'logistics_admin',
    version: '1.0.0',
    isActive: true,
    tags: ['carrier', 'selection', 'cost', 'service']
  },
  {
    id: 'task_shipment_creation_001',
    name: 'Create Shipment',
    description: 'Generate shipment documents and tracking information',
    dataObject: 'logistics',
    taskType: 'api-call',
    communicationSubType: 'creation',
    assignedTo: 'logistics_system',
    priority: 'High',
    icon: 'fa-box',
    allowedStatuses: ['pending', 'in_progress', 'completed', 'failed'],
    status: 'completed',
    sla: '15 minutes',
    retryOnFailure: true,
    sendNotifications: true,
    requiresApproval: false,
    enableLogging: true,
    retryCount: 3,
    timeout: 10,
    executionOrder: 4,
    dependencies: 'task_carrier_selection_001',
    bapiParameters: {
      trackingNumber: 'TRK123456789',
      carrierCode: 'FEDEX'
    },
    createdBy: 'logistics_admin',
    version: '1.0.0',
    isActive: true,
    tags: ['shipment', 'creation', 'documents', 'tracking']
  }
];

// Connect to MongoDB and seed data
const seedTasks = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI_DEV;
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Clear existing tasks
    await Task.deleteMany({});
    console.log('🗑️  Cleared existing tasks');

    // Insert sample tasks
    const insertedTasks = await Task.insertMany(sampleTasks);
    console.log(`✅ Inserted ${insertedTasks.length} sample tasks`);

    // Display summary
    console.log('\n📊 Task Summary:');
    console.log('================');
    
    const statusCounts = await Task.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const priorityCounts = await Task.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);
    
    const taskTypeCounts = await Task.aggregate([
      { $group: { _id: '$taskType', count: { $sum: 1 } } }
    ]);

    console.log('\nBy Status:');
    statusCounts.forEach(item => {
      console.log(`  ${item._id}: ${item.count}`);
    });

    console.log('\nBy Priority:');
    priorityCounts.forEach(item => {
      console.log(`  ${item._id}: ${item.count}`);
    });

    console.log('\nBy Task Type:');
    taskTypeCounts.forEach(item => {
      console.log(`  ${item._id}: ${item.count}`);
    });

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\nYou can now test the API with:');
    console.log('GET http://localhost:3001/api/tasks');
    console.log('GET http://localhost:3001/api/tasks?status=pending');
    console.log('GET http://localhost:3001/api/tasks?taskType=manual');
    console.log('GET http://localhost:3001/api/tasks?priority=High');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the seeder
seedTasks();
