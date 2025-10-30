const mongoose = require("mongoose");

const glAccountItemSchema = new mongoose.Schema(
  {
    requestAction: {
      type: String,
      required: [true, "Request Action is required"],
      enum: ["Create", "Update", "Delete"],
      default: "Create",
    },
    glAccountNumber: {
      type: String,
      required: [true, "GL Account Number is required"],
      trim: true,
    },
    accountType: {
      type: String,
      required: [true, "Account Type is required"],
      trim: true,
    },
    accountGroup: {
      type: String,
      required: [true, "Account Group is required"],
      trim: true,
    },
    glAccountNameShort: {
      type: String,
      required: [true, "GL Account Name is required"],
      trim: true,
    },
    chartOfAccounts: {
      type: String,
      required: [true, "Chart of Accounts is required"],
      trim: true,
    },
    companyCode: {
      type: String,
      required: [true, "Company Code is required"],
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const glAccountRequestSchema = new mongoose.Schema(
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
      type: [glAccountItemSchema],
      required: [true, "At least one GL account item is required"],
      validate: {
        validator: function (items) {
          return items && items.length > 0;
        },
        message: "At least one GL account item is required",
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
    collection: "glAccountRequests",
  }
);

// Indexes for better query performance
glAccountRequestSchema.index({ requestId: 1 });
glAccountRequestSchema.index({ requesterId: 1 });
glAccountRequestSchema.index({ status: 1 });
glAccountRequestSchema.index({ priority: 1 });
glAccountRequestSchema.index({ createdAt: -1 });
glAccountRequestSchema.index({ "requestItems.glAccountNumber": 1 });
glAccountRequestSchema.index({ "requestItems.accountGroup": 1 });
glAccountRequestSchema.index({ "requestItems.chartOfAccounts": 1 });

// Virtual for total GL account items count
glAccountRequestSchema.virtual("totalGLAccountItems").get(function () {
  return this.requestItems ? this.requestItems.length : 0;
});

// Ensure virtual fields are serialized
glAccountRequestSchema.set("toJSON", { virtuals: true });
glAccountRequestSchema.set("toObject", { virtuals: true });

// Static method to generate request ID
glAccountRequestSchema.statics.generateRequestId = function () {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomStr = Math.random().toString(36).substr(2, 5).toUpperCase();
  return `REQ-${timestamp}-${randomStr}`;
};

const GLAccountRequest = mongoose.model(
  "GLAccountRequest",
  glAccountRequestSchema
);

module.exports = GLAccountRequest;
