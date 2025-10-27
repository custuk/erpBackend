const express = require('express');
const router = express.Router();
const ModuleConfiguration = require('../models/ModuleConfiguration');

// GET all module configurations with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    const filter = {};
    
    // Filter by declaration scope
    if (req.query.declarationScope) {
      filter.declarationScope = req.query.declarationScope;
    }
    
    // Filter by category
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    // Filter by subcategory
    if (req.query.subCategory) {
      filter.subCategory = req.query.subCategory;
    }
    
    // Filter by active status
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }
    
    // Search by module name, description, or ID
    if (req.query.search) {
      filter.$or = [
        { moduleName: { $regex: req.query.search, $options: 'i' } },
        { moduleDescription: { $regex: req.query.search, $options: 'i' } },
        { moduleId: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Sort options
    let sort = { declarationScope: 1, category: 1, order: 1, moduleName: 1 };
    if (req.query.sortBy) {
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
      sort = { [req.query.sortBy]: sortOrder };
    }

    const modules = await ModuleConfiguration.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await ModuleConfiguration.countDocuments(filter);

    res.json({
      success: true,
      data: modules,
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
      message: 'Error fetching module configurations',
      error: error.message
    });
  }
});

// GET modules by declaration scope
router.get('/scope/:scope', async (req, res) => {
  try {
    const { scope } = req.params;
    const modules = await ModuleConfiguration.getModulesByScope(scope);
    
    res.json({
      success: true,
      data: modules,
      scope: scope,
      count: modules.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching modules by scope',
      error: error.message
    });
  }
});

// GET modules by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { scope } = req.query;
    const modules = await ModuleConfiguration.getModulesByCategory(category, scope);
    
    res.json({
      success: true,
      data: modules,
      category: category,
      scope: scope,
      count: modules.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching modules by category',
      error: error.message
    });
  }
});

// GET all scopes with their modules (for navigation structure)
router.get('/scopes/with-modules', async (req, res) => {
  try {
    const scopesWithModules = await ModuleConfiguration.getScopesWithModules();
    
    res.json({
      success: true,
      data: scopesWithModules
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching scopes with modules',
      error: error.message
    });
  }
});

// GET single module configuration by ID
router.get('/:id', async (req, res) => {
  try {
    const module = await ModuleConfiguration.findById(req.params.id);
    
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module configuration not found'
      });
    }

    res.json({
      success: true,
      data: module
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching module configuration',
      error: error.message
    });
  }
});

// GET module configuration by module ID
router.get('/by-module-id/:moduleId', async (req, res) => {
  try {
    const module = await ModuleConfiguration.findOne({ 
      moduleId: req.params.moduleId 
    });
    
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module configuration not found'
      });
    }

    res.json({
      success: true,
      data: module
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching module configuration',
      error: error.message
    });
  }
});

// POST create new module configuration
router.post('/', async (req, res) => {
  try {
    console.log('📝 Module Configuration POST - Request body:', JSON.stringify(req.body, null, 2));
    const moduleData = req.body;
    
    // Check if module with same ID already exists
    if (moduleData.moduleId) {
      const existingModule = await ModuleConfiguration.findOne({ moduleId: moduleData.moduleId });
      if (existingModule) {
        return res.status(400).json({
          success: false,
          message: 'Module configuration with this Module ID already exists'
        });
      }
    }
    
    const module = new ModuleConfiguration(moduleData);
    await module.save();

    res.status(201).json({
      success: true,
      message: 'Module configuration created successfully',
      data: module
    });
  } catch (error) {
    console.error('❌ Module Configuration POST Error:', error);
    
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
      message: 'Error creating module configuration',
      error: error.message
    });
  }
});

// PUT update module configuration
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    
    // Prevent updating certain fields
    delete updates.moduleId;
    delete updates.createdAt;
    delete updates.updatedAt;
    
    const module = await ModuleConfiguration.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module configuration not found'
      });
    }

    res.json({
      success: true,
      message: 'Module configuration updated successfully',
      data: module
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
      message: 'Error updating module configuration',
      error: error.message
    });
  }
});

// PUT update module configuration by module ID
router.put('/by-module-id/:moduleId', async (req, res) => {
  try {
    const updates = req.body;
    
    // Prevent updating certain fields
    delete updates.moduleId;
    delete updates.createdAt;
    delete updates.updatedAt;
    
    const module = await ModuleConfiguration.findOneAndUpdate(
      { moduleId: req.params.moduleId },
      updates,
      { new: true, runValidators: true }
    );

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module configuration not found'
      });
    }

    res.json({
      success: true,
      message: 'Module configuration updated successfully',
      data: module
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
      message: 'Error updating module configuration',
      error: error.message
    });
  }
});

// PATCH update module scope (for moving modules between scopes)
router.patch('/:id/move-scope', async (req, res) => {
  try {
    const { declarationScope, order } = req.body;
    
    if (!declarationScope) {
      return res.status(400).json({
        success: false,
        message: 'Declaration scope is required'
      });
    }
    
    const module = await ModuleConfiguration.findById(req.params.id);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module configuration not found'
      });
    }
    
    // Update scope and order
    module.declarationScope = declarationScope;
    if (order !== undefined) {
      module.order = order;
    }
    
    await module.save();

    res.json({
      success: true,
      message: 'Module scope updated successfully',
      data: module
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating module scope',
      error: error.message
    });
  }
});

// PATCH update module scope by module ID
router.patch('/by-module-id/:moduleId/move-scope', async (req, res) => {
  try {
    const { declarationScope, order } = req.body;
    
    if (!declarationScope) {
      return res.status(400).json({
        success: false,
        message: 'Declaration scope is required'
      });
    }
    
    const module = await ModuleConfiguration.findOne({ moduleId: req.params.moduleId });
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module configuration not found'
      });
    }
    
    // Update scope and order
    module.declarationScope = declarationScope;
    if (order !== undefined) {
      module.order = order;
    }
    
    await module.save();

    res.json({
      success: true,
      message: 'Module scope updated successfully',
      data: module
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating module scope',
      error: error.message
    });
  }
});

// DELETE module configuration (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const module = await ModuleConfiguration.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module configuration not found'
      });
    }

    res.json({
      success: true,
      message: 'Module configuration deactivated successfully',
      data: module
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deactivating module configuration',
      error: error.message
    });
  }
});

// GET module configuration statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await ModuleConfiguration.aggregate([
      {
        $group: {
          _id: null,
          totalModules: { $sum: 1 },
          activeModules: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          inactiveModules: {
            $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] }
          }
        }
      }
    ]);

    const scopeStats = await ModuleConfiguration.aggregate([
      {
        $group: {
          _id: '$declarationScope',
          count: { $sum: 1 },
          activeCount: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const categoryStats = await ModuleConfiguration.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          activeCount: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalModules: 0,
          activeModules: 0,
          inactiveModules: 0
        },
        byScope: scopeStats,
        byCategory: categoryStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching module configuration statistics',
      error: error.message
    });
  }
});

module.exports = router;
