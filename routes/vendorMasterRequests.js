const express = require('express');
const router = express.Router();
const VendorMasterRequest = require('../models/VendorMasterRequest');

// GET all vendor master requests with pagination and filtering
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
    
    // Filter by priority
    if (req.query.priority) {
      filter.priority = req.query.priority;
    }
    
    // Filter by requester
    if (req.query.requesterId) {
      filter.requesterId = req.query.requesterId;
    }
    
    // Filter by request type
    if (req.query.requestType) {
      filter.requestType = req.query.requestType;
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
    
    // Search by request ID, description, or business justification
    if (req.query.search) {
      filter.$or = [
        { requestId: { $regex: req.query.search, $options: 'i' } },
        { requestDescription: { $regex: req.query.search, $options: 'i' } },
        { businessJustification: { $regex: req.query.search, $options: 'i' } },
        { 'requestItems.vendorId': { $regex: req.query.search, $options: 'i' } },
        { 'requestItems.vendorName1': { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Sort options
    let sort = { createdAt: -1 };
    if (req.query.sortBy) {
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
      sort = { [req.query.sortBy]: sortOrder };
    }

    const vendorMasterRequests = await VendorMasterRequest.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await VendorMasterRequest.countDocuments(filter);

    res.json({
      success: true,
      data: vendorMasterRequests,
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
      message: 'Error fetching vendor master requests',
      error: error.message
    });
  }
});

// GET single vendor master request by ID
router.get('/:id', async (req, res) => {
  try {
    const vendorMasterRequest = await VendorMasterRequest.findById(req.params.id);
    
    if (!vendorMasterRequest) {
      return res.status(404).json({
        success: false,
        message: 'Vendor master request not found'
      });
    }

    res.json({
      success: true,
      data: vendorMasterRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching vendor master request',
      error: error.message
    });
  }
});

// GET vendor master request by request ID
router.get('/by-request-id/:requestId', async (req, res) => {
  try {
    const vendorMasterRequest = await VendorMasterRequest.findOne({ 
      requestId: req.params.requestId 
    });
    
    if (!vendorMasterRequest) {
      return res.status(404).json({
        success: false,
        message: 'Vendor master request not found'
      });
    }

    res.json({
      success: true,
      data: vendorMasterRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching vendor master request',
      error: error.message
    });
  }
});

// POST create new vendor master request
router.post('/', async (req, res) => {
  try {
    console.log('📝 Vendor Master Request POST - Request body:', req.body);
    const requestData = req.body;
    
    // Support both requestItems (legacy) and requestItems for backward compatibility
    if (requestData.requestItems && !requestData.requestItems) {
      requestData.requestItems = requestData.requestItems;
      delete requestData.requestItems;
    }
    
    // Check if request with same ID already exists
    if (requestData.requestId) {
      const existingRequest = await VendorMasterRequest.findOne({ requestId: requestData.requestId });
      if (existingRequest) {
        return res.status(400).json({
          success: false,
          message: 'Vendor master request with this Request ID already exists'
        });
      }
    } else {
      // Generate request ID if not provided
      const timestamp = Date.now().toString(36).toUpperCase();
      const randomStr = Math.random().toString(36).substr(2, 5).toUpperCase();
      requestData.requestId = `REQ-${timestamp}-${randomStr}`;
    }
    
    // Validate requestItems (vendor items) array
    if (!requestData.requestItems || !Array.isArray(requestData.requestItems) || requestData.requestItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one vendor item is required in requestItems array'
      });
    }
    
    // Validate each vendor item
    for (let i = 0; i < requestData.requestItems.length; i++) {
      const item = requestData.requestItems[i];
      
      if (!item.vendorId) {
        return res.status(400).json({
          success: false,
          message: `Vendor ID is required for item ${i + 1}`
        });
      }
      
      if (!item.accountGroup) {
        return res.status(400).json({
          success: false,
          message: `Account Group is required for item ${i + 1}`
        });
      }
      
      if (!item.vendorName1) {
        return res.status(400).json({
          success: false,
          message: `Vendor Name is required for item ${i + 1}`
        });
      }
      
      if (!item.companyCode) {
        return res.status(400).json({
          success: false,
          message: `Company Code is required for item ${i + 1}`
        });
      }
      
      if (!item.purchasingOrg) {
        return res.status(400).json({
          success: false,
          message: `Purchasing Organization is required for item ${i + 1}`
        });
      }
    }
    
    // Set initial status
    if (!requestData.status) {
      requestData.status = 'draft';
    }
    
    console.log("requestData", requestData);
    const vendorMasterRequest = new VendorMasterRequest(requestData);
    await vendorMasterRequest.save();

    res.status(201).json({
      success: true,
      message: 'Vendor master request created successfully',
      data: vendorMasterRequest
    });
  } catch (error) {
    console.error('❌ Vendor Master Request POST Error:', error);
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
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Vendor master request with this Request ID already exists',
        error: error.message
      });
    }
    
    console.error('❌ 500 Error creating vendor master request:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error creating vendor master request',
      error: error.message
    });
  }
});

// PUT update vendor master request by ID
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    
    // Support both requestItems (legacy) and requestItems for backward compatibility
    if (updates.requestItems && !updates.requestItems) {
      updates.requestItems = updates.requestItems;
      delete updates.requestItems;
    }
    
    // Prevent updating certain fields
    delete updates.requestId;
    delete updates.status;
    delete updates.submittedAt;
    delete updates.approvedBy;
    delete updates.approvedAt;
    delete updates.rejectionReason;
    delete updates.completedAt;
    
    console.log("updates >> ", updates);
    
    // Validate requestItems if being updated
    if (updates.requestItems) {
      if (!Array.isArray(updates.requestItems) || updates.requestItems.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one vendor item is required in requestItems array'
        });
      }
      
      // Validate each vendor item
      for (let i = 0; i < updates.requestItems.length; i++) {
        const item = updates.requestItems[i];
        
        if (!item.vendorId) {
          return res.status(400).json({
            success: false,
            message: `Vendor ID is required for item ${i + 1}`
          });
        }
        
        if (!item.accountGroup) {
          return res.status(400).json({
            success: false,
            message: `Account Group is required for item ${i + 1}`
          });
        }
        
        if (!item.vendorName1) {
          return res.status(400).json({
            success: false,
            message: `Vendor Name is required for item ${i + 1}`
          });
        }
        
        if (!item.companyCode) {
          return res.status(400).json({
            success: false,
            message: `Company Code is required for item ${i + 1}`
          });
        }
        
        if (!item.purchasingOrg) {
          return res.status(400).json({
            success: false,
            message: `Purchasing Organization is required for item ${i + 1}`
          });
        }
      }
    }
    
    const vendorMasterRequest = await VendorMasterRequest.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!vendorMasterRequest) {
      return res.status(404).json({
        success: false,
        message: 'Vendor master request not found'
      });
    }

    res.json({
      success: true,
      message: 'Vendor master request updated successfully',
      data: vendorMasterRequest
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
      message: 'Error updating vendor master request',
      error: error.message
    });
  }
});

// PUT update vendor master request by request ID
router.put('/by-request-id/:requestId', async (req, res) => {
  try {
    const updates = req.body;
    
    // Support both requestItems (legacy) and requestItems for backward compatibility
    if (updates.requestItems && !updates.requestItems) {
      updates.requestItems = updates.requestItems;
      delete updates.requestItems;
    }
    
    // Prevent updating certain fields
    delete updates.requestId;
    delete updates.status;
    delete updates.submittedAt;
    delete updates.approvedBy;
    delete updates.approvedAt;
    delete updates.rejectionReason;
    delete updates.completedAt;
    
    // Validate requestItems if being updated
    if (updates.requestItems) {
      if (!Array.isArray(updates.requestItems) || updates.requestItems.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one vendor item is required in requestItems array'
        });
      }
      
      // Validate each vendor item
      for (let i = 0; i < updates.requestItems.length; i++) {
        const item = updates.requestItems[i];
        
        if (!item.vendorId) {
          return res.status(400).json({
            success: false,
            message: `Vendor ID is required for item ${i + 1}`
          });
        }
        
        if (!item.accountGroup) {
          return res.status(400).json({
            success: false,
            message: `Account Group is required for item ${i + 1}`
          });
        }
        
        if (!item.vendorName1) {
          return res.status(400).json({
            success: false,
            message: `Vendor Name is required for item ${i + 1}`
          });
        }
        
        if (!item.companyCode) {
          return res.status(400).json({
            success: false,
            message: `Company Code is required for item ${i + 1}`
          });
        }
        
        if (!item.purchasingOrg) {
          return res.status(400).json({
            success: false,
            message: `Purchasing Organization is required for item ${i + 1}`
          });
        }
      }
    }
    
    const vendorMasterRequest = await VendorMasterRequest.findOneAndUpdate(
      { requestId: req.params.requestId },
      updates,
      { new: true, runValidators: true }
    );

    if (!vendorMasterRequest) {
      return res.status(404).json({
        success: false,
        message: 'Vendor master request not found'
      });
    }

    res.json({
      success: true,
      message: 'Vendor master request updated successfully',
      data: vendorMasterRequest
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
      message: 'Error updating vendor master request',
      error: error.message
    });
  }
});

// PATCH update vendor master request status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, approvedBy, rejectionReason, notes } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    const vendorMasterRequest = await VendorMasterRequest.findById(req.params.id);
    if (!vendorMasterRequest) {
      return res.status(404).json({
        success: false,
        message: 'Vendor master request not found'
      });
    }
    
    // Update status
    vendorMasterRequest.status = status;
    
    // Handle status-specific updates
    if (status === 'submitted') {
      vendorMasterRequest.submittedAt = new Date();
    } else if (status === 'approved') {
      if (!approvedBy) {
        return res.status(400).json({
          success: false,
          message: 'Approved By is required when approving a request'
        });
      }
      vendorMasterRequest.approvedBy = approvedBy;
      vendorMasterRequest.approvedAt = new Date();
    } else if (status === 'rejected') {
      if (!rejectionReason) {
        return res.status(400).json({
          success: false,
          message: 'Rejection reason is required when rejecting a request'
        });
      }
      vendorMasterRequest.rejectionReason = rejectionReason;
    } else if (status === 'completed') {
      vendorMasterRequest.completedAt = new Date();
    }
    
    // Update notes if provided
    if (notes !== undefined) {
      vendorMasterRequest.notes = notes;
    }
    
    await vendorMasterRequest.save();

    res.json({
      success: true,
      message: 'Vendor master request status updated successfully',
      data: vendorMasterRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating vendor master request status',
      error: error.message
    });
  }
});

// DELETE vendor master request (soft delete by updating status)
router.delete('/:id', async (req, res) => {
  try {
    const vendorMasterRequest = await VendorMasterRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );

    if (!vendorMasterRequest) {
      return res.status(404).json({
        success: false,
        message: 'Vendor master request not found'
      });
    }

    res.json({
      success: true,
      message: 'Vendor master request cancelled successfully',
      data: vendorMasterRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling vendor master request',
      error: error.message
    });
  }
});

// DELETE vendor master request by request ID
router.delete('/by-request-id/:requestId', async (req, res) => {
  try {
    const vendorMasterRequest = await VendorMasterRequest.findOneAndUpdate(
      { requestId: req.params.requestId },
      { status: 'cancelled' },
      { new: true }
    );

    if (!vendorMasterRequest) {
      return res.status(404).json({
        success: false,
        message: 'Vendor master request not found'
      });
    }

    res.json({
      success: true,
      message: 'Vendor master request cancelled successfully',
      data: vendorMasterRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling vendor master request',
      error: error.message
    });
  }
});

// GET vendor master request statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await VendorMasterRequest.aggregate([
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
          },
          cancelledRequests: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          }
        }
      }
    ]);

    const priorityStats = await VendorMasterRequest.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const monthlyStats = await VendorMasterRequest.aggregate([
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
          completedRequests: 0,
          cancelledRequests: 0
        },
        byPriority: priorityStats,
        monthly: monthlyStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching vendor master request statistics',
      error: error.message
    });
  }
});

module.exports = router;
