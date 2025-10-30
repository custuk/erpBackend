const mongoose = require("mongoose");

const dataRequestItemSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: [true, "Action is required"],
      enum: ["Create", "Update", "Delete"],
      default: "Create",
    },
    materialId: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    uom: {
      type: String,
      trim: true,
    },
    materialType: {
      type: String,
      trim: true,
    },
    materialGroup: {
      type: String,
      trim: true,
    },
    setupType: {
      type: String,
      enum: ["SingleLocation", "SupplyChainRoute"],
      default: "SingleLocation",
    },
    location: {
      type: String,
      trim: true,
    },
    fromLocation: {
      type: String,
      trim: true,
    },
    toLocation: {
      type: String,
      trim: true,
    },
    supplyChainRoute: { type: String, trim: true },
    supplyChainRouteData: {},
    assignedTasks: {},
    notes: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const dataRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: [true, "Request ID is required"],
      trim: true,
      unique: true,
    },
    requestType: {
      type: String,
      required: [true, "Request Type is required"],
      trim: true,
    },
    requestDescription: {
      type: String,
      required: [true, "Request Description is required"],
      trim: true,
    },
    businessJustification: {
      type: String,
      required: [true, "Business Justification is required"],
      trim: true,
    },
    requesterId: {
      type: String,
      required: [true, "Requester ID is required"],
      trim: true,
    },
    requestItems: {
      type: [dataRequestItemSchema],
      required: [true, "At least one data request item is required"],
      validate: {
        validator: function (items) {
          return items && items.length > 0;
        },
        message: "At least one data request item is required",
      },
    },
    status: {
      type: String,
      enum: [
        "draft",
        "submitted",
        "approved",
        "rejected",
        "in_progress",
        "completed",
        "cancelled",
      ],
      default: "draft",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    submittedAt: {
      type: Date,
    },
    approvedBy: {
      type: String,
      trim: true,
    },
    approvedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    completedAt: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "dataRequests",
  }
);

// Indexes for better query performance
dataRequestSchema.index({ requestId: 1 });
dataRequestSchema.index({ requesterId: 1 });
dataRequestSchema.index({ status: 1 });
dataRequestSchema.index({ priority: 1 });
dataRequestSchema.index({ requestType: 1 });
dataRequestSchema.index({ createdAt: -1 });
dataRequestSchema.index({ "requestItems.materialId": 1 });
dataRequestSchema.index({ "requestItems.materialType": 1 });
dataRequestSchema.index({ "requestItems.materialGroup": 1 });

// Virtual for total data request items count
dataRequestSchema.virtual("totalRequestItems").get(function () {
  return this.requestItems ? this.requestItems.length : 0;
});

// Ensure virtual fields are serialized
dataRequestSchema.set("toJSON", { virtuals: true });
dataRequestSchema.set("toObject", { virtuals: true });

// Static method to generate request ID
dataRequestSchema.statics.generateRequestId = function () {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomStr = Math.random().toString(36).substr(2, 5).toUpperCase();
  return `REQ-${timestamp}-${randomStr}`;
};

const DataRequest = mongoose.model("DataRequest", dataRequestSchema);

module.exports = DataRequest;
