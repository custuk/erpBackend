const mongoose = require("mongoose");

const materialItemSchema = new mongoose.Schema(
  {
    materialId: {
      type: String,
      required: [true, "Material ID is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    uom: {
      type: String,
      required: [true, "UOM is required"],
      trim: true,
    },
    materialType: {
      type: String,
      required: [true, "Material Type is required"],
      trim: true,
    },
    materialGroup: {
      type: String,
      required: [true, "Material Group is required"],
      trim: true,
    },
    action: {
      type: String,
      required: [true, "Action is required"],
      enum: ["Create", "Update", "Delete"],
      default: "Create",
    },
    setupType: {
      type: String,
      required: [true, "Setup Type is required"],
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
  },
  { _id: false }
);

const materialRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: [true, "Request ID is required"],
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
    materialItems: {
      type: [materialItemSchema],
      required: [true, "At least one material item is required"],
      validate: {
        validator: function (items) {
          return items && items.length > 0;
        },
        message: "At least one material item is required",
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
      ],
      default: "draft",
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
  },
  {
    timestamps: true,
    collection: "matDataRec", // This ensures the collection name is 'matDataRec'
  }
);

// Indexes for better query performance
materialRequestSchema.index({ requestId: 1 });
materialRequestSchema.index({ requesterId: 1 });
materialRequestSchema.index({ status: 1 });
materialRequestSchema.index({ createdAt: -1 });

// Pre-save middleware to handle setup type specific validations for each material item
materialRequestSchema.pre("save", function (next) {
  // Validate each material item's setup type specific fields
  for (let i = 0; i < this.materialItems.length; i++) {
    const item = this.materialItems[i];
    console.log(
      `SetupType >> Item ${i}: setupType=${item.setupType}, location=${item.location}, fromLocation=${item.fromLocation}, toLocation=${item.toLocation}`
    );

    if (item.setupType === "SingleLocation" && !item.location) {
      return next(
        new Error(
          `Location is required for Single Location setup in material item ${
            i + 1
          }`
        )
      );
    }

    if (
      item.setupType === "SupplyChainRoute" &&
      (!item.fromLocation || !item.toLocation)
    ) {
      return next(
        new Error(
          `From Location and To Location are required for Supply Chain Route setup in material item ${
            i + 1
          }`
        )
      );
    }
  }
  next();
});

// Virtual for total material items count
materialRequestSchema.virtual("totalMaterialItems").get(function () {
  return this.materialItems ? this.materialItems.length : 0;
});

// Ensure virtual fields are serialized
materialRequestSchema.set("toJSON", { virtuals: true });
materialRequestSchema.set("toObject", { virtuals: true });

const MaterialRequest = mongoose.model(
  "MaterialRequest",
  materialRequestSchema
);

module.exports = MaterialRequest;
