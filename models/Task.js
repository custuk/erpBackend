const mongoose = require("mongoose");

// Schema for BAPI parameters
const bapiParametersSchema = new mongoose.Schema(
  {
    // Flexible schema for BAPI parameters
  },
  { strict: false }
);

// Main task schema
const taskSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: [true, "Task ID is required"],
      unique: true,
      trim: true
    },
    name: {
      type: String,
      trim: true,
      maxlength: [200, "Task name cannot exceed 200 characters"]
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"]
    },
    dataObject: {
      type: String,
      trim: true
    },
    taskType: {
      type: String,
      required: [true, "Task type is required"],
      enum: [
        "manual",
        "automatic",
        "semi-automatic",
        "scheduled",
        "event-driven",
        "api-call",
        "data-processing",
        "notification",
        "approval",
        "validation",
        "integration",
        "workflow",
        "system",
        "quality",
        "planning",
        "execution",
        "warehouse"
      ],
      default: "manual"
    },
    communicationSubType: {
      type: String,
      trim: true
    },
    assignedTo: {
      type: String,
      trim: true
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical", "Urgent"],
      default: "Medium"
    },
    icon: {
      type: String,
      trim: true,
      default: "list"
    },
    allowedStatuses: {
      type: [String],
      default: ["draft", "pending", "in_progress", "completed", "cancelled", "failed"]
    },
    status: {
      type: String,
      enum: ["draft", "pending", "in_progress", "completed", "cancelled", "failed", "on_hold"],
      default: "draft"
    },
    sla: {
      type: String,
      trim: true
    },
    retryOnFailure: {
      type: Boolean,
      default: false
    },
    sendNotifications: {
      type: Boolean,
      default: false
    },
    requiresApproval: {
      type: Boolean,
      default: false
    },
    enableLogging: {
      type: Boolean,
      default: true
    },
    retryCount: {
      type: Number,
      default: 0,
      min: [0, "Retry count cannot be negative"]
    },
    timeout: {
      type: Number,
      default: 30,
      min: [1, "Timeout must be at least 1 minute"]
    },
    executionOrder: {
      type: Number,
      default: 1,
      min: [1, "Execution order must be at least 1"]
    },
    dependencies: {
      type: String,
      trim: true
    },
    bapiParameters: {
      type: bapiParametersSchema,
      default: null
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
    dueDate: {
      type: Date
    },
    completedAt: {
      type: Date
    },
    startedAt: {
      type: Date
    },
    lastModifiedBy: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true,
    collection: "tasks"
  }
);

// Indexes for better query performance
taskSchema.index({ id: 1 });
taskSchema.index({ name: 1 });
taskSchema.index({ taskType: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ isActive: 1 });
taskSchema.index({ createdAt: -1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ tags: 1 });

// Text search index for name and description
taskSchema.index({
  name: "text",
  description: "text",
  dataObject: "text"
});

// Virtual for task duration (if started and completed)
taskSchema.virtual("duration").get(function () {
  if (this.startedAt && this.completedAt) {
    return Math.round((this.completedAt - this.startedAt) / 1000 / 60); // duration in minutes
  }
  return null;
});

// Virtual for task age (days since creation)
taskSchema.virtual("ageInDays").get(function () {
  if (this.createdAt) {
    return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Virtual for overdue status
taskSchema.virtual("isOverdue").get(function () {
  if (this.dueDate && this.status !== "completed" && this.status !== "cancelled") {
    return new Date() > this.dueDate;
  }
  return false;
});

// Ensure virtual fields are serialized
taskSchema.set("toJSON", { virtuals: true });
taskSchema.set("toObject", { virtuals: true });

// Pre-save middleware to update timestamps based on status changes
taskSchema.pre("save", function (next) {
  // Update startedAt when status changes to in_progress
  if (this.isModified("status") && this.status === "in_progress" && !this.startedAt) {
    this.startedAt = new Date();
  }
  
  // Update completedAt when status changes to completed
  if (this.isModified("status") && this.status === "completed" && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  next();
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
