const mongoose = require("mongoose");

const nodeExecutionSchema = new mongoose.Schema(
  {
    nodeId: { type: String, required: true, trim: true },
    nodeType: { type: String, trim: true },
    status: {
      type: String,
      enum: [
        "pending",
        "running",
        "completed",
        "failed",
        "cancelled",
        "waiting",
      ],
      default: "pending",
    },
    attempt: { type: Number, default: 1 },
    startedAt: Date,
    completedAt: Date,
    duration: Number,
    input: { type: mongoose.Schema.Types.Mixed, default: null },
    output: { type: mongoose.Schema.Types.Mixed, default: null },
    error: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { _id: false, strict: false }
);

const parallelExecutionSchema = new mongoose.Schema(
  {
    parallelExecutionId: { type: String, required: true, trim: true },
    nodeId: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "running", "completed", "failed", "cancelled"],
      default: "pending",
    },
    startedAt: Date,
    completedAt: Date,
    branches: [
      {
        branchId: { type: String, required: true, trim: true },
        nodes: { type: [String], default: [] },
        status: {
          type: String,
          enum: ["pending", "running", "completed", "failed", "cancelled"],
          default: "pending",
        },
        startedAt: Date,
        completedAt: Date,
        result: { type: mongoose.Schema.Types.Mixed, default: null },
        error: { type: mongoose.Schema.Types.Mixed, default: null },
      },
    ],
  },
  { _id: false, strict: false }
);

const mapExecutionSchema = new mongoose.Schema(
  {
    mapExecutionId: { type: String, required: true, trim: true },
    nodeId: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "running", "completed", "failed", "cancelled"],
      default: "pending",
    },
    totalItems: { type: Number, default: 0 },
    processedItems: { type: Number, default: 0 },
    failedItems: { type: Number, default: 0 },
    maxConcurrency: { type: Number },
    itemsPath: { type: String },
    iteratorNodes: { type: [String], default: [] },
    results: { type: [mongoose.Schema.Types.Mixed], default: [] },
    startedAt: Date,
    completedAt: Date,
  },
  { _id: false, strict: false }
);

const waitStateSchema = new mongoose.Schema(
  {
    waitId: { type: String, required: true, trim: true },
    nodeId: { type: String, required: true, trim: true },
    waitType: {
      type: String,
      enum: ["seconds", "timestamp", "until"],
      required: true,
    },
    status: {
      type: String,
      enum: ["waiting", "completed", "cancelled"],
      default: "waiting",
    },
    seconds: Number,
    timestamp: Date,
    untilExpression: String,
    scheduledAt: { type: Date, default: () => new Date() },
    resumeAt: Date,
    resumedAt: Date,
    workflowData: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { _id: false, strict: false }
);

const workflowExecutionSchema = new mongoose.Schema(
  {
    workflowId: { type: mongoose.Schema.Types.ObjectId, ref: "Workflow", required: true },
    workflowVersion: { type: String, trim: true },
    status: {
      type: String,
      enum: ["pending", "running", "completed", "failed", "cancelled", "waiting"],
      default: "running",
    },
    context: {
      variables: { type: mongoose.Schema.Types.Mixed, default: {} },
      data: { type: mongoose.Schema.Types.Mixed, default: {} },
      userId: { type: String, trim: true },
      triggerType: { type: String, trim: true },
    },
    currentNodeIds: { type: [String], default: [] },
    completedNodeIds: { type: [String], default: [] },
    failedNodeIds: { type: [String], default: [] },
    waitingNodeIds: { type: [String], default: [] },
    nodeExecutions: { type: [nodeExecutionSchema], default: [] },
    parallelExecutions: { type: [parallelExecutionSchema], default: [] },
    mapExecutions: { type: [mapExecutionSchema], default: [] },
    waitStates: { type: [waitStateSchema], default: [] },
    startedAt: { type: Date, default: () => new Date() },
    completedAt: Date,
    duration: Number,
    triggeredBy: { type: String, trim: true },
    error: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

workflowExecutionSchema.index({ workflowId: 1, status: 1 });
workflowExecutionSchema.index({ "context.userId": 1 });

const WorkflowExecution = mongoose.model("WorkflowExecution", workflowExecutionSchema);

module.exports = WorkflowExecution;

