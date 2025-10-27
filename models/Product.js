const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    trim: true,
    uppercase: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  price: {
    cost: {
      type: Number,
      required: [true, 'Cost price is required'],
      min: [0, 'Cost price cannot be negative']
    },
    selling: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: [0, 'Selling price cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'INR']
    }
  },
  inventory: {
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 0
    },
    minStock: {
      type: Number,
      min: [0, 'Minimum stock cannot be negative'],
      default: 10
    },
    maxStock: {
      type: Number,
      min: [0, 'Maximum stock cannot be negative']
    },
    location: {
      warehouse: String,
      aisle: String,
      shelf: String
    }
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    weight: Number,
    unit: {
      type: String,
      enum: ['cm', 'inch', 'kg', 'lb'],
      default: 'cm'
    }
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  supplier: {
    name: String,
    contact: String,
    email: String,
    phone: String
  },
  specifications: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

// Indexes for better query performance
productSchema.index({ sku: 1 });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ name: 'text', description: 'text' });

// Virtual for profit margin
productSchema.virtual('profitMargin').get(function() {
  if (this.price.cost && this.price.selling) {
    return ((this.price.selling - this.price.cost) / this.price.cost * 100).toFixed(2);
  }
  return 0;
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
  if (this.inventory.quantity <= 0) return 'out_of_stock';
  if (this.inventory.quantity <= this.inventory.minStock) return 'low_stock';
  return 'in_stock';
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);

