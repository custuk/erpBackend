const express = require('express');
const router = express.Router();
const BusinessRule = require('../models/BusinessRule');

// GET all business rules with pagination and filtering
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
    
    // Filter by type
    if (req.query.type) {
      filter.type = req.query.type;
    }
    
    // Filter by data object
    if (req.query.dataObject) {
      filter.dataObject = req.query.dataObject;
    }
    
    // Filter by created by
    if (req.query.createdBy) {
      filter.createdBy = req.query.createdBy;
    }
    
    // Filter by active status
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }
    
    // Filter by enabled status
    if (req.query.enabled !== undefined) {
      filter.enabled = req.query.enabled === 'true';
    }
    
    // Filter by tags
    if (req.query.tags) {
      const tags = Array.isArray(req.query.tags) ? req.query.tags : [req.query.tags];
      filter.tags = { $in: tags };
    }
    
    // Filter by category
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    // Filter by scope
    if (req.query.scope) {
      filter.scope = req.query.scope;
    }
    
    // Filter by priority
    if (req.query.minPriority) {
      filter.priority = { $gte: parseInt(req.query.minPriority) };
    }
    if (req.query.maxPriority) {
      filter.priority = { ...filter.priority, $lte: parseInt(req.query.maxPriority) };
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
    
    // Filter by execution count
    if (req.query.minExecutions) {
      filter.executionCount = { $gte: parseInt(req.query.minExecutions) };
    }
    
    // Filter by success rate
    if (req.query.minSuccessRate) {
      filter.$expr = {
        $gte: [
          { $multiply: [{ $divide: ["$successCount", "$executionCount"] }, 100] },
          parseInt(req.query.minSuccessRate)
        ]
      };
    }
    
    // Search by name, description, or data object
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { dataObject: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Sort options
    let sort = { priority: 1, createdAt: -1 };
    if (req.query.sortBy) {
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
      sort = { [req.query.sortBy]: sortOrder };
    }

    // Special sorting for best match
    if (req.query.sortBy === 'bestMatch' && req.query.search) {
      const rules = await BusinessRule.find(filter);
      
      // Score rules based on search relevance
      const scoredRules = rules.map(rule => {
        let score = 0;
        const searchTerm = req.query.search.toLowerCase();
        
        // Name match (highest priority)
        if (rule.name && rule.name.toLowerCase().includes(searchTerm)) {
          score += 100;
        }
        
        // Description match
        if (rule.description && rule.description.toLowerCase().includes(searchTerm)) {
          score += 50;
        }
        
        // Data object match
        if (rule.dataObject && rule.dataObject.toLowerCase().includes(searchTerm)) {
          score += 30;
        }
        
        // Status boost
        if (rule.status === 'active') score += 20;
        else if (rule.status === 'draft') score += 10;
        
        // Priority boost (lower priority number = higher score)
        score += (100 - rule.priority) * 0.1;
        
        // Usage boost
        score += Math.min(rule.usageCount * 0.1, 10);
        
        // Effectiveness boost
        if (rule.isEffective) score += 15;
        
        return {
          ...rule.toObject(),
          matchScore: score
        };
      });
      
      // Sort by match score
      scoredRules.sort((a, b) => b.matchScore - a.matchScore);
      
      // Apply pagination
      const total = scoredRules.length;
      const paginatedRules = scoredRules.slice(skip, skip + limit);
      
      return res.json({
        success: true,
        data: paginatedRules,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    }

    const rules = await BusinessRule.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await BusinessRule.countDocuments(filter);

    res.json({
      success: true,
      data: rules,
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
      message: 'Error fetching business rules',
      error: error.message
    });
  }
});

// GET single business rule by ID
router.get('/:id', async (req, res) => {
  try {
    const rule = await BusinessRule.findById(req.params.id);
    
    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Business rule not found'
      });
    }

    // Increment usage count
    rule.usageCount += 1;
    await rule.save();

    res.json({
      success: true,
      data: rule
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching business rule',
      error: error.message
    });
  }
});

// GET business rule by custom ID (id field)
router.get('/by-rule-id/:ruleId', async (req, res) => {
  try {
    const rule = await BusinessRule.findOne({ id: req.params.ruleId });
    
    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Business rule not found'
      });
    }

    // Increment usage count
    rule.usageCount += 1;
    await rule.save();

    res.json({
      success: true,
      data: rule
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching business rule',
      error: error.message
    });
  }
});

// POST create new business rule
router.post('/', async (req, res) => {
  try {
    const ruleData = req.body;
    
    // Check if rule with same ID already exists
    if (ruleData.id) {
      const existingRule = await BusinessRule.findOne({ id: ruleData.id });
      if (existingRule) {
        return res.status(400).json({
          success: false,
          message: 'Business rule with this ID already exists'
        });
      }
    }
    
    // Set default values if not provided
    if (!ruleData.createdBy) {
      ruleData.createdBy = 'system';
    }
    
    const rule = new BusinessRule(ruleData);
    await rule.save();

    res.status(201).json({
      success: true,
      message: 'Business rule created successfully',
      data: rule
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
      message: 'Error creating business rule',
      error: error.message
    });
  }
});

// PUT update business rule
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    
    // Prevent updating certain fields
    delete updates.id;
    delete updates.createdAt;
    delete updates.createdBy;
    
    const rule = await BusinessRule.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Business rule not found'
      });
    }

    res.json({
      success: true,
      message: 'Business rule updated successfully',
      data: rule
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
      message: 'Error updating business rule',
      error: error.message
    });
  }
});

// PATCH update business rule status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, updatedBy } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    const updateData = { status };
    if (updatedBy) {
      updateData.updatedBy = updatedBy;
    }
    
    const rule = await BusinessRule.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Business rule not found'
      });
    }

    res.json({
      success: true,
      message: 'Business rule status updated successfully',
      data: rule
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating business rule status',
      error: error.message
    });
  }
});

// PATCH update business rule enabled status
router.patch('/:id/enabled', async (req, res) => {
  try {
    const { enabled, updatedBy } = req.body;
    
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Enabled status is required and must be boolean'
      });
    }
    
    const updateData = { enabled };
    if (updatedBy) {
      updateData.updatedBy = updatedBy;
    }
    
    const rule = await BusinessRule.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Business rule not found'
      });
    }

    res.json({
      success: true,
      message: 'Business rule enabled status updated successfully',
      data: rule
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating business rule enabled status',
      error: error.message
    });
  }
});

// PATCH update business rule priority
router.patch('/:id/priority', async (req, res) => {
  try {
    const { priority, updatedBy } = req.body;
    
    if (!priority || priority < 1) {
      return res.status(400).json({
        success: false,
        message: 'Priority is required and must be at least 1'
      });
    }
    
    const updateData = { priority };
    if (updatedBy) {
      updateData.updatedBy = updatedBy;
    }
    
    const rule = await BusinessRule.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Business rule not found'
      });
    }

    res.json({
      success: true,
      message: 'Business rule priority updated successfully',
      data: rule
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating business rule priority',
      error: error.message
    });
  }
});

// POST execute business rule
router.post('/:id/execute', async (req, res) => {
  try {
    const { data } = req.body;
    
    if (!data) {
      return res.status(400).json({
        success: false,
        message: 'Data is required for rule execution'
      });
    }
    
    const rule = await BusinessRule.findById(req.params.id);
    
    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Business rule not found'
      });
    }
    
    if (!rule.enabled || !rule.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Business rule is not enabled or active'
      });
    }
    
    // Evaluate conditions
    const conditionsMet = rule.evaluateConditions(data);
    
    let executionResult = {
      ruleId: rule.id,
      ruleName: rule.name,
      conditionsMet,
      actionsExecuted: [],
      success: false,
      message: ''
    };
    
    if (conditionsMet) {
      // Execute actions
      const actionResults = rule.executeActions(data);
      executionResult.actionsExecuted = actionResults;
      executionResult.success = actionResults.every(action => action.success);
      executionResult.message = executionResult.success ? 'Rule executed successfully' : 'Some actions failed';
      
      // Update execution statistics
      await rule.incrementExecution(executionResult.success);
    } else {
      executionResult.message = 'Rule conditions not met';
    }
    
    res.json({
      success: true,
      data: executionResult
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error executing business rule',
      error: error.message
    });
  }
});

// DELETE business rule
router.delete('/:id', async (req, res) => {
  try {
    const rule = await BusinessRule.findByIdAndDelete(req.params.id);

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Business rule not found'
      });
    }

    res.json({
      success: true,
      message: 'Business rule deleted successfully',
      data: rule
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting business rule',
      error: error.message
    });
  }
});

// GET business rules by data object
router.get('/data-object/:dataObject', async (req, res) => {
  try {
    const { dataObject } = req.params;
    const { includeInactive = false } = req.query;
    
    const filter = { dataObject };
    if (!includeInactive) {
      filter.isActive = true;
    }
    
    const rules = await BusinessRule.find(filter)
      .sort({ priority: 1, createdAt: -1 });
    
    res.json({
      success: true,
      data: rules,
      searchCriteria: {
        dataObject,
        includeInactive: includeInactive === 'true',
        totalMatches: rules.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching business rules by data object',
      error: error.message
    });
  }
});

// GET business rules by type
router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { includeInactive = false } = req.query;
    
    const filter = { type };
    if (!includeInactive) {
      filter.isActive = true;
    }
    
    const rules = await BusinessRule.find(filter)
      .sort({ priority: 1, createdAt: -1 });
    
    res.json({
      success: true,
      data: rules,
      searchCriteria: {
        type,
        includeInactive: includeInactive === 'true',
        totalMatches: rules.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching business rules by type',
      error: error.message
    });
  }
});

// GET business rules by user (created by)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { includeInactive = false } = req.query;
    
    const filter = { createdBy: userId };
    if (!includeInactive) {
      filter.isActive = true;
    }
    
    const rules = await BusinessRule.find(filter)
      .sort({ priority: 1, createdAt: -1 });
    
    res.json({
      success: true,
      data: rules,
      searchCriteria: {
        userId,
        includeInactive: includeInactive === 'true',
        totalMatches: rules.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user business rules',
      error: error.message
    });
  }
});

// GET business rule statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await BusinessRule.aggregate([
      {
        $group: {
          _id: null,
          totalRules: { $sum: 1 },
          activeRules: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          enabledRules: {
            $sum: { $cond: [{ $eq: ['$enabled', true] }, 1, 0] }
          },
          activeStatusRules: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          draftRules: {
            $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
          },
          archivedRules: {
            $sum: { $cond: [{ $eq: ['$status', 'archived'] }, 1, 0] }
          },
          totalExecutions: { $sum: '$executionCount' },
          totalSuccesses: { $sum: '$successCount' },
          totalFailures: { $sum: '$failureCount' }
        }
      }
    ]);

    const typeStats = await BusinessRule.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalExecutions: { $sum: '$executionCount' },
          totalSuccesses: { $sum: '$successCount' }
        }
      }
    ]);

    const dataObjectStats = await BusinessRule.aggregate([
      {
        $group: {
          _id: '$dataObject',
          count: { $sum: 1 },
          totalExecutions: { $sum: '$executionCount' }
        }
      }
    ]);

    const monthlyStats = await BusinessRule.aggregate([
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
          totalRules: 0,
          activeRules: 0,
          enabledRules: 0,
          activeStatusRules: 0,
          draftRules: 0,
          archivedRules: 0,
          totalExecutions: 0,
          totalSuccesses: 0,
          totalFailures: 0
        },
        byType: typeStats,
        byDataObject: dataObjectStats,
        monthly: monthlyStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching business rule statistics',
      error: error.message
    });
  }
});

// GET all unique rule types
router.get('/meta/types', async (req, res) => {
  try {
    const types = await BusinessRule.distinct('type');
    res.json({
      success: true,
      data: types
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching rule types',
      error: error.message
    });
  }
});

// GET all unique data objects
router.get('/meta/data-objects', async (req, res) => {
  try {
    const dataObjects = await BusinessRule.distinct('dataObject');
    res.json({
      success: true,
      data: dataObjects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching data objects',
      error: error.message
    });
  }
});

// GET all unique statuses
router.get('/meta/statuses', async (req, res) => {
  try {
    const statuses = await BusinessRule.distinct('status');
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
    const tags = await BusinessRule.distinct('tags');
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

// GET all unique categories
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await BusinessRule.distinct('category');
    res.json({
      success: true,
      data: categories.filter(category => category) // Remove null/undefined values
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
});

module.exports = router;
