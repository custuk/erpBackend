const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });
const DataObject = require('./models/DataObject');

// Quality Management data objects that might be missing
const qualityManagementObjects = [
  {
    id: 'data_object_quality_notifications_001',
    name: 'Quality Notifications',
    description: 'Quality notifications for defects, complaints, and non-conformances',
    category: 'Quality Management',
    icon: 'exclamation-triangle',
    color: '#ef4444',
    status: 'Active',
    formId: 'quality-notification-form',
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
    allowedFileTypes: ['pdf', 'doc', 'docx', 'xlsx', 'csv', 'jpg', 'png'],
    createdBy: 'system',
    version: '1.0.0',
    isActive: true,
    tags: ['quality', 'notification', 'defect', 'non-conformance']
  },
  {
    id: 'data_object_quality_control_lot_001',
    name: 'Quality Control Lot',
    description: 'Quality control lots for batch tracking and inspection',
    category: 'Quality Management',
    icon: 'layer-group',
    color: '#3b82f6',
    status: 'Active',
    formId: 'quality-control-lot-form',
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
    retentionPeriod: 2555, // 7 years
    maxFileSize: 10,
    allowedFileTypes: ['pdf', 'doc', 'docx', 'xlsx', 'csv'],
    createdBy: 'system',
    version: '1.0.0',
    isActive: true,
    tags: ['quality', 'control', 'lot', 'batch', 'tracking']
  },
  {
    id: 'data_object_quality_source_inspection_001',
    name: 'Quality Source Inspection',
    description: 'Source inspection records for supplier quality verification',
    category: 'Quality Management',
    icon: 'search',
    color: '#8b5cf6',
    status: 'Active',
    formId: 'quality-source-inspection-form',
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
    allowedFileTypes: ['pdf', 'doc', 'docx', 'xlsx', 'csv', 'jpg', 'png'],
    createdBy: 'system',
    version: '1.0.0',
    isActive: true,
    tags: ['quality', 'source', 'inspection', 'supplier', 'verification']
  },
  {
    id: 'data_object_quality_certificate_profile_001',
    name: 'Quality Certificate Profile',
    description: 'Quality certificate profiles and templates',
    category: 'Quality Management',
    icon: 'certificate',
    color: '#10b981',
    status: 'Active',
    formId: 'quality-certificate-profile-form',
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
    tags: ['quality', 'certificate', 'profile', 'template']
  },
  {
    id: 'data_object_quality_specification_001',
    name: 'Quality Specification',
    description: 'Quality specifications and standards for materials and products',
    category: 'Quality Management',
    icon: 'file-alt',
    color: '#f59e0b',
    status: 'Active',
    formId: 'quality-specification-form',
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
    tags: ['quality', 'specification', 'standard', 'requirement']
  },
  {
    id: 'data_object_quality_test_equipment_001',
    name: 'Quality Test Equipment',
    description: 'Test equipment calibration and maintenance records',
    category: 'Quality Management',
    icon: 'tools',
    color: '#6366f1',
    status: 'Active',
    formId: 'quality-test-equipment-form',
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
    retentionPeriod: 730, // 2 years
    maxFileSize: 10,
    allowedFileTypes: ['pdf', 'doc', 'docx', 'xlsx', 'csv'],
    createdBy: 'system',
    version: '1.0.0',
    isActive: true,
    tags: ['quality', 'test', 'equipment', 'calibration', 'maintenance']
  },
  {
    id: 'data_object_quality_audit_001',
    name: 'Quality Audit',
    description: 'Quality audit records and findings',
    category: 'Quality Management',
    icon: 'clipboard-check',
    color: '#ec4899',
    status: 'Active',
    formId: 'quality-audit-form',
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
    retentionPeriod: 2555, // 7 years
    maxFileSize: 10,
    allowedFileTypes: ['pdf', 'doc', 'docx', 'xlsx', 'csv', 'jpg', 'png'],
    createdBy: 'system',
    version: '1.0.0',
    isActive: true,
    tags: ['quality', 'audit', 'compliance', 'finding']
  },
  {
    id: 'data_object_quality_corrective_action_001',
    name: 'Quality Corrective Action',
    description: 'Corrective and preventive action (CAPA) records',
    category: 'Quality Management',
    icon: 'wrench',
    color: '#f97316',
    status: 'Active',
    formId: 'quality-corrective-action-form',
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
    retentionPeriod: 2555, // 7 years
    maxFileSize: 10,
    allowedFileTypes: ['pdf', 'doc', 'docx', 'xlsx', 'csv'],
    createdBy: 'system',
    version: '1.0.0',
    isActive: true,
    tags: ['quality', 'corrective', 'action', 'capa', 'preventive']
  }
];

async function seedQualityManagementObjects() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/erp';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    let createdCount = 0;
    let skippedCount = 0;

    // Create objects one by one
    for (const objData of qualityManagementObjects) {
      try {
        // Check if object already exists
        const existing = await DataObject.findOne({ id: objData.id });
        
        if (existing) {
          console.log(`⚠️  Skipping ${objData.name} (${objData.id}) - already exists`);
          skippedCount++;
        } else {
          const obj = new DataObject(objData);
          await obj.save();
          console.log(`✅ Created: ${objData.name} (${objData.id})`);
          createdCount++;
        }
      } catch (error) {
        if (error.code === 11000) {
          console.log(`⚠️  Skipping ${objData.name} (${objData.id}) - duplicate key`);
          skippedCount++;
        } else {
          console.error(`❌ Error creating ${objData.name}:`, error.message);
        }
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   Created: ${createdCount}`);
    console.log(`   Skipped: ${skippedCount}`);
    console.log(`   Total: ${qualityManagementObjects.length}`);

    // List all Quality Management objects
    console.log('\n📋 All Quality Management Data Objects:');
    const allQualityObjects = await DataObject.find({ 
      category: 'Quality Management',
      status: 'Active'
    }).sort({ name: 1 }).select('name id description');
    
    allQualityObjects.forEach((obj, index) => {
      console.log(`   ${index + 1}. ${obj.name} (${obj.id})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the seed function
seedQualityManagementObjects();

