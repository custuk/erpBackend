const mongoose = require("mongoose");

const vendorItemSchema = new mongoose.Schema(
  {
    requestAction: {
      type: String,
      required: [true, "Request Action is required"],
      enum: ["Create", "Update", "Delete"],
      default: "Create",
    },
    vendorId: {
      type: String,
      required: [true, "Vendor ID is required"],
      trim: true,
    },
    accountGroup: {
      type: String,
      required: [true, "Account Group is required"],
      trim: true,
    },
    vendorName1: {
      type: String,
      required: [true, "Vendor Name is required"],
      trim: true,
    },
    companyCode: {
      type: String,
      required: [true, "Company Code is required"],
      trim: true,
    },
    purchasingOrg: {
      type: String,
      required: [true, "Purchasing Organization is required"],
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const vendorMasterRequestSchema = new mongoose.Schema(
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
      type: [vendorItemSchema],
      required: [true, "At least one vendor item is required"],
      validate: {
        validator: function (items) {
          return items && items.length > 0;
        },
        message: "At least one vendor item is required",
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
    collection: "vendorMasterRequests",
  }
);

// Indexes for better query performance
vendorMasterRequestSchema.index({ requestId: 1 });
vendorMasterRequestSchema.index({ requesterId: 1 });
vendorMasterRequestSchema.index({ status: 1 });
vendorMasterRequestSchema.index({ priority: 1 });
vendorMasterRequestSchema.index({ createdAt: -1 });
vendorMasterRequestSchema.index({ "requestItems.vendorId": 1 });
vendorMasterRequestSchema.index({ "requestItems.accountGroup": 1 });

// Virtual for total vendor items count
vendorMasterRequestSchema.virtual("totalVendorItems").get(function () {
  return this.requestItems ? this.requestItems.length : 0;
});

// Ensure virtual fields are serialized
vendorMasterRequestSchema.set("toJSON", { virtuals: true });
vendorMasterRequestSchema.set("toObject", { virtuals: true });

// Static method to generate request ID
vendorMasterRequestSchema.statics.generateRequestId = function () {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomStr = Math.random().toString(36).substr(2, 5).toUpperCase();
  return `REQ-${timestamp}-${randomStr}`;
};

const VendorMasterRequest = mongoose.model(
  "VendorMasterRequest",
  vendorMasterRequestSchema
);

module.exports = VendorMasterRequest;
