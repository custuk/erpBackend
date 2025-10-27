const mongoose = require("mongoose");

// Main data object schema
const dataObjectSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: [true, "Data Object ID is required"],
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [200, "Name cannot exceed 200 characters"]
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"]
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Material Management",
        "Sales Management",
        "Purchase Management",
        "Inventory Management",
        "Customer Management",
        "Supplier Management",
        "Financial Management",
        "HR Management",
        "Project Management",
        "Service Management",
        "Quality Management",
        "Compliance Management",
        "Document Management",
        "Workflow Management",
        "Reporting",
        "Analytics",
        "Integration",
        "Configuration",
        "System Administration",
        "Other"
      ],
      trim: true
    },
    icon: {
      type: String,
      default: "package",
      trim: true
    },
    color: {
      type: String,
      default: "#f59e0b",
      match: [/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color code"]
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Draft", "Archived", "Deprecated"],
      default: "Active"
    },
    formId: {
      type: String,
      trim: true
    },
    // Feature flags
    enableValidation: {
      type: Boolean,
      default: true
    },
    enableAuditTrail: {
      type: Boolean,
      default: true
    },
    enableWorkflow: {
      type: Boolean,
      default: false
    },
    enableNotifications: {
      type: Boolean,
      default: true
    },
    enableVersioning: {
      type: Boolean,
      default: true
    },
    enableAccessControl: {
      type: Boolean,
      default: true
    },
    enableDataEncryption: {
      type: Boolean,
      default: false
    },
    enableBackup: {
      type: Boolean,
      default: true
    },
    enableApiAccess: {
      type: Boolean,
      default: true
    },
    enableBulkOperations: {
      type: Boolean,
      default: true
    },
    enableSearch: {
      type: Boolean,
      default: true
    },
    enableExport: {
      type: Boolean,
      default: true
    },
    enableImport: {
      type: Boolean,
      default: true
    },
    // Configuration settings
    retentionPeriod: {
      type: Number,
      default: 365,
      min: [1, "Retention period must be at least 1 day"],
      max: [3650, "Retention period cannot exceed 10 years"]
    },
    maxFileSize: {
      type: Number,
      default: 10,
      min: [1, "Max file size must be at least 1 MB"],
      max: [1000, "Max file size cannot exceed 1000 MB"]
    },
    allowedFileTypes: {
      type: [String],
      default: ["pdf", "doc", "docx", "xlsx", "csv"],
      validate: {
        validator: function(types) {
          const allowedTypes = [
            "pdf", "doc", "docx", "xlsx", "csv", "txt", "jpg", "jpeg", "png", 
            "gif", "zip", "rar", "xml", "json", "html", "htm"
          ];
          return types.every(type => allowedTypes.includes(type.toLowerCase()));
        },
        message: "Invalid file type in allowedFileTypes"
      }
    },
    createdBy: {
      type: String,
      required: [true, "Created by is required"],
      trim: true
    },
    version: {
      type: String,
      default: "1.0.0",
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    tags: {
      type: [String],
      default: []
    },
    lastModifiedBy: {
      type: String,
      trim: true
    },
    // Additional metadata
    usageCount: {
      type: Number,
      default: 0,
      min: [0, "Usage count cannot be negative"]
    },
    lastAccessedAt: {
      type: Date
    },
    schemaVersion: {
      type: String,
      default: "1.0"
    },
    // Access control settings
    permissions: {
      read: {
        type: [String],
        default: []
      },
      write: {
        type: [String],
        default: []
      },
      delete: {
        type: [String],
        default: []
      }
    },
    // Workflow settings
    workflowConfig: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    // Validation rules
    validationRules: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  {
    timestamps: true,
    collection: "objects"
  }
);

// Indexes for better query performance
dataObjectSchema.index({ id: 1 });
dataObjectSchema.index({ name: 1 });
dataObjectSchema.index({ category: 1 });
dataObjectSchema.index({ status: 1 });
dataObjectSchema.index({ createdBy: 1 });
dataObjectSchema.index({ isActive: 1 });
dataObjectSchema.index({ createdAt: -1 });
dataObjectSchema.index({ tags: 1 });
dataObjectSchema.index({ lastAccessedAt: -1 });

// Text search index for name, description, and category
dataObjectSchema.index({
  name: "text",
  description: "text",
  category: "text"
});

// Virtual for object age (days since creation)
dataObjectSchema.virtual("ageInDays").get(function () {
  if (this.createdAt) {
    return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Virtual for retention status
dataObjectSchema.virtual("isRetentionExpired").get(function () {
  if (this.retentionPeriod && this.createdAt) {
    const expirationDate = new Date(this.createdAt.getTime() + (this.retentionPeriod * 24 * 60 * 60 * 1000));
    return new Date() > expirationDate;
  }
  return false;
});

// Virtual for feature count
dataObjectSchema.virtual("enabledFeaturesCount").get(function () {
  const features = [
    'enableValidation', 'enableAuditTrail', 'enableWorkflow', 'enableNotifications',
    'enableVersioning', 'enableAccessControl', 'enableDataEncryption', 'enableBackup',
    'enableApiAccess', 'enableBulkOperations', 'enableSearch', 'enableExport', 'enableImport'
  ];
  return features.filter(feature => this[feature]).length;
});

// Virtual for file size in MB
dataObjectSchema.virtual("maxFileSizeMB").get(function () {
  return this.maxFileSize;
});

// Ensure virtual fields are serialized
dataObjectSchema.set("toJSON", { virtuals: true });
dataObjectSchema.set("toObject", { virtuals: true });

// Pre-save middleware to update lastAccessedAt
dataObjectSchema.pre("save", function (next) {
  // Update lastAccessedAt when usageCount changes
  if (this.isModified("usageCount")) {
    this.lastAccessedAt = new Date();
  }
  
  next();
});

// Method to increment usage count
dataObjectSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  this.lastAccessedAt = new Date();
  return this.save();
};

// Method to check if user has permission
dataObjectSchema.methods.hasPermission = function(userId, action) {
  const permissions = this.permissions[action] || [];
  return permissions.includes(userId) || permissions.includes('*');
};

// Static method to find by category
dataObjectSchema.statics.findByCategory = function(category) {
  return this.find({ category, isActive: true });
};

// Static method to find expired objects
dataObjectSchema.statics.findExpired = function() {
  const now = new Date();
  return this.find({
    isActive: true,
    $expr: {
      $gt: [
        now,
        {
          $add: [
            "$createdAt",
            { $multiply: ["$retentionPeriod", 24 * 60 * 60 * 1000] }
          ]
        }
      ]
    }
  });
};

const DataObject = mongoose.model("DataObject", dataObjectSchema);

module.exports = DataObject;
