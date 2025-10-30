const mongoose = require("mongoose");

const customerItemSchema = new mongoose.Schema(
  {
    requestAction: {
      type: String,
      required: [true, "Request Action is required"],
      enum: ["Create", "Update", "Delete"],
      default: "Create",
    },
    customerId: {
      type: String,
      required: [true, "Customer ID is required"],
      trim: true,
    },
    accountGroup: {
      type: String,
      required: [true, "Account Group is required"],
      trim: true,
    },
    customerRoles: {
      type: String,
      required: false,
      trim: true,
    },
    name1: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    companyCode: {
      type: String,
      required: [true, "Company Code is required"],
      trim: true,
    },
    salesOrg: {
      type: String,
      required: [true, "Sales Organization is required"],
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const customerMasterRequestSchema = new mongoose.Schema(
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
      type: [customerItemSchema],
      required: [true, "At least one customer item is required"],
      validate: {
        validator: function (items) {
          return items && items.length > 0;
        },
        message: "At least one customer item is required",
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
    collection: "customerMasterRequests",
  }
);

// Indexes for better query performance
customerMasterRequestSchema.index({ requestId: 1 });
customerMasterRequestSchema.index({ requesterId: 1 });
customerMasterRequestSchema.index({ status: 1 });
customerMasterRequestSchema.index({ priority: 1 });
customerMasterRequestSchema.index({ createdAt: -1 });
customerMasterRequestSchema.index({ "requestItems.customerId": 1 });
customerMasterRequestSchema.index({ "requestItems.accountGroup": 1 });

// Virtual for total customer items count
customerMasterRequestSchema.virtual("totalCustomerItems").get(function () {
  return this.requestItems ? this.requestItems.length : 0;
});

// Ensure virtual fields are serialized
customerMasterRequestSchema.set("toJSON", { virtuals: true });
customerMasterRequestSchema.set("toObject", { virtuals: true });

// Static method to generate request ID
customerMasterRequestSchema.statics.generateRequestId = function () {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomStr = Math.random().toString(36).substr(2, 5).toUpperCase();
  return `REQ-${timestamp}-${randomStr}`;
};

const CustomerMasterRequest = mongoose.model(
  "CustomerMasterRequest",
  customerMasterRequestSchema
);

module.exports = CustomerMasterRequest;
