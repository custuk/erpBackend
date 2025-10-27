const mongoose = require("mongoose");

// Schema for form field
const formFieldSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  label: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      "text",
      "email",
      "password",
      "number",
      "tel",
      "url",
      "search",
      "date",
      "time",
      "datetime-local",
      "month",
      "week",
      "color",
      "range",
      "file",
      "checkbox",
      "radio",
      "select",
      "textarea",
      "hidden",
      "readonly"
    ]
  },
  placeholder: {
    type: String,
    trim: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  visible: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 1
  },
  validation: {
    min: Number,
    max: Number,
    minLength: Number,
    maxLength: Number,
    pattern: String,
    custom: String
  },
  options: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  attributes: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  helpText: {
    type: String,
    trim: true
  },
  errorMessage: {
    type: String,
    trim: true
  }
}, { _id: false });

// Schema for form section
const formSectionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  order: {
    type: Number,
    required: true
  },
  visible: {
    type: Boolean,
    default: true
  },
  fields: {
    type: [formFieldSchema],
    default: []
  },
  layout: {
    type: String,
    enum: ["grid", "flex", "vertical", "horizontal"],
    default: "grid"
  },
  columns: {
    type: Number,
    default: 1,
    min: 1,
    max: 12
  },
  collapsible: {
    type: Boolean,
    default: false
  },
  collapsed: {
    type: Boolean,
    default: false
  }
}, { _id: false });

// Schema for form tab
const formTabSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  order: {
    type: Number,
    required: true
  },
  visible: {
    type: Boolean,
    default: true
  },
  sections: {
    type: [formSectionSchema],
    default: []
  }
}, { _id: false });

// Schema for form configuration
const formConfigSchema = new mongoose.Schema({
  layout: {
    type: String,
    enum: ["vertical", "horizontal", "grid"],
    default: "vertical"
  },
  columns: {
    type: Number,
    default: 1,
    min: 1,
    max: 12
  },
  spacing: {
    type: String,
    enum: ["small", "medium", "large"],
    default: "medium"
  },
  showLabels: {
    type: Boolean,
    default: true
  },
  showRequiredIndicator: {
    type: Boolean,
    default: true
  },
  submitButtonText: {
    type: String,
    default: "Save",
    trim: true
  },
  cancelButtonText: {
    type: String,
    default: "Cancel",
    trim: true
  },
  resetButtonText: {
    type: String,
    default: "Reset",
    trim: true
  },
  showResetButton: {
    type: Boolean,
    default: false
  },
  autoSave: {
    type: Boolean,
    default: false
  },
  autoSaveInterval: {
    type: Number,
    default: 30000,
    min: 1000
  },
  validationMode: {
    type: String,
    enum: ["onChange", "onBlur", "onSubmit"],
    default: "onChange"
  }
}, { _id: false });

// Schema for validation rule
const validationRuleSchema = new mongoose.Schema({
  field: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ["required", "email", "min", "max", "minLength", "maxLength", "pattern", "custom"]
  },
  value: {
    type: mongoose.Schema.Types.Mixed
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  enabled: {
    type: Boolean,
    default: true
  }
}, { _id: false });

// Schema for custom validator
const customValidatorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  function: {
    type: String,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  enabled: {
    type: Boolean,
    default: true
  }
}, { _id: false });

// Schema for business rule
const businessRuleSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  condition: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true
  },
  priority: {
    type: Number,
    default: 1
  },
  enabled: {
    type: Boolean,
    default: true
  }
}, { _id: false });

// Main form schema
const formSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: [true, "Form ID is required"],
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, "Form name is required"],
      trim: true,
      maxlength: [200, "Form name cannot exceed 200 characters"]
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"]
    },
    version: {
      type: String,
      default: "1.0.0",
      trim: true
    },
    status: {
      type: String,
      enum: ["draft", "active", "inactive", "archived", "deprecated"],
      default: "draft"
    },
    dataObject: {
      type: String,
      required: [true, "Data object is required"],
      trim: true
    },
    sapTable: {
      type: String,
      trim: true
    },
    sapStructure: {
      type: String,
      trim: true
    },
    config: {
      type: formConfigSchema,
      default: {}
    },
    tabs: {
      type: [formTabSchema],
      default: []
    },
    fields: {
      type: [formFieldSchema],
      default: []
    },
    validation: {
      rules: {
        type: [validationRuleSchema],
        default: []
      },
      customValidators: {
        type: [customValidatorSchema],
        default: []
      }
    },
    rules: {
      type: [businessRuleSchema],
      default: []
    },
    createdBy: {
      type: String,
      required: [true, "Created by is required"],
      trim: true
    },
    updatedBy: {
      type: String,
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
    // Additional metadata
    usageCount: {
      type: Number,
      default: 0,
      min: [0, "Usage count cannot be negative"]
    },
    lastAccessedAt: {
      type: Date
    },
    // Form statistics
    totalFields: {
      type: Number,
      default: 0
    },
    totalTabs: {
      type: Number,
      default: 0
    },
    totalSections: {
      type: Number,
      default: 0
    },
    // Access control
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
    }
  },
  {
    timestamps: true,
    collection: "forms"
  }
);

// Indexes for better query performance
formSchema.index({ id: 1 });
formSchema.index({ name: 1 });
formSchema.index({ dataObject: 1 });
formSchema.index({ status: 1 });
formSchema.index({ createdBy: 1 });
formSchema.index({ isActive: 1 });
formSchema.index({ createdAt: -1 });
formSchema.index({ tags: 1 });
formSchema.index({ lastAccessedAt: -1 });

// Text search index for name, description, and dataObject
formSchema.index({
  name: "text",
  description: "text",
  dataObject: "text"
});

// Virtual for form age (days since creation)
formSchema.virtual("ageInDays").get(function () {
  if (this.createdAt) {
    return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Virtual for form complexity score
formSchema.virtual("complexityScore").get(function () {
  let score = 0;
  score += this.totalFields * 1;
  score += this.totalTabs * 2;
  score += this.totalSections * 1;
  score += this.validation.rules.length * 1;
  score += this.rules.length * 2;
  return score;
});

// Virtual for form completion status
formSchema.virtual("isComplete").get(function () {
  return this.status === "active" && 
         this.totalFields > 0 && 
         this.tabs.length > 0;
});

// Ensure virtual fields are serialized
formSchema.set("toJSON", { virtuals: true });
formSchema.set("toObject", { virtuals: true });

// Pre-save middleware to update statistics
formSchema.pre("save", function (next) {
  // Update total fields count
  this.totalFields = this.fields.length;
  
  // Update total tabs count
  this.totalTabs = this.tabs.length;
  
  // Update total sections count
  this.totalSections = this.tabs.reduce((total, tab) => {
    return total + (tab.sections ? tab.sections.length : 0);
  }, 0);
  
  // Update lastAccessedAt when usageCount changes
  if (this.isModified("usageCount")) {
    this.lastAccessedAt = new Date();
  }
  
  next();
});

// Method to increment usage count
formSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  this.lastAccessedAt = new Date();
  return this.save();
};

// Method to check if user has permission
formSchema.methods.hasPermission = function(userId, action) {
  const permissions = this.permissions[action] || [];
  return permissions.includes(userId) || permissions.includes('*');
};

// Method to get all fields from all tabs
formSchema.methods.getAllFields = function() {
  const allFields = [...this.fields];
  this.tabs.forEach(tab => {
    if (tab.sections) {
      tab.sections.forEach(section => {
        if (section.fields) {
          allFields.push(...section.fields);
        }
      });
    }
  });
  return allFields;
};

// Method to get field by ID
formSchema.methods.getFieldById = function(fieldId) {
  const allFields = this.getAllFields();
  return allFields.find(field => field.id === fieldId);
};

// Static method to find by data object
formSchema.statics.findByDataObject = function(dataObject) {
  return this.find({ dataObject, isActive: true });
};

// Static method to find by status
formSchema.statics.findByStatus = function(status) {
  return this.find({ status, isActive: true });
};

const Form = mongoose.model("Form", formSchema);

module.exports = Form;
