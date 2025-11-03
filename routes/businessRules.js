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

// PUT update business rule by MongoDB _id
router.put('/:id', async (req, res) => {
  try {
    console.log('🔄 PUT /:id route called with id:', req.params.id);
    const updates = req.body;
    
    // Prevent updating certain fields that shouldn't be modified directly
    delete updates.id;
    delete updates.createdAt;
    delete updates.createdBy;
    delete updates.__v; // Don't allow frontend to set version - Mongoose manages this
    delete updates.ageInDays; // Virtual field - computed automatically
    delete updates.complexityScore; // Virtual field - computed automatically
    delete updates.successRate; // Virtual field - computed automatically
    delete updates.isEffective; // Virtual field - computed automatically
    
    // Use findOne and save to ensure all fields are properly persisted
    let rule = await BusinessRule.findById(req.params.id);

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Business rule not found'
      });
    }

    // Apply updates to the document
    console.log('📝 Updates received:', Object.keys(updates));
    console.log('📋 hookPoints:', updates.hookPoints);
    console.log('📋 requestTypes:', updates.requestTypes);
    console.log('📋 dataObjects:', updates.dataObjects);
    
    // Initialize new fields if they don't exist on the document (for existing documents created before these fields were added)
    if (rule.hookPoints === undefined || rule.hookPoints === null) {
      rule.hookPoints = updates.hookPoints !== undefined ? updates.hookPoints : [];
    }
    if (rule.requestTypes === undefined || rule.requestTypes === null) {
      rule.requestTypes = updates.requestTypes !== undefined ? updates.requestTypes : [];
    }
    if (rule.dataObjects === undefined || rule.dataObjects === null) {
      rule.dataObjects = updates.dataObjects !== undefined ? updates.dataObjects : [];
    }
    if (rule.field === undefined || rule.field === null) {
      rule.field = updates.field !== undefined ? updates.field : '';
    }
    
    Object.keys(updates).forEach(key => {
      if (key === 'hookPoints' || key === 'requestTypes' || key === 'dataObjects' || key === 'field') {
        // For arrays and new fields, explicitly set and mark as modified
        const value = updates[key];
        console.log(`🔧 Setting ${key} to:`, value);
        
        // Handle array fields
        if (key === 'hookPoints' || key === 'requestTypes' || key === 'dataObjects') {
          // Set the array value (even if empty)
          rule[key] = Array.isArray(value) ? value : (value !== undefined && value !== null ? [value] : []);
        } else {
          // Handle string field
          rule[key] = value !== undefined && value !== null ? value : '';
        }
        
        // Mark as modified
        rule.markModified(key);
      } else {
        rule[key] = updates[key];
      }
    });

    // Explicitly mark all array fields as modified to ensure persistence
    rule.markModified('hookPoints');
    rule.markModified('requestTypes');
    rule.markModified('dataObjects');

    // Use updateOne with $set to directly update without version conflicts
    // This bypasses the version check by doing a direct database update
    const updateQuery = {};
    
    // Build the update object
    Object.keys(updates).forEach(key => {
      if (key === 'hookPoints' || key === 'requestTypes' || key === 'dataObjects' || key === 'field') {
        const value = updates[key];
        if (key === 'hookPoints' || key === 'requestTypes' || key === 'dataObjects') {
          updateQuery[key] = Array.isArray(value) ? value : (value !== undefined && value !== null ? [value] : []);
        } else {
          updateQuery[key] = value !== undefined && value !== null ? value : '';
        }
      } else {
        updateQuery[key] = updates[key];
      }
    });
    
    // Ensure new fields are set even if empty
    if (updateQuery.hookPoints === undefined) updateQuery.hookPoints = [];
    if (updateQuery.requestTypes === undefined) updateQuery.requestTypes = [];
    if (updateQuery.dataObjects === undefined) updateQuery.dataObjects = [];
    if (updateQuery.field === undefined) updateQuery.field = '';
    
    console.log('💾 Update query:', Object.keys(updateQuery));
    
    // Perform the update directly - this bypasses version checking
    const updateResult = await BusinessRule.updateOne(
      { _id: req.params.id },
      { $set: updateQuery }
    );
    
    if (updateResult.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Business rule not found'
      });
    }
    
    // Re-fetch the updated document
    rule = await BusinessRule.findById(req.params.id);
    
    // Log the saved values for verification
    console.log('✅ Saved hookPoints:', rule.hookPoints);
    console.log('✅ Saved requestTypes:', rule.requestTypes);
    console.log('✅ Saved dataObjects:', rule.dataObjects);
    
    // Re-fetch from database to verify persistence
    const verifiedRule = await BusinessRule.findById(rule._id);
    console.log('🔍 Verified from DB - hookPoints:', verifiedRule.hookPoints);
    console.log('🔍 Verified from DB - requestTypes:', verifiedRule.requestTypes);
    console.log('🔍 Verified from DB - dataObjects:', verifiedRule.dataObjects);
    
    // Ensure fields are present in response (even if undefined, set to defaults)
    if (!verifiedRule.hookPoints) verifiedRule.hookPoints = [];
    if (!verifiedRule.requestTypes) verifiedRule.requestTypes = [];
    if (!verifiedRule.dataObjects) verifiedRule.dataObjects = [];
    if (!verifiedRule.field) verifiedRule.field = '';

    res.json({
      success: true,
      message: 'Business rule updated successfully',
      data: verifiedRule || rule
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

// PUT update business rule by custom ID (id field)
router.put('/by-rule-id/:ruleId', async (req, res) => {
  try {
    console.log('🔄 PUT /by-rule-id route called with ruleId:', req.params.ruleId);
    const updates = req.body;
    
    // Prevent updating certain fields that shouldn't be modified directly
    delete updates.id;
    delete updates.createdAt;
    delete updates.createdBy;
    delete updates.__v; // Don't allow frontend to set version - Mongoose manages this
    delete updates.ageInDays; // Virtual field - computed automatically
    delete updates.complexityScore; // Virtual field - computed automatically
    delete updates.successRate; // Virtual field - computed automatically
    delete updates.isEffective; // Virtual field - computed automatically
    
    // Use findOne and save to ensure all fields are properly persisted
    const rule = await BusinessRule.findOne({ id: req.params.ruleId });

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Business rule not found'
      });
    }

    // Apply updates to the document
    console.log('📝 Updates received:', Object.keys(updates));
    console.log('📋 hookPoints:', updates.hookPoints);
    console.log('📋 requestTypes:', updates.requestTypes);
    console.log('📋 dataObjects:', updates.dataObjects);
    
    // Initialize new fields if they don't exist on the document
    if (!rule.hookPoints) {
      rule.hookPoints = [];
    }
    if (!rule.requestTypes) {
      rule.requestTypes = [];
    }
    if (!rule.dataObjects) {
      rule.dataObjects = [];
    }
    if (rule.field === undefined) {
      rule.field = '';
    }
    
    Object.keys(updates).forEach(key => {
      if (key === 'hookPoints' || key === 'requestTypes' || key === 'dataObjects' || key === 'field') {
        // For arrays and new fields, explicitly set and mark as modified
        const value = updates[key];
        console.log(`🔧 Setting ${key} to:`, value);
        
        // Handle array fields
        if (key === 'hookPoints' || key === 'requestTypes' || key === 'dataObjects') {
          // Set the array value (even if empty)
          rule[key] = Array.isArray(value) ? value : (value !== undefined && value !== null ? [value] : []);
        } else {
          // Handle string field
          rule[key] = value !== undefined && value !== null ? value : '';
        }
        
        // Mark as modified
        rule.markModified(key);
      } else {
        rule[key] = updates[key];
      }
    });

    // Explicitly mark all array fields as modified to ensure persistence
    rule.markModified('hookPoints');
    rule.markModified('requestTypes');
    rule.markModified('dataObjects');

    // Use updateOne with $set to directly update without version conflicts
    // This bypasses the version check by doing a direct database update
    const updateQuery = {};
    
    // Build the update object
    Object.keys(updates).forEach(key => {
      if (key === 'hookPoints' || key === 'requestTypes' || key === 'dataObjects' || key === 'field') {
        const value = updates[key];
        if (key === 'hookPoints' || key === 'requestTypes' || key === 'dataObjects') {
          updateQuery[key] = Array.isArray(value) ? value : (value !== undefined && value !== null ? [value] : []);
        } else {
          updateQuery[key] = value !== undefined && value !== null ? value : '';
        }
      } else {
        updateQuery[key] = updates[key];
      }
    });
    
    // Ensure new fields are set even if empty
    if (updateQuery.hookPoints === undefined) updateQuery.hookPoints = [];
    if (updateQuery.requestTypes === undefined) updateQuery.requestTypes = [];
    if (updateQuery.dataObjects === undefined) updateQuery.dataObjects = [];
    if (updateQuery.field === undefined) updateQuery.field = '';
    
    console.log('💾 Update query:', Object.keys(updateQuery));
    
    // Perform the update directly - this bypasses version checking
    const updateResult = await BusinessRule.updateOne(
      { id: req.params.ruleId },
      { $set: updateQuery }
    );
    
    if (updateResult.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Business rule not found'
      });
    }
    
    // Re-fetch the updated document
    rule = await BusinessRule.findOne({ id: req.params.ruleId });
    
    // Log the saved values for verification
    console.log('✅ Saved hookPoints:', rule.hookPoints);
    console.log('✅ Saved requestTypes:', rule.requestTypes);
    console.log('✅ Saved dataObjects:', rule.dataObjects);
    
    // Re-fetch from database to verify persistence
    const verifiedRule = await BusinessRule.findOne({ id: req.params.ruleId });
    console.log('🔍 Verified from DB - hookPoints:', verifiedRule.hookPoints);
    console.log('🔍 Verified from DB - requestTypes:', verifiedRule.requestTypes);
    console.log('🔍 Verified from DB - dataObjects:', verifiedRule.dataObjects);

    res.json({
      success: true,
      message: 'Business rule updated successfully',
      data: verifiedRule || rule
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

// GET business rules by hook point (for executing rules at specific lifecycle events)
router.get('/hook-point/:hookPoint', async (req, res) => {
  try {
    const { hookPoint } = req.params;
    const { dataObject, scope, requestType } = req.query;
    
    // Build filter - rules must be active, enabled, and include this hook point
    const filter = {
      isActive: true,
      enabled: true,
      status: 'active',
      hookPoints: hookPoint // Rules that have this hook point in their array
    };
    
    // Optional filters
    if (dataObject) {
      filter.$or = [
        { dataObject: dataObject },
        { dataObjects: dataObject }
      ];
    }
    
    if (scope) {
      filter.scope = scope;
    }
    
    if (requestType) {
      filter.$or = [
        ...(filter.$or || []),
        { requestTypes: { $in: [requestType] } },
        { requestTypes: { $size: 0 } } // Also include rules with no requestTypes restriction
      ];
    }
    
    // Find rules matching the hook point, sorted by priority
    const rules = await BusinessRule.find(filter)
      .sort({ priority: 1, createdAt: -1 });
    
    console.log(`🔍 Found ${rules.length} rules for hook point "${hookPoint}"`);
    
    res.json({
      success: true,
      data: rules,
      searchCriteria: {
        hookPoint,
        dataObject: dataObject || null,
        scope: scope || null,
        requestType: requestType || null,
        totalMatches: rules.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching business rules by hook point',
      error: error.message
    });
  }
});

// POST execute business rules for a specific hook point with form data
router.post('/hook-point/:hookPoint/execute', async (req, res) => {
  try {
    const { hookPoint } = req.params;
    const { dataObject, scope, requestType, formData } = req.body;
    
    if (!formData) {
      return res.status(400).json({
        success: false,
        message: 'Form data is required for rule execution'
      });
    }
    
    // Build filter - rules must be active, enabled, and include this hook point
    const filter = {
      isActive: true,
      enabled: true,
      status: 'active',
      hookPoints: hookPoint
    };
    
    // Optional filters
    if (dataObject) {
      filter.$or = [
        { dataObject: dataObject },
        { dataObjects: dataObject }
      ];
    }
    
    if (scope) {
      filter.scope = scope;
    }
    
    if (requestType) {
      const requestTypeFilter = { requestTypes: { $in: [requestType] } };
      if (filter.$or) {
        filter.$or.push(requestTypeFilter);
      } else {
        filter.$or = [requestTypeFilter];
      }
    }
    
    // Find rules matching the hook point, sorted by priority
    const rules = await BusinessRule.find(filter)
      .sort({ priority: 1, createdAt: -1 });
    
    console.log(`🔍 Found ${rules.length} rules for hook point "${hookPoint}"`);
    
    // Execute rules and collect results
    const executionResults = [];
    let modifiedFormData = { ...formData };
    
    for (const rule of rules) {
      try {
        // Evaluate conditions
        const conditionsMet = rule.conditions.length === 0 || rule.evaluateConditions(modifiedFormData);
        
        if (conditionsMet) {
          // Execute actions
          const actionResults = rule.executeActions(modifiedFormData);
          
          // Update execution statistics
          await rule.incrementExecution(true);
          
          executionResults.push({
            ruleId: rule.id,
            ruleName: rule.name,
            executed: true,
            conditionsMet: true,
            actionsExecuted: actionResults,
            priority: rule.priority
          });
          
          // Apply actions to formData for subsequent rules
          actionResults.forEach(actionResult => {
            if (actionResult.success && actionResult.type === 'setField' && actionResult.field) {
              // Extract field and value from action result message if available
              const action = rule.actions.find(a => a.id === actionResult.actionId);
              if (action && action.field && action.value !== undefined) {
                modifiedFormData[action.field] = action.value;
              }
            }
          });
        } else {
          executionResults.push({
            ruleId: rule.id,
            ruleName: rule.name,
            executed: false,
            conditionsMet: false,
            message: 'Conditions not met',
            priority: rule.priority
          });
        }
      } catch (error) {
        await rule.incrementExecution(false);
        executionResults.push({
          ruleId: rule.id,
          ruleName: rule.name,
          executed: false,
          error: error.message,
          priority: rule.priority
        });
      }
    }
    
    res.json({
      success: true,
      data: {
        hookPoint,
        totalRules: rules.length,
        executedRules: executionResults.filter(r => r.executed).length,
        results: executionResults,
        modifiedFormData: modifiedFormData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error executing business rules for hook point',
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

// GET all supported condition operators (for frontend alignment)
router.get('/meta/operators', async (req, res) => {
  try {
    // Return the operators that match the frontend format
    const operators = [
      { value: 'equals', label: 'Equals' },
      { value: 'not_equals', label: 'Not Equals' },
      { value: 'greater_than', label: 'Greater Than' },
      { value: 'less_than', label: 'Less Than' },
      { value: 'contains', label: 'Contains' },
      { value: 'starts_with', label: 'Starts With' },
      { value: 'ends_with', label: 'Ends With' },
      { value: 'in', label: 'In List' },
      { value: 'not_in', label: 'Not In List' },
      { value: 'is_empty', label: 'Is Empty' },
      { value: 'is_not_empty', label: 'Is Not Empty' }
    ];
    
    res.json({
      success: true,
      data: operators
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching operators',
      error: error.message
    });
  }
});

module.exports = router;
