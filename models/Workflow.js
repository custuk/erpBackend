const mongoose = require("mongoose");

const workflowNodeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    name: { type: String, trim: true },
    config: { type: mongoose.Schema.Types.Mixed, default: {} },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: false, strict: false }
);

const workflowEdgeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true },
    source: { type: String, required: true, trim: true },
    target: { type: String, required: true, trim: true },
    condition: { type: mongoose.Schema.Types.Mixed, default: {} },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: false, strict: false }
);

const workflowSettingsSchema = new mongoose.Schema(
  {
    executionMode: {
      type: String,
      enum: ["synchronous", "asynchronous"],
      default: "synchronous",
    },
    timeout: { type: Number, min: 0 },
    retryPolicy: { type: mongoose.Schema.Types.Mixed, default: {} },
    errorHandling: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: false, strict: false }
);

const workflowSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ["draft", "active", "inactive", "archived"],
      default: "draft",
    },
    version: { type: String, default: "1.0.0" },
    workstream: { type: String, trim: true },
    category: { type: String, trim: true },
    nodes: { type: [workflowNodeSchema], default: [] },
    edges: { type: [workflowEdgeSchema], default: [] },
    settings: { type: workflowSettingsSchema, default: () => ({}) },
    tags: { type: [String], default: [] },
    createdBy: { type: String, trim: true },
    updatedBy: { type: String, trim: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

workflowSchema.index({ name: 1, version: 1 }, { unique: false });
workflowSchema.index({ status: 1, workstream: 1 });

const Workflow = mongoose.model("Workflow", workflowSchema);

module.exports = Workflow;

