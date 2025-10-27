const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET all products with pagination, filtering, and search
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 500;
    const skip = (page - 1) * limit;
    
    const filter = { isActive: true };
    
    // Filter by category
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    // Filter by brand
    if (req.query.brand) {
      filter.brand = req.query.brand;
    }
    
    // Filter by stock status
    if (req.query.stockStatus) {
      switch (req.query.stockStatus) {
        case 'in_stock':
          filter['inventory.quantity'] = { $gt: 0 };
          break;
        case 'low_stock':
          filter['inventory.quantity'] = { $gt: 0, $lte: '$inventory.minStock' };
          break;
        case 'out_of_stock':
          filter['inventory.quantity'] = 0;
          break;
      }
    }
    
    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      filter['price.selling'] = {};
      if (req.query.minPrice) filter['price.selling'].$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filter['price.selling'].$lte = parseFloat(req.query.maxPrice);
    }
    
    // Search by name, description, or SKU
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { sku: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Sort options
    let sort = { createdAt: -1 };
    if (req.query.sortBy) {
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
      sort = { [req.query.sortBy]: sortOrder };
    }

    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
});

// GET single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
});

// POST create new product
router.post('/', async (req, res) => {
  try {
    const productData = req.body;
    
    // Check if product with same SKU already exists
    const existingProduct = await Product.findOne({ sku: productData.sku });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Product with this SKU already exists'
      });
    }

    const product = new Product(productData);
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
});

// PUT update product
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    
    // Check if SKU is being updated and if it's unique
    if (updates.sku) {
      const existingProduct = await Product.findOne({ 
        sku: updates.sku, 
        _id: { $ne: req.params.id } 
      });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: 'Product with this SKU already exists'
        });
      }
    }
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
});

// DELETE product (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deactivated successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deactivating product',
      error: error.message
    });
  }
});

// PATCH update inventory
router.patch('/:id/inventory', async (req, res) => {
  try {
    const { quantity, operation } = req.body;
    
    if (!quantity || !operation) {
      return res.status(400).json({
        success: false,
        message: 'Quantity and operation are required'
      });
    }
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    let newQuantity = product.inventory.quantity;
    
    switch (operation) {
      case 'add':
        newQuantity += quantity;
        break;
      case 'subtract':
        newQuantity = Math.max(0, newQuantity - quantity);
        break;
      case 'set':
        newQuantity = Math.max(0, quantity);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid operation. Use: add, subtract, or set'
        });
    }
    
    product.inventory.quantity = newQuantity;
    await product.save();
    
    res.json({
      success: true,
      message: 'Inventory updated successfully',
      data: {
        productId: product._id,
        newQuantity: newQuantity,
        operation: operation
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating inventory',
      error: error.message
    });
  }
});

// GET product statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          activeProducts: { $sum: { $cond: ['$isActive', 1, 0] } },
          totalValue: { $sum: { $multiply: ['$price.selling', '$inventory.quantity'] } },
          lowStockProducts: {
            $sum: {
              $cond: [
                { $and: [
                  { $gt: ['$inventory.quantity', 0] },
                  { $lte: ['$inventory.quantity', '$inventory.minStock'] }
                ]},
                1,
                0
              ]
            }
          },
          outOfStockProducts: {
            $sum: { $cond: [{ $eq: ['$inventory.quantity', 0] }, 1, 0] }
          }
        }
      }
    ]);

    const categoryStats = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$price.selling', '$inventory.quantity'] } }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalProducts: 0,
          activeProducts: 0,
          totalValue: 0,
          lowStockProducts: 0,
          outOfStockProducts: 0
        },
        byCategory: categoryStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product statistics',
      error: error.message
    });
  }
});

// GET categories
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
});

// GET brands
router.get('/brands/list', async (req, res) => {
  try {
    const brands = await Product.distinct('brand');
    res.json({
      success: true,
      data: brands.filter(brand => brand) // Remove null/undefined values
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching brands',
      error: error.message
    });
  }
});

module.exports = router;



