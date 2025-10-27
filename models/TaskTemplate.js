const mongoose = require("mongoose");


// Schema for items (tasks and data objects)
const itemSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: [true, "Item ID is required"],
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Item type is required"],
      enum: ["task", "dataObject"],
      trim: true,
    },
    sequence: {
      type: Number,
      required: [true, "Sequence is required"],
      min: [1, "Sequence must be at least 1"],
    },
    mandatory: {
      type: Boolean,
      default: true,
    },
    dependency: {
      type: String,
      default: null,
      trim: true,
    },
    parallelExecution: {
      type: Boolean,
      default: false,
    },
    estimatedDuration: {
      type: Number,
      default: 0,
      min: [0, "Duration cannot be negative"],
    },
    assignedTo: {
      type: String,
      trim: true,
      default: "",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    // Additional fields for data objects
    selectedForm: {
      type: String,
      trim: true,
    },
    formId: {
      type: String,
      trim: true,
    },
    formName: {
      type: String,
      trim: true,
    },
    // Additional fields for tasks
    category: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);


// Main task template schema
const taskTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Template name is required"],
      trim: true,
      maxlength: [100, "Template name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    templateType: {
      type: String,
      required: [true, "Template type is required"],
      enum: [
        "Task and Data Object Template",
        "Workflow Template",
        "Process Template",
        "Approval Template",
        "Integration Template",
      ],
      default: "Task and Data Object Template",
    },
    status: {
      type: String,
      enum: ["draft", "active", "inactive", "archived"],
      default: "draft",
    },
    items: {
      type: [itemSchema],
      required: [true, "At least one item is required"],
      validate: {
        validator: function(items) {
          return items && items.length > 0;
        },
        message: "At least one item is required"
      }
    },
    tags: {
      type: [String],
      default: [],
    },
    createdAt: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: String,
      trim: true,
    },
    updatedAt: {
      type: String,
      trim: true,
    },
    updatedBy: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "taskTemplate",
  }
);

// Indexes for better query performance
taskTemplateSchema.index({ name: 1 });
taskTemplateSchema.index({ templateType: 1 });
taskTemplateSchema.index({ status: 1 });
taskTemplateSchema.index({ createdAt: -1 });
taskTemplateSchema.index({ "items.id": 1 });
taskTemplateSchema.index({ "items.type": 1 });
taskTemplateSchema.index({ tags: 1 });

// Text search index for name and description
taskTemplateSchema.index({
  name: "text",
  description: "text",
  "items.name": "text",
});

// Virtual for total items count
taskTemplateSchema.virtual("totalItems").get(function () {
  return this.items ? this.items.length : 0;
});

// Virtual for total tasks count
taskTemplateSchema.virtual("totalTasks").get(function () {
  return this.items ? this.items.filter(item => item.type === 'task').length : 0;
});

// Virtual for total data objects count
taskTemplateSchema.virtual("totalDataObjects").get(function () {
  return this.items ? this.items.filter(item => item.type === 'dataObject').length : 0;
});

// Virtual for template complexity
taskTemplateSchema.virtual("complexity").get(function () {
  const itemCount = this.items ? this.items.length : 0;
  const taskCount = this.items ? this.items.filter(item => item.type === 'task').length : 0;
  const dataObjectCount = this.items ? this.items.filter(item => item.type === 'dataObject').length : 0;

  if (itemCount <= 3) return "simple";
  if (itemCount <= 6) return "medium";
  return "complex";
});

// Ensure virtual fields are serialized
taskTemplateSchema.set("toJSON", { virtuals: true });
taskTemplateSchema.set("toObject", { virtuals: true });

// Pre-save middleware to validate template structure
taskTemplateSchema.pre("save", function (next) {
  // Validate that all dependencies reference existing items
  if (this.items && this.items.length > 0) {
    const itemIds = this.items.map((item) => item.id);
    
    for (const item of this.items) {
      if (item.dependency && !itemIds.includes(item.dependency)) {
        return next(
          new Error(`Item ${item.id} has dependency on non-existent item: ${item.dependency}`)
        );
      }
    }
    
    // Validate sequence numbers are unique
    const sequences = this.items.map(item => item.sequence);
    const uniqueSequences = [...new Set(sequences)];
    if (sequences.length !== uniqueSequences.length) {
      return next(
        new Error('Item sequence numbers must be unique')
      );
    }
  }

  next();
});

const TaskTemplate = mongoose.model("TaskTemplate", taskTemplateSchema);

module.exports = TaskTemplate;
