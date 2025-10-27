const express = require('express');
const router = express.Router();
const Form = require('../models/Form');

// GET all forms with pagination and filtering
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
    
    // Filter by tags
    if (req.query.tags) {
      const tags = Array.isArray(req.query.tags) ? req.query.tags : [req.query.tags];
      filter.tags = { $in: tags };
    }
    
    // Filter by SAP table
    if (req.query.sapTable) {
      filter.sapTable = req.query.sapTable;
    }
    
    // Filter by version
    if (req.query.version) {
      filter.version = req.query.version;
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
    
    // Filter by complexity
    if (req.query.minFields) {
      filter.totalFields = { $gte: parseInt(req.query.minFields) };
    }
    if (req.query.maxFields) {
      filter.totalFields = { ...filter.totalFields, $lte: parseInt(req.query.maxFields) };
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
    let sort = { createdAt: -1 };
    if (req.query.sortBy) {
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
      sort = { [req.query.sortBy]: sortOrder };
    }

    // Special sorting for best match
    if (req.query.sortBy === 'bestMatch' && req.query.search) {
      const forms = await Form.find(filter);
      
      // Score forms based on search relevance
      const scoredForms = forms.map(form => {
        let score = 0;
        const searchTerm = req.query.search.toLowerCase();
        
        // Name match (highest priority)
        if (form.name && form.name.toLowerCase().includes(searchTerm)) {
          score += 100;
        }
        
        // Description match
        if (form.description && form.description.toLowerCase().includes(searchTerm)) {
          score += 50;
        }
        
        // Data object match
        if (form.dataObject && form.dataObject.toLowerCase().includes(searchTerm)) {
          score += 30;
        }
        
        // Status boost
        if (form.status === 'active') score += 20;
        else if (form.status === 'draft') score += 10;
        
        // Complexity boost
        score += form.complexityScore * 0.1;
        
        // Usage count boost
        score += Math.min(form.usageCount * 0.1, 10);
        
        return {
          ...form.toObject(),
          matchScore: score
        };
      });
      
      // Sort by match score
      scoredForms.sort((a, b) => b.matchScore - a.matchScore);
      
      // Apply pagination
      const total = scoredForms.length;
      const paginatedForms = scoredForms.slice(skip, skip + limit);
      
      return res.json({
        success: true,
        data: paginatedForms,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    }

    const forms = await Form.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Form.countDocuments(filter);

    res.json({
      success: true,
      data: forms,
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
      message: 'Error fetching forms',
      error: error.message
    });
  }
});

// GET single form by ID
router.get('/:id', async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }

    // Increment usage count
    await form.incrementUsage();

    res.json({
      success: true,
      data: form
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching form',
      error: error.message
    });
  }
});

// GET form by custom ID (id field)
router.get('/by-form-id/:formId', async (req, res) => {
  try {
    const form = await Form.findOne({ id: req.params.formId });
    
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }

    // Increment usage count
    await form.incrementUsage();

    res.json({
      success: true,
      data: form
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching form',
      error: error.message
    });
  }
});

// POST create new form
router.post('/', async (req, res) => {
  try {
    const formData = req.body;
    
    // Check if form with same ID already exists
    if (formData.id) {
      const existingForm = await Form.findOne({ id: formData.id });
      if (existingForm) {
        return res.status(400).json({
          success: false,
          message: 'Form with this ID already exists'
        });
      }
    }
    
    // Set default values if not provided
    if (!formData.createdBy) {
      formData.createdBy = 'system';
    }
    
    const form = new Form(formData);
    await form.save();

    res.status(201).json({
      success: true,
      message: 'Form created successfully',
      data: form
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
      message: 'Error creating form',
      error: error.message
    });
  }
});

// PUT update form
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    
    // Prevent updating certain fields
    delete updates.id;
    delete updates.createdAt;
    delete updates.createdBy;
    
    const form = await Form.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }

    res.json({
      success: true,
      message: 'Form updated successfully',
      data: form
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
      message: 'Error updating form',
      error: error.message
    });
  }
});

// PATCH update form status
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
    
    const form = await Form.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }

    res.json({
      success: true,
      message: 'Form status updated successfully',
      data: form
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating form status',
      error: error.message
    });
  }
});

// PATCH update form configuration
router.patch('/:id/config', async (req, res) => {
  try {
    const { config, updatedBy } = req.body;
    
    if (!config || typeof config !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Config object is required'
      });
    }
    
    const updateData = { config };
    if (updatedBy) {
      updateData.updatedBy = updatedBy;
    }
    
    const form = await Form.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }

    res.json({
      success: true,
      message: 'Form configuration updated successfully',
      data: form
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating form configuration',
      error: error.message
    });
  }
});

// PATCH add field to form
router.patch('/:id/fields', async (req, res) => {
  try {
    const { field, updatedBy } = req.body;
    
    if (!field || !field.id) {
      return res.status(400).json({
        success: false,
        message: 'Field with ID is required'
      });
    }
    
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }
    
    // Check if field already exists
    const existingField = form.getFieldById(field.id);
    if (existingField) {
      return res.status(400).json({
        success: false,
        message: 'Field with this ID already exists'
      });
    }
    
    form.fields.push(field);
    if (updatedBy) {
      form.updatedBy = updatedBy;
    }
    
    await form.save();

    res.json({
      success: true,
      message: 'Field added successfully',
      data: form
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding field',
      error: error.message
    });
  }
});

// DELETE form
router.delete('/:id', async (req, res) => {
  try {
    const form = await Form.findByIdAndDelete(req.params.id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }

    res.json({
      success: true,
      message: 'Form deleted successfully',
      data: form
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting form',
      error: error.message
    });
  }
});

// GET forms by data object
router.get('/data-object/:dataObject', async (req, res) => {
  try {
    const { dataObject } = req.params;
    const { includeInactive = false } = req.query;
    
    const filter = { dataObject };
    if (!includeInactive) {
      filter.isActive = true;
    }
    
    const forms = await Form.find(filter)
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: forms,
      searchCriteria: {
        dataObject,
        includeInactive: includeInactive === 'true',
        totalMatches: forms.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching forms by data object',
      error: error.message
    });
  }
});

// GET forms by user (created by)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { includeInactive = false } = req.query;
    
    const filter = { createdBy: userId };
    if (!includeInactive) {
      filter.isActive = true;
    }
    
    const forms = await Form.find(filter)
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: forms,
      searchCriteria: {
        userId,
        includeInactive: includeInactive === 'true',
        totalMatches: forms.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user forms',
      error: error.message
    });
  }
});

// GET form statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Form.aggregate([
      {
        $group: {
          _id: null,
          totalForms: { $sum: 1 },
          activeForms: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          activeStatusForms: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          draftForms: {
            $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
          },
          archivedForms: {
            $sum: { $cond: [{ $eq: ['$status', 'archived'] }, 1, 0] }
          },
          totalUsage: { $sum: '$usageCount' },
          totalFields: { $sum: '$totalFields' },
          totalTabs: { $sum: '$totalTabs' },
          totalSections: { $sum: '$totalSections' }
        }
      }
    ]);

    const dataObjectStats = await Form.aggregate([
      {
        $group: {
          _id: '$dataObject',
          count: { $sum: 1 },
          totalUsage: { $sum: '$usageCount' },
          totalFields: { $sum: '$totalFields' }
        }
      }
    ]);

    const statusStats = await Form.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const monthlyStats = await Form.aggregate([
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
          totalForms: 0,
          activeForms: 0,
          activeStatusForms: 0,
          draftForms: 0,
          archivedForms: 0,
          totalUsage: 0,
          totalFields: 0,
          totalTabs: 0,
          totalSections: 0
        },
        byDataObject: dataObjectStats,
        byStatus: statusStats,
        monthly: monthlyStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching form statistics',
      error: error.message
    });
  }
});

// GET all unique data objects
router.get('/meta/data-objects', async (req, res) => {
  try {
    const dataObjects = await Form.distinct('dataObject');
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
    const statuses = await Form.distinct('status');
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
    const tags = await Form.distinct('tags');
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

// GET form field types
router.get('/meta/field-types', async (req, res) => {
  try {
    const fieldTypes = [
      "text", "email", "password", "number", "tel", "url", "search",
      "date", "time", "datetime-local", "month", "week", "color", "range",
      "file", "checkbox", "radio", "select", "textarea", "hidden", "readonly"
    ];
    
    res.json({
      success: true,
      data: fieldTypes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching field types',
      error: error.message
    });
  }
});

module.exports = router;
