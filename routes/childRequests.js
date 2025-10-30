const express = require('express');
const router = express.Router();
const ChildRequest = require('../models/ChildRequest');
const DataRequest = require('../models/DataRequest');

// GET all child requests with pagination and filtering
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
    
    // Filter by parent request ID
    if (req.query.parentRequestId) {
      filter.parentRequestIdString = req.query.parentRequestId;
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
    
    // Search by child request ID, description, or business justification
    if (req.query.search) {
      filter.$or = [
        { childRequestId: { $regex: req.query.search, $options: 'i' } },
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

    const childRequests = await ChildRequest.find(filter)
      .populate('parentRequestId', 'requestId requestDescription status')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await ChildRequest.countDocuments(filter);

    res.json({
      success: true,
      data: childRequests,
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
      message: 'Error fetching child requests',
      error: error.message
    });
  }
});

// GET single child request by ID
router.get('/:id', async (req, res) => {
  try {
    const childRequest = await ChildRequest.findById(req.params.id)
      .populate('parentRequestId', 'requestId requestDescription status requestItems');
    
    if (!childRequest) {
      return res.status(404).json({
        success: false,
        message: 'Child request not found'
      });
    }

    res.json({
      success: true,
      data: childRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching child request',
      error: error.message
    });
  }
});

// GET child request by child request ID
router.get('/by-child-request-id/:childRequestId', async (req, res) => {
    console.log("Hello....")
  try {
    const childRequest = await ChildRequest.findOne({ 
      childRequestId: req.params.childRequestId 
    }).populate('parentRequestId', 'requestId requestDescription status requestItems');
    
    if (!childRequest) {
      return res.status(404).json({
        success: false,
        message: 'Child request not found'
      });
    }

    res.json({
      success: true,
      data: childRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching child request',
      error: error.message
    });
  }
});

// GET all child requests for a specific parent request
router.get('/parent/:parentRequestId', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 500;
    const skip = (page - 1) * limit;
    
    const filter = { parentRequestIdString: req.params.parentRequestId };
    
    // Additional filters
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.priority) {
      filter.priority = req.query.priority;
    }

    // Sort options
    let sort = { createdAt: -1 };
    if (req.query.sortBy) {
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
      sort = { [req.query.sortBy]: sortOrder };
    }

    const childRequests = await ChildRequest.find(filter)
      .populate('parentRequestId', 'requestId requestDescription status')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await ChildRequest.countDocuments(filter);

    res.json({
      success: true,
      data: childRequests,
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
      message: 'Error fetching child requests for parent',
      error: error.message
    });
  }
});

// POST create new child request
router.post('/', async (req, res) => {
  try {
    console.log('📝 Child Request POST - Request body:', req.body);
    const requestData = req.body;
    
    // Validate parent request exists
    const parentRequest = await DataRequest.findById(requestData.parentRequestId);
    if (!parentRequest) {
      return res.status(400).json({
        success: false,
        message: 'Parent request not found'
      });
    }
    
    // Check if child request with same ID already exists
    if (requestData.childRequestId) {
      const existingRequest = await ChildRequest.findOne({ childRequestId: requestData.childRequestId });
      if (existingRequest) {
        return res.status(400).json({
          success: false,
          message: 'Child request with this Child Request ID already exists'
        });
      }
    } else {
      // Generate child request ID if not provided
      // Format: parentRequestId-6charAlphanumeric
      const randomId = Math.random().toString(36).substr(2, 6).toUpperCase();
      requestData.childRequestId = `${parentRequest.requestId}-${randomId}`;
    }
    
    // Set parent request ID string for easier querying
    requestData.parentRequestIdString = parentRequest.requestId;
    
    // Validate required material fields at header level
    if (!requestData.materialId) {
      return res.status(400).json({
        success: false,
        message: 'Material ID is required'
      });
    }
    
    if (!requestData.description) {
      return res.status(400).json({
        success: false,
        message: 'Description is required'
      });
    }
    
    if (!requestData.uom) {
      return res.status(400).json({
        success: false,
        message: 'UOM is required'
      });
    }
    
    if (!requestData.materialType) {
      return res.status(400).json({
        success: false,
        message: 'Material Type is required'
      });
    }
    
    if (!requestData.materialGroup) {
      return res.status(400).json({
        success: false,
        message: 'Material Group is required'
      });
    }
    
    // Validate setup type specific fields
    if (requestData.setupType === 'SingleLocation' && !requestData.location) {
      return res.status(400).json({
        success: false,
        message: 'Location is required for Single Location setup'
      });
    }
    
    if (requestData.setupType === 'SupplyChainRoute' && (!requestData.fromLocation || !requestData.toLocation)) {
      return res.status(400).json({
        success: false,
        message: 'From Location and To Location are required for Supply Chain Route setup'
      });
    }
    
    // Validate setup type specific fields for supply chain route data
    if (requestData.supplyChainRouteData) {
      console.log(`ChildRequest >> Supply Chain Route Data:`, requestData.supplyChainRouteData);
      
      // If supplyChainRouteData contains locations array
      if (requestData.supplyChainRouteData.locations && Array.isArray(requestData.supplyChainRouteData.locations)) {
        for (let i = 0; i < requestData.supplyChainRouteData.locations.length; i++) {
          const location = requestData.supplyChainRouteData.locations[i];
          console.log(`ChildRequest >> Location ${i}: type=${location.type}, id=${location.id}, name=${location.name}`);
          
          // Validate location has required fields
          if (!location.id) {
            return res.status(400).json({
              success: false,
              message: `Location ID is required for location ${i + 1}`
            });
          }
          
          if (!location.name) {
            return res.status(400).json({
              success: false,
              message: `Location name is required for location ${i + 1}`
            });
          }
          
          if (!location.type) {
            return res.status(400).json({
              success: false,
              message: `Location type is required for location ${i + 1}`
            });
          }
        }
      }
    }
    
    // Set initial status
    requestData.status = 'draft';
    console.log("requestData", requestData)
    const childRequest = new ChildRequest(requestData);
    await childRequest.save();

    // Populate parent request data for response
    await childRequest.populate('parentRequestId', 'requestId requestDescription status');

    res.status(201).json({
      success: true,
      message: 'Child request created successfully',
      data: childRequest
    });
  } catch (error) {
    console.error('❌ Child Request POST Error:', error);
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
    
    console.error('❌ 500 Error creating child request:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error creating child request',
      error: error.message
    });
  }
});

// POST create child request from parent request (bulk creation)
router.post('/from-parent/:parentRequestId', async (req, res) => {
  try {
    const parentRequestId = req.params.parentRequestId;
    const { requesterId, businessJustification, priority = 'medium' } = req.body;
    
    // Validate parent request exists
    const parentRequest = await DataRequest.findById(parentRequestId);
    if (!parentRequest) {
      return res.status(404).json({
        success: false,
        message: 'Parent request not found'
      });
    }
    
    if (!requesterId) {
      return res.status(400).json({
        success: false,
        message: 'Requester ID is required'
      });
    }
    
    if (!businessJustification) {
      return res.status(400).json({
        success: false,
        message: 'Business justification is required'
      });
    }
    
    // Create child requests for each material item
    const childRequests = [];
    
    for (let i = 0; i < parentRequest.requestItems.length; i++) {
      const materialItem = { ...parentRequest.requestItems[i].toObject() };
      
      // Ensure quantity is set
      if (!materialItem.quantity) {
        materialItem.quantity = 1;
      }
      
      // Create supply chain route data structure
      const supplyChainRouteData = {
        locations: [
          {
            id: `LOC_${Date.now()}_${i}`,
            type: 'supplier',
            name: `Location for ${materialItem.description}`,
            description: `Generated location for ${materialItem.description}`,
            x: 100 + (i * 50),
            y: 100 + (i * 50),
            attributes: {}
          }
        ],
        connectors: [],
        routeName: `Route for ${materialItem.description}`,
        routeDescription: `Generated route for ${materialItem.description}`
      };
      
      // Generate unique child request ID for each item
      const randomId = Math.random().toString(36).substr(2, 6).toUpperCase();
      
      const childRequestData = {
        parentRequestId: parentRequestId,
        parentRequestIdString: parentRequest.requestId,
        childRequestId: `${parentRequest.requestId}-${randomId}`,
        requestDescription: `Child Request for ${materialItem.description}`,
        businessJustification: businessJustification,
        requesterId: requesterId,
        // Material fields at header level
        materialId: materialItem.materialId,
        description: materialItem.description,
        uom: materialItem.uom,
        materialType: materialItem.materialType,
        materialGroup: materialItem.materialGroup,
        action: materialItem.action || 'Create',
        setupType: materialItem.setupType || 'SupplyChainRoute',
        location: materialItem.location || '',
        fromLocation: materialItem.fromLocation,
        toLocation: materialItem.toLocation,
        supplyChainRoute: materialItem.supplyChainRoute,
        quantity: materialItem.quantity,
        unitPrice: materialItem.unitPrice || 0,
        totalPrice: materialItem.totalPrice || 0,
        supplyChainRouteData: supplyChainRouteData,
        priority: priority,
        status: 'draft'
      };
      
      const childRequest = new ChildRequest(childRequestData);
      await childRequest.save();
      await childRequest.populate('parentRequestId', 'requestId requestDescription status');
      childRequests.push(childRequest);
    }
    
    res.status(201).json({
      success: true,
      message: `Created ${childRequests.length} child requests from parent request`,
      data: childRequests
    });
  } catch (error) {
    console.error('❌ Child Request Bulk Creation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating child requests from parent',
      error: error.message
    });
  }
});

// PUT update child request by ID
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    
    // Prevent updating certain fields
    delete updates.childRequestId;
    delete updates.parentRequestId;
    delete updates.parentRequestIdString;
    delete updates.status;
    delete updates.submittedAt;
    delete updates.approvedBy;
    delete updates.approvedAt;
    delete updates.rejectionReason;
    delete updates.completedAt;
    console.log("updates >> ", updates)
    // Validate material items if being updated
    // if (updates.requestItems && updates.requestItems.length === 0) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'At least one material item is required'
    //   });
    // }
    
    // Validate setup type specific fields for supply chain route data
    if (updates.supplyChainRouteData) {
      // Handle supply chain route data validation
      console.log(`ChildRequest Update >> Supply Chain Route Data:`, updates.supplyChainRouteData);
      
      // If supplyChainRouteData contains locations array
      if (updates.supplyChainRouteData.locations && Array.isArray(updates.supplyChainRouteData.locations)) {
        for (let i = 0; i < updates.supplyChainRouteData.locations.length; i++) {
          const location = updates.supplyChainRouteData.locations[i];
          console.log(`ChildRequest Update >> Location ${i}: type=${location.type}, id=${location.id}, name=${location.name}`);
          
          // Validate location has required fields
          if (!location.id) {
            return res.status(400).json({
              success: false,
              message: `Location ID is required for location ${i + 1}`
            });
          }
          
          if (!location.name) {
            return res.status(400).json({
              success: false,
              message: `Location name is required for location ${i + 1}`
            });
          }
          
          if (!location.type) {
            return res.status(400).json({
              success: false,
              message: `Location type is required for location ${i + 1}`
            });
          }
        }
      }
    }
    
    const childRequest = await ChildRequest.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('parentRequestId', 'requestId requestDescription status');

    if (!childRequest) {
      return res.status(404).json({
        success: false,
        message: 'Child request not found'
      });
    }

    res.json({
      success: true,
      message: 'Child request updated successfully',
      data: childRequest
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
      message: 'Error updating child request',
      error: error.message
    });
  }
});

// PUT update child request by child request ID
router.put('/by-child-request-id/:childRequestId', async (req, res) => {
  try {
    const updates = req.body;
    
    // Prevent updating certain fields
    delete updates.childRequestId;
    delete updates.parentRequestId;
    delete updates.parentRequestIdString;
    delete updates.status;
    delete updates.submittedAt;
    delete updates.approvedBy;
    delete updates.approvedAt;
    delete updates.rejectionReason;
    delete updates.completedAt;
    
    // Validate setup type specific fields for supply chain route data
    if (updates.supplyChainRouteData) {
      // Handle supply chain route data validation
      console.log(`ChildRequest Update by ID >> Supply Chain Route Data:`, updates.supplyChainRouteData);
      
      // If supplyChainRouteData contains locations array
      if (updates.supplyChainRouteData.locations && Array.isArray(updates.supplyChainRouteData.locations)) {
        for (let i = 0; i < updates.supplyChainRouteData.locations.length; i++) {
          const location = updates.supplyChainRouteData.locations[i];
          console.log(`ChildRequest  Update by ID >> Location ${i}: type=${location.type}, id=${location.id}, name=${location.name}`);
          
          // Validate location has required fields
          if (!location.id) {
            return res.status(400).json({
              success: false,
              message: `Location ID is required for location ${i + 1}`
            });
          }
          
          if (!location.name) {
            return res.status(400).json({
              success: false,
              message: `Location name is required for location ${i + 1}`
            });
          }
          
          if (!location.type) {
            return res.status(400).json({
              success: false,
              message: `Location type is required for location ${i + 1}`
            });
          }
        }
      }
    }
    
    const childRequest = await ChildRequest.findOneAndUpdate(
      { childRequestId: req.params.childRequestId },
      updates,
      { new: true, runValidators: true }
    ).populate('parentRequestId', 'requestId requestDescription status');

    if (!childRequest) {
      return res.status(404).json({
        success: false,
        message: 'Child request not found'
      });
    }

    res.json({
      success: true,
      message: 'Child request updated successfully',
      data: childRequest
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
      message: 'Error updating child request',
      error: error.message
    });
  }
});

// PATCH update child request status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, approvedBy, rejectionReason, notes } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    const childRequest = await ChildRequest.findById(req.params.id);
    if (!childRequest) {
      return res.status(404).json({
        success: false,
        message: 'Child request not found'
      });
    }
    
    // Update status
    childRequest.status = status;
    
    // Handle status-specific updates
    if (status === 'submitted') {
      childRequest.submittedAt = new Date();
    } else if (status === 'approved') {
      if (!approvedBy) {
        return res.status(400).json({
          success: false,
          message: 'Approved By is required when approving a request'
        });
      }
      childRequest.approvedBy = approvedBy;
      childRequest.approvedAt = new Date();
    } else if (status === 'rejected') {
      if (!rejectionReason) {
        return res.status(400).json({
          success: false,
          message: 'Rejection reason is required when rejecting a request'
        });
      }
      childRequest.rejectionReason = rejectionReason;
    } else if (status === 'completed') {
      childRequest.completedAt = new Date();
      childRequest.actualCompletionDate = new Date();
    }
    
    // Update notes if provided
    if (notes) {
      childRequest.notes = notes;
    }
    
    await childRequest.save();
    await childRequest.populate('parentRequestId', 'requestId requestDescription status');

    res.json({
      success: true,
      message: 'Child request status updated successfully',
      data: childRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating child request status',
      error: error.message
    });
  }
});

// DELETE child request (soft delete by updating status)
router.delete('/:id', async (req, res) => {
  try {
    const childRequest = await ChildRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    ).populate('parentRequestId', 'requestId requestDescription status');

    if (!childRequest) {
      return res.status(404).json({
        success: false,
        message: 'Child request not found'
      });
    }

    res.json({
      success: true,
      message: 'Child request cancelled successfully',
      data: childRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling child request',
      error: error.message
    });
  }
});

// DELETE child request by child request ID
router.delete('/by-child-request-id/:childRequestId', async (req, res) => {
  try {
    const childRequest = await ChildRequest.findOneAndUpdate(
      { childRequestId: req.params.childRequestId },
      { status: 'cancelled' },
      { new: true }
    ).populate('parentRequestId', 'requestId requestDescription status');

    if (!childRequest) {
      return res.status(404).json({
        success: false,
        message: 'Child request not found'
      });
    }

    res.json({
      success: true,
      message: 'Child request cancelled successfully',
      data: childRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling child request',
      error: error.message
    });
  }
});

// GET child request statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await ChildRequest.aggregate([
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

    const priorityStats = await ChildRequest.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const monthlyStats = await ChildRequest.aggregate([
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
      message: 'Error fetching child request statistics',
      error: error.message
    });
  }
});

module.exports = router;
