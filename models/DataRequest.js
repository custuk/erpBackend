const mongoose = require("mongoose");

// Use Mixed type for requestItems to support dynamic schemas
// This allows different structures for Plant Maintenance, Material Request, etc.
const dataRequestItemSchema = new mongoose.Schema(
  {},
  { _id: false, strict: false }
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
    // New fields for dynamic data format support
    dataFormat: {
      type: String,
      trim: true,
    },
    specificFields: {
      type: [String],
      default: [],
    },
    specificFieldsObject: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    // requestItems is now flexible to accept any structure
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
        "dc_rejected",
        "dc_referback",
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
    referbackReason: {
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
// Indexes for common fields that may exist in requestItems (optional, won't fail if field doesn't exist)
// Note: MongoDB will only index documents that have these fields

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
