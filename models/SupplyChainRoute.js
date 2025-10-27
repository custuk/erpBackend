const mongoose = require("mongoose");

// Schema for location attributes
const locationAttributesSchema = new mongoose.Schema(
  {
    // Flexible schema for any additional attributes
  },
  { strict: false }
);

// Schema for location coordinates and basic info
const locationSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: [true, "Location ID is required"],
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Location type is required"],
      enum: [
        "supplier",
        "customer",
        "other",
        "company-code",
        "purchasing-org",
        "sales-org",
        "distribution-channel",
        "3pl",
        "freight-forwarder",
        "customs-location",
        "free-trade-zone",
        "ship-to-party",
        "invoicing-party",
        "distribution-center",
        "cmo",
        "manufacturing",
        "warehouse",
        "distribution",
        "customer",
        "plant",
        "qa",
        "inspection",
        "storage",
        "port",
        "returns-center",
      ],
      trim: true,
    },
    x: {
      type: Number,
      required: [true, "X coordinate is required"],
    },
    y: {
      type: Number,
      required: [true, "Y coordinate is required"],
    },
    name: {
      type: String,
      required: [true, "Location name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    attributes: {
      type: locationAttributesSchema,
      default: {},
    },
  },
  { _id: false }
);

// Schema for connection attributes
const connectionAttributesSchema = new mongoose.Schema(
  {
    // Flexible schema for any additional connection attributes
  },
  { strict: false }
);

// Schema for connectors between locations
const connectorSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: [true, "Connector ID is required"],
      trim: true,
    },
    from: {
      type: String,
      required: [true, "From location is required"],
      trim: true,
    },
    to: {
      type: String,
      required: [true, "To location is required"],
      trim: true,
    },
    parentId: {
      type: String,
      required: [true, "Parent ID is required"],
      trim: true,
    },
    childId: {
      type: String,
      required: [true, "Child ID is required"],
      trim: true,
    },
    transportMode: {
      type: String,
      required: [true, "Transport mode is required"],
      enum: ["road", "rail", "air", "sea", "pipeline", "conveyor", "other"],
      default: "road",
    },
    distance: {
      type: Number,
      default: 0,
      min: [0, "Distance cannot be negative"],
    },
    duration: {
      type: Number,
      default: 0,
      min: [0, "Duration cannot be negative"],
    },
    cost: {
      type: Number,
      default: 0,
      min: [0, "Cost cannot be negative"],
    },
    attributes: {
      type: connectionAttributesSchema,
      default: {},
    },
  },
  { _id: false }
);

// Schema for hierarchical structure children
const hierarchicalChildSchema = new mongoose.Schema(
  {
    locationId: {
      type: String,
      required: [true, "Child location ID is required"],
      trim: true,
    },
    connectionId: {
      type: String,
      required: [true, "Connection ID is required"],
      trim: true,
    },
    transportMode: {
      type: String,
      required: [true, "Transport mode is required"],
      enum: ["road", "rail", "air", "sea", "pipeline", "conveyor", "other"],
    },
    distance: {
      type: Number,
      default: 0,
      min: [0, "Distance cannot be negative"],
    },
    duration: {
      type: Number,
      default: 0,
      min: [0, "Duration cannot be negative"],
    },
    cost: {
      type: Number,
      default: 0,
      min: [0, "Cost cannot be negative"],
    },
    attributes: {
      type: connectionAttributesSchema,
      default: {},
    },
  },
  { _id: false }
);

// Schema for hierarchical structure parent
const hierarchicalParentSchema = new mongoose.Schema(
  {
    locationId: {
      type: String,
      required: [true, "Parent location ID is required"],
      trim: true,
    },
    connectionId: {
      type: String,
      required: [true, "Connection ID is required"],
      trim: true,
    },
    transportMode: {
      type: String,
      required: [true, "Transport mode is required"],
      enum: ["road", "rail", "air", "sea", "pipeline", "conveyor", "other"],
    },
    distance: {
      type: Number,
      default: 0,
      min: [0, "Distance cannot be negative"],
    },
    duration: {
      type: Number,
      default: 0,
      min: [0, "Duration cannot be negative"],
    },
    cost: {
      type: Number,
      default: 0,
      min: [0, "Cost cannot be negative"],
    },
    attributes: {
      type: connectionAttributesSchema,
      default: {},
    },
  },
  { _id: false }
);

// Schema for hierarchical location structure
const hierarchicalLocationSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: [true, "Location ID is required"],
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Location type is required"],
      enum: [
        "supplier",
        "customer",
        "other",
        "company-code",
        "purchasing-org",
        "sales-org",
        "distribution-channel",
        "3pl",
        "freight-forwarder",
        "customs-location",
        "free-trade-zone",
        "ship-to-party",
        "invoicing-party",
        "distribution-center",
        "cmo",
        "manufacturing",
        "warehouse",
        "distribution",
        "customer",
        "plant",
        "qa",
        "inspection",
        "storage",
        "port",
        "returns-center",
      ],
    },
    x: {
      type: Number,
      required: [true, "X coordinate is required"],
    },
    y: {
      type: Number,
      required: [true, "Y coordinate is required"],
    },
    name: {
      type: String,
      required: [true, "Location name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    attributes: {
      type: locationAttributesSchema,
      default: {},
    },
    children: {
      type: [hierarchicalChildSchema],
      default: [],
    },
    parent: {
      type: hierarchicalParentSchema,
      default: null,
    },
  },
  { _id: false }
);

// Schema for hierarchical structure
const hierarchicalStructureSchema = new mongoose.Schema(
  {
    routeName: {
      type: String,
      trim: true,
    },
    routeDescription: {
      type: String,
      trim: true,
    },
    rootNodes: {
      type: [hierarchicalLocationSchema],
      default: [],
    },
    allLocations: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    allConnections: {
      type: [connectorSchema],
      default: [],
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

// Main supply chain route schema
const supplyChainRouteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Route name is required"],
      trim: true,
      maxlength: [100, "Route name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    routeType: {
      type: String,
      required: [true, "Route type is required"],
      enum: [
        "Supply Chain Route",
        "Distribution Route",
        "Procurement Route",
        "Production Route",
      ],
      default: "Supply Chain Route",
    },
    locations: {
      type: [locationSchema],
      required: [true, "At least one location is required"],
      validate: {
        validator: function (locations) {
          return locations && locations.length > 0;
        },
        message: "At least one location is required",
      },
    },
    connectors: {
      type: [connectorSchema],
      default: [],
    },
    id: {
      type: String,
      required: [true, "Route ID is required"],
      trim: true,
    },
    version: {
      type: String,
      default: "1.0",
      trim: true,
    },
    hierarchicalStructure: {
      type: hierarchicalStructureSchema,
      required: [true, "Hierarchical structure is required"],
    },
    status: {
      type: String,
      enum: ["draft", "active", "inactive", "archived"],
      default: "draft",
    },
    tags: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: String,
      trim: true,
    },
    lastModifiedBy: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "supplyChainRoute", // This ensures the collection name is 'supplyChainRoute'
  }
);

// Indexes for better query performance
supplyChainRouteSchema.index({ id: 1 });
supplyChainRouteSchema.index({ name: 1 });
supplyChainRouteSchema.index({ routeType: 1 });
supplyChainRouteSchema.index({ status: 1 });
supplyChainRouteSchema.index({ createdAt: -1 });
supplyChainRouteSchema.index({ "locations.id": 1 });
supplyChainRouteSchema.index({ "locations.type": 1 });
supplyChainRouteSchema.index({ tags: 1 });

// Text search index for name and description
supplyChainRouteSchema.index({
  name: "text",
  description: "text",
  "locations.name": "text",
});

// Virtual for total locations count
supplyChainRouteSchema.virtual("totalLocations").get(function () {
  return this.locations ? this.locations.length : 0;
});

// Virtual for total connectors count
supplyChainRouteSchema.virtual("totalConnectors").get(function () {
  return this.connectors ? this.connectors.length : 0;
});

// Virtual for route complexity (based on locations and connectors)
supplyChainRouteSchema.virtual("complexity").get(function () {
  const locationCount = this.locations ? this.locations.length : 0;
  const connectorCount = this.connectors ? this.connectors.length : 0;

  if (locationCount <= 3 && connectorCount <= 2) return "simple";
  if (locationCount <= 6 && connectorCount <= 5) return "medium";
  return "complex";
});

// Ensure virtual fields are serialized
supplyChainRouteSchema.set("toJSON", { virtuals: true });
supplyChainRouteSchema.set("toObject", { virtuals: true });

// Pre-save middleware to validate route structure
supplyChainRouteSchema.pre("save", function (next) {
  // Validate that all connector references point to existing locations
  const locationIds = this.locations.map((loc) => loc.id);

  for (const connector of this.connectors) {
    if (
      !locationIds.includes(connector.from) ||
      !locationIds.includes(connector.to)
    ) {
      return next(
        new Error(`Connector ${connector.id} references non-existent location`)
      );
    }
  }

  // Validate hierarchical structure consistency
  if (this.hierarchicalStructure && this.hierarchicalStructure.allLocations) {
    const hierarchicalLocationIds = Object.keys(
      this.hierarchicalStructure.allLocations
    );
    for (const locationId of locationIds) {
      if (!hierarchicalLocationIds.includes(locationId)) {
        return next(
          new Error(
            `Location ${locationId} missing from hierarchical structure`
          )
        );
      }
    }
  }

  next();
});

const SupplyChainRoute = mongoose.model(
  "SupplyChainRoute",
  supplyChainRouteSchema
);

module.exports = SupplyChainRoute;
