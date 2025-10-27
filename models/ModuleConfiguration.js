const mongoose = require("mongoose");

// Schema for module configuration
const moduleConfigurationSchema = new mongoose.Schema(
  {
    moduleId: {
      type: String,
      required: [true, "Module ID is required"],
      unique: true,
      trim: true,
    },
    moduleName: {
      type: String,
      required: [true, "Module name is required"],
      trim: true,
    },
    moduleDescription: {
      type: String,
      trim: true,
    },
    declarationScope: {
      type: String,
      required: [true, "Declaration scope is required"],
      enum: ["ERP", "Config", "GB Customs"],
      default: "ERP",
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    subCategory: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
      default: "package",
      trim: true,
    },
    color: {
      type: String,
      default: "#f59e0b",
      match: [/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color code"],
    },
    route: {
      type: String,
      required: [true, "Route is required"],
      trim: true,
    },
    apiEndpoint: {
      type: String,
      trim: true,
    },
    permissions: {
      read: {
        type: [String],
        default: [],
      },
      write: {
        type: [String],
        default: [],
      },
      execute: {
        type: [String],
        default: [],
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    features: {
      type: [String],
      default: [],
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: "moduleConfigurations",
  }
);

// Indexes for better query performance
moduleConfigurationSchema.index({ moduleId: 1 });
moduleConfigurationSchema.index({ declarationScope: 1 });
moduleConfigurationSchema.index({ category: 1 });
moduleConfigurationSchema.index({ isActive: 1 });
moduleConfigurationSchema.index({ order: 1 });

// Virtual for full module path
moduleConfigurationSchema.virtual("fullPath").get(function () {
  return `${this.declarationScope}/${this.category}/${this.moduleId}`;
});

// Ensure virtual fields are serialized
moduleConfigurationSchema.set("toJSON", { virtuals: true });
moduleConfigurationSchema.set("toObject", { virtuals: true });

// Static method to get modules by scope
moduleConfigurationSchema.statics.getModulesByScope = function (scope) {
  return this.find({ declarationScope: scope, isActive: true }).sort({ order: 1, moduleName: 1 });
};

// Static method to get modules by category
moduleConfigurationSchema.statics.getModulesByCategory = function (category, scope = null) {
  const filter = { category, isActive: true };
  if (scope) {
    filter.declarationScope = scope;
  }
  return this.find(filter).sort({ order: 1, moduleName: 1 });
};

// Static method to get all scopes with their modules
moduleConfigurationSchema.statics.getScopesWithModules = function () {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: "$declarationScope",
        modules: {
          $push: {
            moduleId: "$moduleId",
            moduleName: "$moduleName",
            moduleDescription: "$moduleDescription",
            category: "$category",
            subCategory: "$subCategory",
            icon: "$icon",
            color: "$color",
            route: "$route",
            apiEndpoint: "$apiEndpoint",
            features: "$features",
            order: "$order",
          },
        },
        moduleCount: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);
};

const ModuleConfiguration = mongoose.model("ModuleConfiguration", moduleConfigurationSchema);

module.exports = ModuleConfiguration;
