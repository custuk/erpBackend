const express = require('express');
const router = express.Router();
const TaskTemplate = require('../models/TaskTemplate');

// GET all task templates with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 500;
    const skip = (page - 1) * limit;
    
    const filter = {};
    
    // Filter by status
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    // Filter by template type
    if (req.query.templateType) {
      filter.templateType = req.query.templateType;
    }
    

    
    // Filter by tags
    if (req.query.tags) {
      const tags = Array.isArray(req.query.tags) ? req.query.tags : [req.query.tags];
      filter.tags = { $in: tags };
    }
    
    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.createdAt.$lte = new Date(req.query.endDate);
      }
    }
    
    // Search by name, description, or item names
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { 'items.name': { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Sort options
    let sort = { createdAt: -1 };
    if (req.query.sortBy) {
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
      sort = { [req.query.sortBy]: sortOrder };
    }

    const templates = await TaskTemplate.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await TaskTemplate.countDocuments(filter);

    res.json({
      success: true,
      data: templates,
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
      message: 'Error fetching task templates',
      error: error.message
    });
  }
});

// GET single task template by ID
router.get('/:id', async (req, res) => {
  try {
    const template = await TaskTemplate.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Task template not found'
      });
    }

    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching task template',
      error: error.message
    });
  }
});

// GET task template by template ID (custom ID field)
router.get('/by-template-id/:templateId', async (req, res) => {
  try {
    const template = await TaskTemplate.findOne({ id: req.params.templateId });
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Task template not found'
      });
    }

    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching task template',
      error: error.message
    });
  }
});

// POST create new task template
router.post('/', async (req, res) => {
  try {
    const templateData = req.body;
    
    // Check if template with same ID already exists
    if (templateData.id) {
      const existingTemplate = await TaskTemplate.findOne({ id: templateData.id });
      if (existingTemplate) {
        return res.status(400).json({
          success: false,
          message: 'Task template with this ID already exists'
        });
      }
    }
    
    // Validate required fields
    if (!templateData.name) {
      return res.status(400).json({
        success: false,
        message: 'Template name is required'
      });
    }
    
    if (!templateData.items || !Array.isArray(templateData.items) || templateData.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one item is required'
      });
    }
    
    // Validate items structure
    for (let i = 0; i < templateData.items.length; i++) {
      const item = templateData.items[i];
      if (!item.id || !item.name || !item.type) {
        return res.status(400).json({
          success: false,
          message: `Item ${i + 1} is missing required fields: id, name, or type`
        });
      }
      
      if (!['task', 'dataObject'].includes(item.type)) {
        return res.status(400).json({
          success: false,
          message: `Item ${i + 1} has invalid type. Must be 'task' or 'dataObject'`
        });
      }
    }
    
    // Set default status if not provided
    if (!templateData.status) {
      templateData.status = 'draft';
    }
    
    // Set createdBy if not provided
    if (!templateData.createdBy) {
      templateData.createdBy = 'system'; // You might want to get this from auth middleware
    }
    
    const template = new TaskTemplate(templateData);
    await template.save();

    res.status(201).json({
      success: true,
      message: 'Task template created successfully',
      data: template
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
      message: 'Error creating task template',
      error: error.message
    });
  }
});

// PUT update task template
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    
    // Prevent updating certain fields
    delete updates.id;
    delete updates.createdAt;
    
    // Validate items if being updated
    if (updates.items && updates.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one item is required'
      });
    }
    
    const template = await TaskTemplate.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Task template not found'
      });
    }

    res.json({
      success: true,
      message: 'Task template updated successfully',
      data: template
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
      message: 'Error updating task template',
      error: error.message
    });
  }
});

// PATCH update task template status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    const template = await TaskTemplate.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Task template not found'
      });
    }

    res.json({
      success: true,
      message: 'Task template status updated successfully',
      data: template
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating task template status',
      error: error.message
    });
  }
});

// DELETE task template
router.delete('/:id', async (req, res) => {
  try {
    const template = await TaskTemplate.findByIdAndDelete(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Task template not found'
      });
    }

    res.json({
      success: true,
      message: 'Task template deleted successfully',
      data: template
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting task template',
      error: error.message
    });
  }
});

// GET task templates containing a specific item
router.get('/search/by-item/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const { includeInactive = false } = req.query;
    
    const filter = {
      'items.id': itemId
    };
    
    if (!includeInactive) {
      filter.status = { $in: ['active', 'draft'] };
    }
    
    const templates = await TaskTemplate.find(filter)
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: templates,
      searchCriteria: {
        itemId,
        includeInactive: includeInactive === 'true',
        totalMatches: templates.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching templates by item',
      error: error.message
    });
  }
});

// GET task template statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await TaskTemplate.aggregate([
      {
        $group: {
          _id: null,
          totalTemplates: { $sum: 1 },
          activeTemplates: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          draftTemplates: {
            $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
          },
          inactiveTemplates: {
            $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] }
          },
          archivedTemplates: {
            $sum: { $cond: [{ $eq: ['$status', 'archived'] }, 1, 0] }
          },
          averageItemsPerTemplate: { $avg: { $size: '$items' } }
        }
      }
    ]);

    const templateTypeStats = await TaskTemplate.aggregate([
      {
        $group: {
          _id: '$templateType',
          count: { $sum: 1 }
        }
      }
    ]);

    const itemTypeStats = await TaskTemplate.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.type',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const monthlyStats = await TaskTemplate.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalTemplates: 0,
          activeTemplates: 0,
          draftTemplates: 0,
          inactiveTemplates: 0,
          archivedTemplates: 0,
          averageItemsPerTemplate: 0
        },
        byTemplateType: templateTypeStats,
        byItemType: itemTypeStats,
        monthly: monthlyStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching task template statistics',
      error: error.message
    });
  }
});

// GET all unique template types
router.get('/meta/template-types', async (req, res) => {
  try {
    const templateTypes = await TaskTemplate.distinct('templateType');
    res.json({
      success: true,
      data: templateTypes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching template types',
      error: error.message
    });
  }
});

// GET all unique item types
router.get('/meta/item-types', async (req, res) => {
  try {
    const itemTypes = await TaskTemplate.distinct('items.type');
    res.json({
      success: true,
      data: itemTypes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching item types',
      error: error.message
    });
  }
});

// GET task templates by item type
router.get('/by-item-type/:itemType', async (req, res) => {
  try {
    const { itemType } = req.params;
    const { includeInactive = false } = req.query;
    
    const filter = {
      'items.type': itemType
    };
    
    if (!includeInactive) {
      filter.status = { $in: ['active', 'draft'] };
    }
    
    const templates = await TaskTemplate.find(filter)
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: templates,
      searchCriteria: {
        itemType,
        includeInactive: includeInactive === 'true',
        totalMatches: templates.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching templates by item type',
      error: error.message
    });
  }
});

// GET all unique tags
router.get('/meta/tags', async (req, res) => {
  try {
    const tags = await TaskTemplate.distinct('tags');
    res.json({
      success: true,
      data: tags.filter(tag => tag) // Remove null/undefined values
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tags',
      error: error.message
    });
  }
});

module.exports = router;


