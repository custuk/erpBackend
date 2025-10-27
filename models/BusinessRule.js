const mongoose = require("mongoose");

// Schema for condition
const conditionSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  field: {
    type: String,
    required: [true, "Field is required"],
    trim: true
  },
  operator: {
    type: String,
    required: [true, "Operator is required"],
    enum: [
      "equals",
      "notEquals",
      "greaterThan",
      "greaterThanOrEqual",
      "lessThan",
      "lessThanOrEqual",
      "contains",
      "notContains",
      "startsWith",
      "endsWith",
      "isEmpty",
      "isNotEmpty",
      "isNull",
      "isNotNull",
      "in",
      "notIn",
      "between",
      "regex"
    ],
    trim: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, "Value is required"]
  },
  logicalOperator: {
    type: String,
    enum: ["AND", "OR", "NOT"],
    default: "AND"
  }
}, { _id: false });

// Schema for action
const actionSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: [true, "Action type is required"],
    enum: [
      "setField",
      "clearField",
      "showField",
      "hideField",
      "enableField",
      "disableField",
      "setRequired",
      "setOptional",
      "setReadonly",
      "setEditable",
      "setValue",
      "calculate",
      "validate",
      "showMessage",
      "hideMessage",
      "redirect",
      "callAPI",
      "executeFunction",
      "sendNotification",
      "logEvent",
      "triggerWorkflow"
    ],
    trim: true
  },
  field: {
    type: String,
    trim: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed
  },
  message: {
    type: String,
    trim: true
  },
  parameters: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { _id: false });

// Schema for decision table condition
const decisionTableConditionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    trim: true
  },
  field: {
    type: String,
    required: true,
    trim: true
  },
  operator: {
    type: String,
    required: true,
    trim: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
}, { _id: false });

// Schema for decision table action
const decisionTableActionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    trim: true
  },
  field: {
    type: String,
    trim: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed
  }
}, { _id: false });

// Schema for decision table row
const decisionTableRowSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  conditions: {
    type: [decisionTableConditionSchema],
    required: true
  },
  actions: {
    type: [decisionTableActionSchema],
    required: true
  },
  priority: {
    type: Number,
    default: 1
  }
}, { _id: false });

// Schema for check table row
const checkTableRowSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  field: {
    type: String,
    required: true,
    trim: true
  },
  operator: {
    type: String,
    required: true,
    trim: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  result: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
}, { _id: false });

// Main business rule schema
const businessRuleSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: [true, "Business Rule ID is required"],
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, "Business Rule name is required"],
      trim: true,
      maxlength: [200, "Business Rule name cannot exceed 200 characters"]
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"]
    },
    type: {
      type: String,
      required: [true, "Rule type is required"],
      enum: [
        "validation",
        "calculation",
        "workflow",
        "notification",
        "integration",
        "security",
        "business",
        "data",
        "ui",
        "api"
      ],
      trim: true
    },
    dataObject: {
      type: String,
      required: [true, "Data object is required"],
      trim: true
    },
    status: {
      type: String,
      enum: ["draft", "active", "inactive", "archived", "deprecated"],
      default: "draft"
    },
    conditions: {
      type: [conditionSchema],
      default: []
    },
    actions: {
      type: [actionSchema],
      default: []
    },
    decisionTable: {
      type: [decisionTableRowSchema],
      default: []
    },
    expression: {
      type: String,
      trim: true
    },
    regexPattern: {
      type: String,
      trim: true
    },
    checkTable: {
      type: [checkTableRowSchema],
      default: []
    },
    priority: {
      type: Number,
      default: 1,
      min: [1, "Priority must be at least 1"]
    },
    enabled: {
      type: Boolean,
      default: true
    },
    version: {
      type: String,
      default: "1.0.0",
      trim: true
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
    lastExecutedAt: {
      type: Date
    },
    executionCount: {
      type: Number,
      default: 0,
      min: [0, "Execution count cannot be negative"]
    },
    successCount: {
      type: Number,
      default: 0,
      min: [0, "Success count cannot be negative"]
    },
    failureCount: {
      type: Number,
      default: 0,
      min: [0, "Failure count cannot be negative"]
    },
    // Rule complexity metrics
    conditionCount: {
      type: Number,
      default: 0
    },
    actionCount: {
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
      execute: {
        type: [String],
        default: []
      }
    },
    // Rule dependencies
    dependencies: {
      type: [String],
      default: []
    },
    // Rule categories
    category: {
      type: String,
      trim: true
    },
    // Rule scope
    scope: {
      type: String,
      enum: ["global", "dataObject", "field", "user", "role", "generic"],
      default: "dataObject"
    }
  },
  {
    timestamps: true,
    collection: "business-rules"
  }
);

// Indexes for better query performance
businessRuleSchema.index({ id: 1 });
businessRuleSchema.index({ name: 1 });
businessRuleSchema.index({ type: 1 });
businessRuleSchema.index({ dataObject: 1 });
businessRuleSchema.index({ status: 1 });
businessRuleSchema.index({ createdBy: 1 });
businessRuleSchema.index({ isActive: 1 });
businessRuleSchema.index({ enabled: 1 });
businessRuleSchema.index({ priority: 1 });
businessRuleSchema.index({ createdAt: -1 });
businessRuleSchema.index({ tags: 1 });
businessRuleSchema.index({ lastExecutedAt: -1 });
businessRuleSchema.index({ category: 1 });
businessRuleSchema.index({ scope: 1 });

// Text search index for name, description, and dataObject
businessRuleSchema.index({
  name: "text",
  description: "text",
  dataObject: "text"
});

// Virtual for rule age (days since creation)
businessRuleSchema.virtual("ageInDays").get(function () {
  if (this.createdAt) {
    return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Virtual for rule complexity score
businessRuleSchema.virtual("complexityScore").get(function () {
  let score = 0;
  score += this.conditionCount * 2;
  score += this.actionCount * 1;
  score += this.decisionTable.length * 3;
  score += this.checkTable.length * 1;
  if (this.expression) score += 5;
  if (this.regexPattern) score += 3;
  return score;
});

// Virtual for success rate
businessRuleSchema.virtual("successRate").get(function () {
  if (this.executionCount === 0) return 0;
  return Math.round((this.successCount / this.executionCount) * 100);
});

// Virtual for rule effectiveness
businessRuleSchema.virtual("isEffective").get(function () {
  return this.successRate >= 80 && this.executionCount > 0;
});

// Ensure virtual fields are serialized
businessRuleSchema.set("toJSON", { virtuals: true });
businessRuleSchema.set("toObject", { virtuals: true });

// Pre-save middleware to update statistics
businessRuleSchema.pre("save", function (next) {
  // Update condition count
  this.conditionCount = this.conditions.length;
  
  // Update action count
  this.actionCount = this.actions.length;
  
  // Update lastExecutedAt when executionCount changes
  if (this.isModified("executionCount")) {
    this.lastExecutedAt = new Date();
  }
  
  next();
});

// Method to increment execution count
businessRuleSchema.methods.incrementExecution = function(success = true) {
  this.executionCount += 1;
  if (success) {
    this.successCount += 1;
  } else {
    this.failureCount += 1;
  }
  this.lastExecutedAt = new Date();
  return this.save();
};

// Method to check if user has permission
businessRuleSchema.methods.hasPermission = function(userId, action) {
  const permissions = this.permissions[action] || [];
  return permissions.includes(userId) || permissions.includes('*');
};

// Method to evaluate rule conditions
businessRuleSchema.methods.evaluateConditions = function(data) {
  if (this.conditions.length === 0) return true;
  
  let result = true;
  let logicalOperator = "AND";
  
  for (let i = 0; i < this.conditions.length; i++) {
    const condition = this.conditions[i];
    const fieldValue = data[condition.field];
    let conditionResult = false;
    
    switch (condition.operator) {
      case "equals":
        conditionResult = fieldValue === condition.value;
        break;
      case "notEquals":
        conditionResult = fieldValue !== condition.value;
        break;
      case "greaterThan":
        conditionResult = fieldValue > condition.value;
        break;
      case "greaterThanOrEqual":
        conditionResult = fieldValue >= condition.value;
        break;
      case "lessThan":
        conditionResult = fieldValue < condition.value;
        break;
      case "lessThanOrEqual":
        conditionResult = fieldValue <= condition.value;
        break;
      case "contains":
        conditionResult = String(fieldValue).includes(String(condition.value));
        break;
      case "notContains":
        conditionResult = !String(fieldValue).includes(String(condition.value));
        break;
      case "startsWith":
        conditionResult = String(fieldValue).startsWith(String(condition.value));
        break;
      case "endsWith":
        conditionResult = String(fieldValue).endsWith(String(condition.value));
        break;
      case "isEmpty":
        conditionResult = !fieldValue || fieldValue === "";
        break;
      case "isNotEmpty":
        conditionResult = fieldValue && fieldValue !== "";
        break;
      case "isNull":
        conditionResult = fieldValue === null;
        break;
      case "isNotNull":
        conditionResult = fieldValue !== null;
        break;
      case "in":
        conditionResult = Array.isArray(condition.value) && condition.value.includes(fieldValue);
        break;
      case "notIn":
        conditionResult = Array.isArray(condition.value) && !condition.value.includes(fieldValue);
        break;
      case "regex":
        conditionResult = new RegExp(condition.value).test(String(fieldValue));
        break;
    }
    
    if (i === 0) {
      result = conditionResult;
    } else {
      if (logicalOperator === "AND") {
        result = result && conditionResult;
      } else if (logicalOperator === "OR") {
        result = result || conditionResult;
      } else if (logicalOperator === "NOT") {
        result = !conditionResult;
      }
    }
    
    logicalOperator = condition.logicalOperator;
  }
  
  return result;
};

// Method to execute rule actions
businessRuleSchema.methods.executeActions = function(data) {
  const results = [];
  
  for (const action of this.actions) {
    const result = {
      actionId: action.id,
      type: action.type,
      success: false,
      message: ""
    };
    
    try {
      switch (action.type) {
        case "setField":
          data[action.field] = action.value;
          result.success = true;
          result.message = `Field ${action.field} set to ${action.value}`;
          break;
        case "clearField":
          data[action.field] = null;
          result.success = true;
          result.message = `Field ${action.field} cleared`;
          break;
        case "showField":
          // Implementation depends on UI framework
          result.success = true;
          result.message = `Field ${action.field} shown`;
          break;
        case "hideField":
          // Implementation depends on UI framework
          result.success = true;
          result.message = `Field ${action.field} hidden`;
          break;
        case "enableField":
          // Implementation depends on UI framework
          result.success = true;
          result.message = `Field ${action.field} enabled`;
          break;
        case "disableField":
          // Implementation depends on UI framework
          result.success = true;
          result.message = `Field ${action.field} disabled`;
          break;
        case "setRequired":
          // Implementation depends on UI framework
          result.success = true;
          result.message = `Field ${action.field} set as required`;
          break;
        case "setOptional":
          // Implementation depends on UI framework
          result.success = true;
          result.message = `Field ${action.field} set as optional`;
          break;
        case "setReadonly":
          // Implementation depends on UI framework
          result.success = true;
          result.message = `Field ${action.field} set as readonly`;
          break;
        case "setEditable":
          // Implementation depends on UI framework
          result.success = true;
          result.message = `Field ${action.field} set as editable`;
          break;
        case "setValue":
          data[action.field] = action.value;
          result.success = true;
          result.message = `Value set for field ${action.field}`;
          break;
        case "showMessage":
          result.success = true;
          result.message = action.message || "Message displayed";
          break;
        case "hideMessage":
          result.success = true;
          result.message = "Message hidden";
          break;
        default:
          result.success = false;
          result.message = `Action type ${action.type} not implemented`;
      }
    } catch (error) {
      result.success = false;
      result.message = error.message;
    }
    
    results.push(result);
  }
  
  return results;
};

// Static method to find by data object
businessRuleSchema.statics.findByDataObject = function(dataObject) {
  return this.find({ dataObject, isActive: true, enabled: true });
};

// Static method to find by type
businessRuleSchema.statics.findByType = function(type) {
  return this.find({ type, isActive: true, enabled: true });
};

// Static method to find by status
businessRuleSchema.statics.findByStatus = function(status) {
  return this.find({ status, isActive: true });
};

const BusinessRule = mongoose.model("BusinessRule", businessRuleSchema);

module.exports = BusinessRule;
