const express = require('express');
const router = express.Router();
const GLAccountRequest = require('../models/GLAccountRequest');

// GET all GL account requests with pagination and filtering
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
        { 'requestItems.glAccountNumber': { $regex: req.query.search, $options: 'i' } },
        { 'requestItems.glAccountNameShort': { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Sort options
    let sort = { createdAt: -1 };
    if (req.query.sortBy) {
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
      sort = { [req.query.sortBy]: sortOrder };
    }

    const glAccountRequests = await GLAccountRequest.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await GLAccountRequest.countDocuments(filter);

    res.json({
      success: true,
      data: glAccountRequests,
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
      message: 'Error fetching GL account requests',
      error: error.message
    });
  }
});

// GET single GL account request by ID
router.get('/:id', async (req, res) => {
  try {
    const glAccountRequest = await GLAccountRequest.findById(req.params.id);
    
    if (!glAccountRequest) {
      return res.status(404).json({
        success: false,
        message: 'GL account request not found'
      });
    }

    res.json({
      success: true,
      data: glAccountRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching GL account request',
      error: error.message
    });
  }
});

// GET GL account request by request ID
router.get('/by-request-id/:requestId', async (req, res) => {
  try {
    const glAccountRequest = await GLAccountRequest.findOne({ 
      requestId: req.params.requestId 
    });
    
    if (!glAccountRequest) {
      return res.status(404).json({
        success: false,
        message: 'GL account request not found'
      });
    }

    res.json({
      success: true,
      data: glAccountRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching GL account request',
      error: error.message
    });
  }
});

// POST create new GL account request
router.post('/', async (req, res) => {
  try {
    console.log('📝 GL Account Request POST - Request body:', req.body);
    const requestData = req.body;
    
    // Support both requestItems (legacy) and requestItems for backward compatibility
    if (requestData.requestItems && !requestData.requestItems) {
      requestData.requestItems = requestData.requestItems;
      delete requestData.requestItems;
    }
    
    // Check if request with same ID already exists
    if (requestData.requestId) {
      const existingRequest = await GLAccountRequest.findOne({ requestId: requestData.requestId });
      if (existingRequest) {
        return res.status(400).json({
          success: false,
          message: 'GL account request with this Request ID already exists'
        });
      }
    } else {
      // Generate request ID if not provided
      const timestamp = Date.now().toString(36).toUpperCase();
      const randomStr = Math.random().toString(36).substr(2, 5).toUpperCase();
      requestData.requestId = `REQ-${timestamp}-${randomStr}`;
    }
    
    // Validate requestItems (GL account items) array
    if (!requestData.requestItems || !Array.isArray(requestData.requestItems) || requestData.requestItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one GL account item is required in requestItems array'
      });
    }
    
    // Validate each GL account item
    for (let i = 0; i < requestData.requestItems.length; i++) {
      const item = requestData.requestItems[i];
      
      if (!item.glAccountNumber) {
        return res.status(400).json({
          success: false,
          message: `GL Account Number is required for item ${i + 1}`
        });
      }
      
      if (!item.accountType) {
        return res.status(400).json({
          success: false,
          message: `Account Type is required for item ${i + 1}`
        });
      }
      
      if (!item.accountGroup) {
        return res.status(400).json({
          success: false,
          message: `Account Group is required for item ${i + 1}`
        });
      }
      
      if (!item.glAccountNameShort) {
        return res.status(400).json({
          success: false,
          message: `GL Account Name is required for item ${i + 1}`
        });
      }
      
      if (!item.chartOfAccounts) {
        return res.status(400).json({
          success: false,
          message: `Chart of Accounts is required for item ${i + 1}`
        });
      }
      
      if (!item.companyCode) {
        return res.status(400).json({
          success: false,
          message: `Company Code is required for item ${i + 1}`
        });
      }
    }
    
    // Set initial status
    if (!requestData.status) {
      requestData.status = 'draft';
    }
    
    console.log("requestData", requestData);
    const glAccountRequest = new GLAccountRequest(requestData);
    await glAccountRequest.save();

    res.status(201).json({
      success: true,
      message: 'GL account request created successfully',
      data: glAccountRequest
    });
  } catch (error) {
    console.error('❌ GL Account Request POST Error:', error);
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
        message: 'GL account request with this Request ID already exists',
        error: error.message
      });
    }
    
    console.error('❌ 500 Error creating GL account request:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error creating GL account request',
      error: error.message
    });
  }
});

// PUT update GL account request by ID
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
          message: 'At least one GL account item is required in requestItems array'
        });
      }
      
      // Validate each GL account item
      for (let i = 0; i < updates.requestItems.length; i++) {
        const item = updates.requestItems[i];
        
        if (!item.glAccountNumber) {
          return res.status(400).json({
            success: false,
            message: `GL Account Number is required for item ${i + 1}`
          });
        }
        
        if (!item.accountType) {
          return res.status(400).json({
            success: false,
            message: `Account Type is required for item ${i + 1}`
          });
        }
        
        if (!item.accountGroup) {
          return res.status(400).json({
            success: false,
            message: `Account Group is required for item ${i + 1}`
          });
        }
        
        if (!item.glAccountNameShort) {
          return res.status(400).json({
            success: false,
            message: `GL Account Name is required for item ${i + 1}`
          });
        }
        
        if (!item.chartOfAccounts) {
          return res.status(400).json({
            success: false,
            message: `Chart of Accounts is required for item ${i + 1}`
          });
        }
        
        if (!item.companyCode) {
          return res.status(400).json({
            success: false,
            message: `Company Code is required for item ${i + 1}`
          });
        }
      }
    }
    
    const glAccountRequest = await GLAccountRequest.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!glAccountRequest) {
      return res.status(404).json({
        success: false,
        message: 'GL account request not found'
      });
    }

    res.json({
      success: true,
      message: 'GL account request updated successfully',
      data: glAccountRequest
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
      message: 'Error updating GL account request',
      error: error.message
    });
  }
});

// PUT update GL account request by request ID
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
          message: 'At least one GL account item is required in requestItems array'
        });
      }
      
      // Validate each GL account item
      for (let i = 0; i < updates.requestItems.length; i++) {
        const item = updates.requestItems[i];
        
        if (!item.glAccountNumber) {
          return res.status(400).json({
            success: false,
            message: `GL Account Number is required for item ${i + 1}`
          });
        }
        
        if (!item.accountType) {
          return res.status(400).json({
            success: false,
            message: `Account Type is required for item ${i + 1}`
          });
        }
        
        if (!item.accountGroup) {
          return res.status(400).json({
            success: false,
            message: `Account Group is required for item ${i + 1}`
          });
        }
        
        if (!item.glAccountNameShort) {
          return res.status(400).json({
            success: false,
            message: `GL Account Name is required for item ${i + 1}`
          });
        }
        
        if (!item.chartOfAccounts) {
          return res.status(400).json({
            success: false,
            message: `Chart of Accounts is required for item ${i + 1}`
          });
        }
        
        if (!item.companyCode) {
          return res.status(400).json({
            success: false,
            message: `Company Code is required for item ${i + 1}`
          });
        }
      }
    }
    
    const glAccountRequest = await GLAccountRequest.findOneAndUpdate(
      { requestId: req.params.requestId },
      updates,
      { new: true, runValidators: true }
    );

    if (!glAccountRequest) {
      return res.status(404).json({
        success: false,
        message: 'GL account request not found'
      });
    }

    res.json({
      success: true,
      message: 'GL account request updated successfully',
      data: glAccountRequest
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
      message: 'Error updating GL account request',
      error: error.message
    });
  }
});

// PATCH update GL account request status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, approvedBy, rejectionReason, notes } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    const glAccountRequest = await GLAccountRequest.findById(req.params.id);
    if (!glAccountRequest) {
      return res.status(404).json({
        success: false,
        message: 'GL account request not found'
      });
    }
    
    // Update status
    glAccountRequest.status = status;
    
    // Handle status-specific updates
    if (status === 'submitted') {
      glAccountRequest.submittedAt = new Date();
    } else if (status === 'approved') {
      if (!approvedBy) {
        return res.status(400).json({
          success: false,
          message: 'Approved By is required when approving a request'
        });
      }
      glAccountRequest.approvedBy = approvedBy;
      glAccountRequest.approvedAt = new Date();
    } else if (status === 'rejected') {
      if (!rejectionReason) {
        return res.status(400).json({
          success: false,
          message: 'Rejection reason is required when rejecting a request'
        });
      }
      glAccountRequest.rejectionReason = rejectionReason;
    } else if (status === 'completed') {
      glAccountRequest.completedAt = new Date();
    }
    
    // Update notes if provided
    if (notes !== undefined) {
      glAccountRequest.notes = notes;
    }
    
    await glAccountRequest.save();

    res.json({
      success: true,
      message: 'GL account request status updated successfully',
      data: glAccountRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating GL account request status',
      error: error.message
    });
  }
});

// DELETE GL account request (soft delete by updating status)
router.delete('/:id', async (req, res) => {
  try {
    const glAccountRequest = await GLAccountRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );

    if (!glAccountRequest) {
      return res.status(404).json({
        success: false,
        message: 'GL account request not found'
      });
    }

    res.json({
      success: true,
      message: 'GL account request cancelled successfully',
      data: glAccountRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling GL account request',
      error: error.message
    });
  }
});

// DELETE GL account request by request ID
router.delete('/by-request-id/:requestId', async (req, res) => {
  try {
    const glAccountRequest = await GLAccountRequest.findOneAndUpdate(
      { requestId: req.params.requestId },
      { status: 'cancelled' },
      { new: true }
    );

    if (!glAccountRequest) {
      return res.status(404).json({
        success: false,
        message: 'GL account request not found'
      });
    }

    res.json({
      success: true,
      message: 'GL account request cancelled successfully',
      data: glAccountRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling GL account request',
      error: error.message
    });
  }
});

// GET GL account request statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await GLAccountRequest.aggregate([
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

    const priorityStats = await GLAccountRequest.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const monthlyStats = await GLAccountRequest.aggregate([
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
      message: 'Error fetching GL account request statistics',
      error: error.message
    });
  }
});

module.exports = router;
