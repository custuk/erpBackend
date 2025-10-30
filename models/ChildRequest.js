const mongoose = require("mongoose");

const childrequestItemschema = new mongoose.Schema(
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
        assignedTasks: {},
        quantity: {
            type: Number,
            default: 1,
            min: [1, "Quantity must be at least 1"],
        },
        unitPrice: {
            type: Number,
            min: [0, "Unit price cannot be negative"],
        },
        totalPrice: {
            type: Number,
            min: [0, "Total price cannot be negative"],
        },
    },
    { _id: false }
);

const childRequestSchema = new mongoose.Schema(
    {
        childRequestId: {
            type: String,
            required: [true, "Child Request ID is required"],
            trim: true,
            unique: true,
        },
        parentRequestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "MaterialRequest",
            required: [true, "Parent Request ID is required"],
        },
        materialId: {
            type: String,
            required: [true, "Material ID String is required"],
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Material Description is required"],
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
            trim: true,
        },
        setupType: {
            type: String,
            required: [true, "Setup Type is required"],
            trim: true,
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
        assignedTasks: {
            type: mongoose.Schema.Types.Mixed,
            required: false,
        },
        estimatedCompletionDate: {
            type: Date,
        },
        actualCompletionDate: {
            type: Date,
        },
    },
    {
        timestamps: true,
        collection: "childRequests", // This ensures the collection name is 'childRequests'
    }
);

// Indexes for better query performance
childRequestSchema.index({ childRequestId: 1 });
childRequestSchema.index({ parentRequestId: 1 });
childRequestSchema.index({ parentRequestIdString: 1 });
childRequestSchema.index({ requesterId: 1 });
childRequestSchema.index({ status: 1 });
childRequestSchema.index({ priority: 1 });
childRequestSchema.index({ createdAt: -1 });

// Pre-save middleware to handle setup type specific validations
childRequestSchema.pre("save", function (next) {
    // Validate setup type specific fields at header level
    console.log(
        `ChildRequest SetupType >> setupType=${this.setupType}, location=${this.location}, fromLocation=${this.fromLocation}, toLocation=${this.toLocation}`
    );

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

    // Calculate total price if unit price and quantity are provided
    if (this.unitPrice && this.quantity) {
        this.totalPrice = this.unitPrice * this.quantity;
    }

    // Validate supply chain route data locations if present
    if (this.supplyChainRouteData && this.supplyChainRouteData.locations && Array.isArray(this.supplyChainRouteData.locations)) {
        for (let i = 0; i < this.supplyChainRouteData.locations.length; i++) {
            const location = this.supplyChainRouteData.locations[i];
            console.log(
                `ChildRequest Location >> Location ${i}: type=${location.type}, id=${location.id}, name=${location.name}`
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

    next();
});

// Virtual for total material items count
childRequestSchema.virtual("totalrequestItems").get(function () {
    return this.requestItems ? this.requestItems.length : 0;
});

// Virtual for total estimated cost
childRequestSchema.virtual("totalEstimatedCost").get(function () {
    if (!this.requestItems) return 0;
    return this.requestItems.reduce((total, item) => {
        return total + (item.totalPrice || 0);
    }, 0);
});

// Ensure virtual fields are serialized
childRequestSchema.set("toJSON", { virtuals: true });
childRequestSchema.set("toObject", { virtuals: true });

// Static method to generate child request ID
childRequestSchema.statics.generateChildRequestId = function (parentRequestId) {
  const randomId = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `${parentRequestId}-${randomId}`;
};

const ChildRequest = mongoose.model("ChildRequest", childRequestSchema);

module.exports = ChildRequest;
