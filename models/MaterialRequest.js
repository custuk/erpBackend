const mongoose = require("mongoose");

const materialRequestItemSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: [true, "Action is required"],
      enum: ["Create", "Update", "Delete"],
      default: "Create",
    },
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
    supplyChainRoute: {
      type: String,
      trim: true,
    },
    supplyChainRouteData: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },
    assignedTasks: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const materialRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: [true, "Request ID is required"],
      trim: true,
      unique: true,
    },
    requestType: {
      type: String,
      required: false,
      trim: true,
    },
    requestDescription: {
      type: String,
      required: false,
      trim: true,
    },
    businessJustification: {
      type: String,
      required: false,
      trim: true,
    },
    requesterId: {
      type: String,
      required: false,
      trim: true,
    },
    parentRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MaterialRequest",
      required: false,
    },
    // Support both header-level fields (for backward compatibility) and requestItems array
    materialId: {
      type: String,
      required: false,
      trim: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    uom: {
      type: String,
      required: false,
      trim: true,
    },
    materialType: {
      type: String,
      required: false,
      trim: true,
    },
    materialGroup: {
      type: String,
      required: false,
      trim: true,
    },
    action: {
      type: String,
      required: false,
      enum: ["Create", "Update", "Delete"],
    },
    setupType: {
      type: String,
      required: false,
      enum: ["SingleLocation", "SupplyChainRoute"],
    },
    location: {
      type: String,
      required: false,
      trim: true,
    },
    fromLocation: {
      type: String,
      required: false,
      trim: true,
    },
    toLocation: {
      type: String,
      required: false,
      trim: true,
    },
    supplyChainRoute: {
      type: String,
      required: false,
      trim: true,
    },
    supplyChainRouteData: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },
    assignedTasks: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },
    requestItems: {
      type: [materialRequestItemSchema],
      required: false,
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
    tags: {
      type: [String],
      default: [],
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
    collection: "materialRequest", // This ensures the collection name is 'materialRequest'
  }
);

// Indexes for better query performance
materialRequestSchema.index({ requestId: 1 });
materialRequestSchema.index({ parentRequestId: 1 });
materialRequestSchema.index({ requesterId: 1 });
materialRequestSchema.index({ status: 1 });
materialRequestSchema.index({ priority: 1 });
materialRequestSchema.index({ requestType: 1 });
materialRequestSchema.index({ createdAt: -1 });
materialRequestSchema.index({ materialId: 1 });
materialRequestSchema.index({ materialType: 1 });
materialRequestSchema.index({ materialGroup: 1 });
materialRequestSchema.index({ "requestItems.materialId": 1 });
materialRequestSchema.index({ "requestItems.materialType": 1 });

// Pre-save middleware to handle setup type specific validations
materialRequestSchema.pre("save", function (next) {
  // If requestItems array exists, validate items
  if (this.requestItems && Array.isArray(this.requestItems) && this.requestItems.length > 0) {
    for (let i = 0; i < this.requestItems.length; i++) {
      const item = this.requestItems[i];
      console.log(
        `MaterialRequest Item ${i} SetupType >> setupType=${item.setupType}, location=${item.location}, fromLocation=${item.fromLocation}, toLocation=${item.toLocation}`
      );

      // Only validate if setupType is provided
      if (item.setupType) {
        // Validate setup type specific fields
        if (item.setupType === "SingleLocation" && !item.location) {
          return next(
            new Error(
              `Location is required for Single Location setup in item ${i + 1}`
            )
          );
        }

        if (
          item.setupType === "SupplyChainRoute" &&
          (!item.fromLocation || !item.toLocation)
        ) {
          return next(
            new Error(
              `From Location and To Location are required for Supply Chain Route setup in item ${i + 1}`
            )
          );
        }
      }

      // Validate supply chain route data locations if present in item
      if (item.supplyChainRouteData && item.supplyChainRouteData.locations && Array.isArray(item.supplyChainRouteData.locations)) {
        for (let j = 0; j < item.supplyChainRouteData.locations.length; j++) {
          const location = item.supplyChainRouteData.locations[j];
          console.log(
            `MaterialRequest Item ${i} Location ${j} >> type=${location.type}, id=${location.id}, name=${location.name}`
          );

          // Validate location has required fields
          if (!location.id) {
            return next(
              new Error(
                `Location ID is required for location ${j + 1} in item ${i + 1}`
              )
            );
          }

          if (!location.name) {
            return next(
              new Error(
                `Location name is required for location ${j + 1} in item ${i + 1}`
              )
            );
          }

          if (!location.type) {
            return next(
              new Error(
                `Location type is required for location ${j + 1} in item ${i + 1}`
              )
            );
          }
        }
      }
    }
  } else if (this.setupType) {
    // Validate header-level fields (backward compatibility) - only if setupType is provided
    console.log(
      `MaterialRequest Header SetupType >> setupType=${this.setupType}, location=${this.location}, fromLocation=${this.fromLocation}, toLocation=${this.toLocation}`
    );

    // Validate setup type specific fields at header level
    if (this.setupType === "SingleLocation" && !this.location) {
      return next(
        new Error(
          `Location is required for Single Location setup`
        )
      );
    }

    if (
      this.setupType === "SupplyChainRoute" &&
      (!this.fromLocation || !this.toLocation)
    ) {
      return next(
        new Error(
          `From Location and To Location are required for Supply Chain Route setup`
        )
      );
    }

    // Validate supply chain route data locations if present at header level
    if (this.supplyChainRouteData && this.supplyChainRouteData.locations && Array.isArray(this.supplyChainRouteData.locations)) {
      for (let i = 0; i < this.supplyChainRouteData.locations.length; i++) {
        const location = this.supplyChainRouteData.locations[i];
        console.log(
          `MaterialRequest Location >> Location ${i}: type=${location.type}, id=${location.id}, name=${location.name}`
        );

        // Validate location has required fields
        if (!location.id) {
          return next(
            new Error(
              `Location ID is required for location ${i + 1}`
            )
          );
        }

        if (!location.name) {
          return next(
            new Error(
              `Location name is required for location ${i + 1}`
            )
          );
        }

        if (!location.type) {
          return next(
            new Error(
              `Location type is required for location ${i + 1}`
            )
          );
        }
      }
    }
  }

  next();
});

// Virtual for total material items count
materialRequestSchema.virtual("totalMaterialItems").get(function () {
  if (this.requestItems && Array.isArray(this.requestItems) && this.requestItems.length > 0) {
    return this.requestItems.length;
  }
  // If header-level fields exist, count as 1
  if (this.materialId) {
    return 1;
  }
  return 0;
});

// Ensure virtual fields are serialized
materialRequestSchema.set("toJSON", { virtuals: true });
materialRequestSchema.set("toObject", { virtuals: true });

const MaterialRequest = mongoose.model(
  "MaterialRequest",
  materialRequestSchema
);

module.exports = MaterialRequest;