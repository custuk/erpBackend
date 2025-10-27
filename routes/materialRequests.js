const express = require('express');
const router = express.Router();
const MaterialRequest = require('../models/MaterialRequest');

// GET all material requests with pagination and filtering
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
    
    // Filter by requester
    if (req.query.requesterId) {
      filter.requesterId = req.query.requesterId;
    }
    
    // Filter by setup type
    if (req.query.setupType) {
      filter.setupType = req.query.setupType;
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
    
    // Search by request ID or description
    if (req.query.search) {
      filter.$or = [
        { requestId: { $regex: req.query.search, $options: 'i' } },
        { requestDescription: { $regex: req.query.search, $options: 'i' } },
        { businessJustification: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Sort options
    let sort = { createdAt: -1 };
    if (req.query.sortBy) {
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
      sort = { [req.query.sortBy]: sortOrder };
    }

    const materialRequests = await MaterialRequest.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await MaterialRequest.countDocuments(filter);

    res.json({
      success: true,
      data: materialRequests,
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
      message: 'Error fetching material requests',
      error: error.message
    });
  }
});

// GET single material request by ID
router.get('/:id', async (req, res) => {
  try {
    const materialRequest = await MaterialRequest.findById(req.params.id);
    
    if (!materialRequest) {
      return res.status(404).json({
        success: false,
        message: 'Material request not found'
      });
    }

    res.json({
      success: true,
      data: materialRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching material request',
      error: error.message
    });
  }
});

// POST create new material request
router.post('/', async (req, res) => {
  try {
    console.log('📝 Material Request POST - Request body:', JSON.stringify(req.body, null, 2));
    const requestData = req.body;
    
    // Check if request with same ID already exists
    if (requestData.requestId) {
      const existingRequest = await MaterialRequest.findOne({ requestId: requestData.requestId });
      if (existingRequest) {
        return res.status(400).json({
          success: false,
          message: 'Material request with this Request ID already exists'
        });
      }
    }
    
    // Validate material items
    if (!requestData.materialItems || requestData.materialItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one material item is required'
      });
    }
    
    // Validate setup type specific fields for each material item
    for (let i = 0; i < requestData.materialItems.length; i++) {
      const item = requestData.materialItems[i];
      console.log(`AG123 >> Item ${i}: setupType=${item.setupType}, location=${item.location}, fromLocation=${item.fromLocation}, toLocation=${item.toLocation}`);
      
      if (item.setupType === 'SingleLocation' && !item.location) {
        return res.status(400).json({
          success: false,
          message: `Location is required for Single Location setup in material item ${i + 1}`
        });
      }
      
      if (item.setupType === 'SupplyChainRoute' && (!item.fromLocation || !item.toLocation)) {
        return res.status(400).json({
          success: false,
          message: `From Location and To Location are required for Supply Chain Route setup in material item ${i + 1}`
        });
      }
    }
    
    // Set initial status
    requestData.status = 'draft';
    
    const materialRequest = new MaterialRequest(requestData);
    await materialRequest.save();

    res.status(201).json({
      success: true,
      message: 'Material request created successfully',
      data: materialRequest
    });
  } catch (error) {
    console.error('❌ Material Request POST Error:', error);
    console.error('❌ Error stack:', error.stack);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      console.log('❌ Validation errors:', messages);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }
    
    console.error('❌ 500 Error creating material request:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error creating material request',
      error: error.message
    });
  }
});

// PUT update material request by requestId
router.put('/by-request-id/:requestId', async (req, res) => {
  try {
    const updates = req.body;
    
    // Prevent updating certain fields
    delete updates.requestId;
    delete updates.status;
    delete updates.submittedAt;
    delete updates.approvedBy;
    delete updates.approvedAt;
    delete updates.rejectionReason;
    
    // Validate material items if being updated
    if (updates.materialItems && updates.materialItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one material item is required'
      });
    }
    
    // Validate setup type specific fields for each material item
    if (updates.materialItems) {
      for (let i = 0; i < updates.materialItems.length; i++) {
        const item = updates.materialItems[i];
        console.log(`AG123 >> Update Item ${i}: setupType=${item.setupType}, location=${item.location}, fromLocation=${item.fromLocation}, toLocation=${item.toLocation}`);
        
        if (item.setupType === 'SingleLocation' && !item.location) {
          return res.status(400).json({
            success: false,
            message: `Location is required for Single Location setup in material item ${i + 1}`
          });
        }
        
        if (item.setupType === 'SupplyChainRoute' && (!item.fromLocation || !item.toLocation)) {
          return res.status(400).json({
            success: false,
            message: `From Location and To Location are required for Supply Chain Route setup in material item ${i + 1}`
          });
        }
      }
    }
    
    const materialRequest = await MaterialRequest.findOneAndUpdate(
      { requestId: req.params.requestId },
      updates,
      { new: true, runValidators: true }
    );

    if (!materialRequest) {
      return res.status(404).json({
        success: false,
        message: 'Material request not found'
      });
    }

    res.json({
      success: true,
      message: 'Material request updated successfully',
      data: materialRequest
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
      message: 'Error updating material request',
      error: error.message
    });
  }
});

// PUT update material request
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    
    // Prevent updating certain fields
    delete updates.requestId;
    delete updates.status;
    delete updates.submittedAt;
    delete updates.approvedBy;
    delete updates.approvedAt;
    delete updates.rejectionReason;
    
    // Validate material items if being updated
    if (updates.materialItems && updates.materialItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one material item is required'
      });
    }
    
    const materialRequest = await MaterialRequest.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!materialRequest) {
      return res.status(404).json({
        success: false,
        message: 'Material request not found'
      });
    }

    res.json({
      success: true,
      message: 'Material request updated successfully',
      data: materialRequest
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
      message: 'Error updating material request',
      error: error.message
    });
  }
});

// PATCH update material request status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, approvedBy, rejectionReason } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    const materialRequest = await MaterialRequest.findById(req.params.id);
    if (!materialRequest) {
      return res.status(404).json({
        success: false,
        message: 'Material request not found'
      });
    }
    
    // Update status
    materialRequest.status = status;
    
    // Handle status-specific updates
    if (status === 'submitted') {
      materialRequest.submittedAt = new Date();
    } else if (status === 'approved') {
      if (!approvedBy) {
        return res.status(400).json({
          success: false,
          message: 'Approved By is required when approving a request'
        });
      }
      materialRequest.approvedBy = approvedBy;
      materialRequest.approvedAt = new Date();
    } else if (status === 'rejected') {
      if (!rejectionReason) {
        return res.status(400).json({
          success: false,
          message: 'Rejection reason is required when rejecting a request'
        });
      }
      materialRequest.rejectionReason = rejectionReason;
    }
    
    await materialRequest.save();

    res.json({
      success: true,
      message: 'Material request status updated successfully',
      data: materialRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating material request status',
      error: error.message
    });
  }
});

// DELETE material request (soft delete by updating status)
router.delete('/:id', async (req, res) => {
  try {
    const materialRequest = await MaterialRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );

    if (!materialRequest) {
      return res.status(404).json({
        success: false,
        message: 'Material request not found'
      });
    }

    res.json({
      success: true,
      message: 'Material request cancelled successfully',
      data: materialRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling material request',
      error: error.message
    });
  }
});

// GET material request statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await MaterialRequest.aggregate([
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          draftRequests: {
            $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
          },
          submittedRequests: {
            $sum: { $cond: [{ $eq: ['$status', 'submitted'] }, 1, 0] }
          },
          approvedRequests: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          rejectedRequests: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          },
          inProgressRequests: {
            $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
          },
          completedRequests: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      }
    ]);

    const setupTypeStats = await MaterialRequest.aggregate([
      {
        $group: {
          _id: '$setupType',
          count: { $sum: 1 }
        }
      }
    ]);

    const monthlyStats = await MaterialRequest.aggregate([
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
          totalRequests: 0,
          draftRequests: 0,
          submittedRequests: 0,
          approvedRequests: 0,
          rejectedRequests: 0,
          inProgressRequests: 0,
          completedRequests: 0
        },
        bySetupType: setupTypeStats,
        monthly: monthlyStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching material request statistics',
      error: error.message
    });
  }
});

// GET material request by request ID
router.get('/by-request-id/:requestId', async (req, res) => {
  try {
    const materialRequest = await MaterialRequest.findOne({ 
      requestId: req.params.requestId 
    });
    
    if (!materialRequest) {
      return res.status(404).json({
        success: false,
        message: 'Material request not found'
      });
    }

    res.json({
      success: true,
      data: materialRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching material request',
      error: error.message
    });
  }
});

module.exports = router;



