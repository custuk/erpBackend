const express = require('express');
const router = express.Router();
const DataObject = require('../models/DataObject');

// GET all data objects with pagination and filtering
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
    
    // Filter by category
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    // Filter by created by
    if (req.query.createdBy) {
      filter.createdBy = req.query.createdBy;
    }
    
    // Filter by active status
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }
    
    // Filter by tags
    if (req.query.tags) {
      const tags = Array.isArray(req.query.tags) ? req.query.tags : [req.query.tags];
      filter.tags = { $in: tags };
    }
    
    // Filter by feature flags
    if (req.query.enableValidation !== undefined) {
      filter.enableValidation = req.query.enableValidation === 'true';
    }
    if (req.query.enableWorkflow !== undefined) {
      filter.enableWorkflow = req.query.enableWorkflow === 'true';
    }
    if (req.query.enableApiAccess !== undefined) {
      filter.enableApiAccess = req.query.enableApiAccess === 'true';
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
    
    // Filter by retention period
    if (req.query.retentionExpired === 'true') {
      const now = new Date();
      filter.$expr = {
        $gt: [
          now,
          {
            $add: [
              "$createdAt",
              { $multiply: ["$retentionPeriod", 24 * 60 * 60 * 1000] }
            ]
          }
        ]
      };
    }
    
    // Search by name, description, or category
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { category: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Sort options
    let sort = { createdAt: -1 };
    if (req.query.sortBy) {
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
      sort = { [req.query.sortBy]: sortOrder };
    }

    // Special sorting for best match
    if (req.query.sortBy === 'bestMatch' && req.query.search) {
      const objects = await DataObject.find(filter);
      
      // Score objects based on search relevance
      const scoredObjects = objects.map(obj => {
        let score = 0;
        const searchTerm = req.query.search.toLowerCase();
        
        // Name match (highest priority)
        if (obj.name && obj.name.toLowerCase().includes(searchTerm)) {
          score += 100;
        }
        
        // Description match
        if (obj.description && obj.description.toLowerCase().includes(searchTerm)) {
          score += 50;
        }
        
        // Category match
        if (obj.category && obj.category.toLowerCase().includes(searchTerm)) {
          score += 30;
        }
        
        // Status boost
        if (obj.status === 'Active') score += 20;
        else if (obj.status === 'Draft') score += 10;
        
        // Feature count boost
        score += obj.enabledFeaturesCount * 2;
        
        // Usage count boost
        score += Math.min(obj.usageCount * 0.1, 10);
        
        return {
          ...obj.toObject(),
          matchScore: score
        };
      });
      
      // Sort by match score
      scoredObjects.sort((a, b) => b.matchScore - a.matchScore);
      
      // Apply pagination
      const total = scoredObjects.length;
      const paginatedObjects = scoredObjects.slice(skip, skip + limit);
      
      return res.json({
        success: true,
        data: paginatedObjects,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    }

    const objects = await DataObject.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await DataObject.countDocuments(filter);

    res.json({
      success: true,
      data: objects,
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
      message: 'Error fetching data objects',
      error: error.message
    });
  }
});

// GET single data object by ID
router.get('/:id', async (req, res) => {
  try {
    const object = await DataObject.findById(req.params.id);
    
    if (!object) {
      return res.status(404).json({
        success: false,
        message: 'Data object not found'
      });
    }

    // Increment usage count
    await object.incrementUsage();

    res.json({
      success: true,
      data: object
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching data object',
      error: error.message
    });
  }
});

// GET data object by custom ID (id field)
router.get('/by-object-id/:objectId', async (req, res) => {
  try {
    const object = await DataObject.findOne({ id: req.params.objectId });
    
    if (!object) {
      return res.status(404).json({
        success: false,
        message: 'Data object not found'
      });
    }

    // Increment usage count
    await object.incrementUsage();

    res.json({
      success: true,
      data: object
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching data object',
      error: error.message
    });
  }
});

// POST create new data object
router.post('/', async (req, res) => {
  try {
    const objectData = req.body;
    
    // Check if object with same ID already exists
    if (objectData.id) {
      const existingObject = await DataObject.findOne({ id: objectData.id });
      if (existingObject) {
        return res.status(400).json({
          success: false,
          message: 'Data object with this ID already exists'
        });
      }
    }
    
    // Set default values if not provided
    if (!objectData.createdBy) {
      objectData.createdBy = 'system';
    }
    
    const object = new DataObject(objectData);
    await object.save();

    res.status(201).json({
      success: true,
      message: 'Data object created successfully',
      data: object
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
      message: 'Error creating data object',
      error: error.message
    });
  }
});

// PUT update data object
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    
    // Prevent updating certain fields
    delete updates.id;
    delete updates.createdAt;
    delete updates.createdBy;
    
    const object = await DataObject.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!object) {
      return res.status(404).json({
        success: false,
        message: 'Data object not found'
      });
    }

    res.json({
      success: true,
      message: 'Data object updated successfully',
      data: object
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
      message: 'Error updating data object',
      error: error.message
    });
  }
});

// PATCH update data object status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, lastModifiedBy } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    const updateData = { status };
    if (lastModifiedBy) {
      updateData.lastModifiedBy = lastModifiedBy;
    }
    
    const object = await DataObject.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!object) {
      return res.status(404).json({
        success: false,
        message: 'Data object not found'
      });
    }

    res.json({
      success: true,
      message: 'Data object status updated successfully',
      data: object
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating data object status',
      error: error.message
    });
  }
});

// PATCH update feature flags
router.patch('/:id/features', async (req, res) => {
  try {
    const { features, lastModifiedBy } = req.body;
    
    if (!features || typeof features !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Features object is required'
      });
    }
    
    const updateData = { ...features };
    if (lastModifiedBy) {
      updateData.lastModifiedBy = lastModifiedBy;
    }
    
    const object = await DataObject.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!object) {
      return res.status(404).json({
        success: false,
        message: 'Data object not found'
      });
    }

    res.json({
      success: true,
      message: 'Data object features updated successfully',
      data: object
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating data object features',
      error: error.message
    });
  }
});

// DELETE data object
router.delete('/:id', async (req, res) => {
  try {
    const object = await DataObject.findByIdAndDelete(req.params.id);

    if (!object) {
      return res.status(404).json({
        success: false,
        message: 'Data object not found'
      });
    }

    res.json({
      success: true,
      message: 'Data object deleted successfully',
      data: object
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting data object',
      error: error.message
    });
  }
});

// GET data objects by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { includeInactive = false } = req.query;
    
    const filter = { category };
    if (!includeInactive) {
      filter.isActive = true;
    }
    
    const objects = await DataObject.find(filter)
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: objects,
      searchCriteria: {
        category,
        includeInactive: includeInactive === 'true',
        totalMatches: objects.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching data objects by category',
      error: error.message
    });
  }
});

// GET data objects by user (created by)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { includeInactive = false } = req.query;
    
    const filter = { createdBy: userId };
    if (!includeInactive) {
      filter.isActive = true;
    }
    
    const objects = await DataObject.find(filter)
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: objects,
      searchCriteria: {
        userId,
        includeInactive: includeInactive === 'true',
        totalMatches: objects.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user data objects',
      error: error.message
    });
  }
});

// GET data object statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await DataObject.aggregate([
      {
        $group: {
          _id: null,
          totalObjects: { $sum: 1 },
          activeObjects: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          activeStatusObjects: {
            $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] }
          },
          draftObjects: {
            $sum: { $cond: [{ $eq: ['$status', 'Draft'] }, 1, 0] }
          },
          archivedObjects: {
            $sum: { $cond: [{ $eq: ['$status', 'Archived'] }, 1, 0] }
          },
          totalUsage: { $sum: '$usageCount' }
        }
      }
    ]);

    const categoryStats = await DataObject.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalUsage: { $sum: '$usageCount' }
        }
      }
    ]);

    const featureStats = await DataObject.aggregate([
      {
        $group: {
          _id: null,
          enableValidation: { $sum: { $cond: ['$enableValidation', 1, 0] } },
          enableWorkflow: { $sum: { $cond: ['$enableWorkflow', 1, 0] } },
          enableApiAccess: { $sum: { $cond: ['$enableApiAccess', 1, 0] } },
          enableBulkOperations: { $sum: { $cond: ['$enableBulkOperations', 1, 0] } },
          enableSearch: { $sum: { $cond: ['$enableSearch', 1, 0] } },
          enableExport: { $sum: { $cond: ['$enableExport', 1, 0] } },
          enableImport: { $sum: { $cond: ['$enableImport', 1, 0] } }
        }
      }
    ]);

    const monthlyStats = await DataObject.aggregate([
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
          totalObjects: 0,
          activeObjects: 0,
          activeStatusObjects: 0,
          draftObjects: 0,
          archivedObjects: 0,
          totalUsage: 0
        },
        byCategory: categoryStats,
        byFeatures: featureStats[0] || {},
        monthly: monthlyStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching data object statistics',
      error: error.message
    });
  }
});

// GET all unique categories
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await DataObject.distinct('category');
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

// GET all unique statuses
router.get('/meta/statuses', async (req, res) => {
  try {
    const statuses = await DataObject.distinct('status');
    res.json({
      success: true,
      data: statuses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statuses',
      error: error.message
    });
  }
});

// GET all unique tags
router.get('/meta/tags', async (req, res) => {
  try {
    const tags = await DataObject.distinct('tags');
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

// GET expired objects
router.get('/expired/list', async (req, res) => {
  try {
    const expiredObjects = await DataObject.findExpired();
    
    res.json({
      success: true,
      data: expiredObjects,
      totalExpired: expiredObjects.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching expired objects',
      error: error.message
    });
  }
});

module.exports = router;
