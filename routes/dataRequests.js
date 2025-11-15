const express = require('express');
const router = express.Router();
const DataRequest = require('../models/DataRequest');

// GET all data requests with pagination and filtering
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
    
    // Search by request ID, description, business justification, or any field in requestItems
    if (req.query.search) {
      filter.$or = [
        { requestId: { $regex: req.query.search, $options: 'i' } },
        { requestDescription: { $regex: req.query.search, $options: 'i' } },
        { businessJustification: { $regex: req.query.search, $options: 'i' } },
        // Search in common fields that may exist in requestItems (dynamic)
        { 'requestItems.materialId': { $regex: req.query.search, $options: 'i' } },
        { 'requestItems.description': { $regex: req.query.search, $options: 'i' } },
        { 'requestItems.objectId': { $regex: req.query.search, $options: 'i' } },
        { 'requestItems.equipmentNumber': { $regex: req.query.search, $options: 'i' } },
        { 'requestItems.equipmentDescription': { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Sort options
    let sort = { createdAt: -1 };
    if (req.query.sortBy) {
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
      sort = { [req.query.sortBy]: sortOrder };
    }

    const dataRequests = await DataRequest.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await DataRequest.countDocuments(filter);

    res.json({
      success: true,
      data: dataRequests,
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
      message: 'Error fetching data requests',
      error: error.message
    });
  }
});

// GET single data request by ID
router.get('/:id', async (req, res) => {
  try {
    const dataRequest = await DataRequest.findById(req.params.id);
    
    if (!dataRequest) {
      return res.status(404).json({
        success: false,
        message: 'Data request not found'
      });
    }

    res.json({
      success: true,
      data: dataRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching data request',
      error: error.message
    });
  }
});

// GET data request by request ID
router.get('/by-request-id/:requestId', async (req, res) => {
  try {
    const dataRequest = await DataRequest.findOne({ 
      requestId: req.params.requestId 
    });
    
    if (!dataRequest) {
      return res.status(404).json({
        success: false,
        message: 'Data request not found'
      });
    }

    res.json({
      success: true,
      data: dataRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching data request',
      error: error.message
    });
  }
});

// POST create new data request
router.post('/', async (req, res) => {
  try {
    console.log('📝 Data Request POST - Request body:', req.body);
    const requestData = req.body;
    
    // Check if request with same ID already exists
    if (requestData.requestId) {
      const existingRequest = await DataRequest.findOne({ requestId: requestData.requestId });
      if (existingRequest) {
        return res.status(400).json({
          success: false,
          message: 'Data request with this Request ID already exists'
        });
      }
    } else {
      // Generate request ID if not provided
      const timestamp = Date.now().toString(36).toUpperCase();
      const randomStr = Math.random().toString(36).substr(2, 5).toUpperCase();
      requestData.requestId = `REQ-${timestamp}-${randomStr}`;
    }
    
    // Validate requestItems (data request items) array
    if (!requestData.requestItems || !Array.isArray(requestData.requestItems) || requestData.requestItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one data request item is required in requestItems array'
      });
    }
    
    // Dynamic validation based on requestType
    // Only validate setupType-specific fields for Material Requests or when setupType is explicitly used
    for (let i = 0; i < requestData.requestItems.length; i++) {
      const item = requestData.requestItems[i];
      
      // Only validate setupType fields if this is a Material Request or if setupType is explicitly set
      // For other request types (like Plant Maintenance), setupType might be optional or used differently
      if (requestData.requestType === 'Material Request' && item.setupType) {
        if (item.setupType === 'SingleLocation' && !item.location) {
          return res.status(400).json({
            success: false,
            message: `Location is required for Single Location setup in item ${i + 1}`
          });
        }
        
        if (item.setupType === 'SupplyChainRoute' && (!item.fromLocation || !item.toLocation)) {
          return res.status(400).json({
            success: false,
            message: `From Location and To Location are required for Supply Chain Route setup in item ${i + 1}`
          });
        }
      }
    }
    
    // Set initial status
    if (!requestData.status) {
      requestData.status = 'draft';
    }
    
    console.log("📝 Data Request POST - Creating with dataFormat:", requestData.dataFormat);
    console.log("📝 Data Request POST - requestType:", requestData.requestType);
    console.log("📝 Data Request POST - requestItems count:", requestData.requestItems?.length);
    
    const dataRequest = new DataRequest(requestData);
    
    // Mark requestItems as modified to ensure nested Mixed types are saved
    if (dataRequest.requestItems && Array.isArray(dataRequest.requestItems)) {
      dataRequest.markModified('requestItems');
      // Mark nested Mixed fields within requestItems
      dataRequest.requestItems.forEach((item, index) => {
        if (item.supplyChainRouteData) {
          dataRequest.markModified(`requestItems.${index}.supplyChainRouteData`);
        }
        if (item.assignedTasks) {
          dataRequest.markModified(`requestItems.${index}.assignedTasks`);
        }
        if (item.approvalSteps) {
          dataRequest.markModified(`requestItems.${index}.approvalSteps`);
        }
        if (item.attachments) {
          dataRequest.markModified(`requestItems.${index}.attachments`);
        }
      });
    }
    
    if (dataRequest.specificFieldsObject) {
      dataRequest.markModified('specificFieldsObject');
    }
    
    await dataRequest.save();

    res.status(201).json({
      success: true,
      message: 'Data request created successfully',
      data: dataRequest
    });
  } catch (error) {
    console.error('❌ Data Request POST Error:', error);
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
        message: 'Data request with this Request ID already exists',
        error: error.message
      });
    }
    
    console.error('❌ 500 Error creating data request:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error creating data request',
      error: error.message
    });
  }
});

// PUT update data request by ID
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    
    // Prevent updating certain fields
    delete updates.requestId;
    // Note: status and related fields are now allowed to be updated via PUT
    
    // Extract status-related fields for special handling
    const statusUpdate = updates.status;
    const approvedBy = updates.approvedBy;
    const rejectionReason = updates.rejectionReason;
    const referbackReason = updates.referbackReason;
    const notes = updates.notes;
    
    // Remove status-related fields from regular updates (will be handled separately)
    delete updates.submittedAt;
    delete updates.approvedAt;
    
    console.log("🔄 Data Request PUT - Updates:", Object.keys(updates));
    console.log("🔄 Data Request PUT - requestType:", updates.requestType);
    console.log("🔄 Data Request PUT - dataFormat:", updates.dataFormat);
    console.log("🔄 Data Request PUT - status:", statusUpdate);
    
    // Validate requestItems if being updated
    if (updates.requestItems) {
      if (!Array.isArray(updates.requestItems) || updates.requestItems.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one data request item is required in requestItems array'
        });
      }
      
      // Dynamic validation based on requestType
      // Only validate setupType-specific fields for Material Requests or when setupType is explicitly used
      const requestType = updates.requestType || (await DataRequest.findById(req.params.id))?.requestType;
      for (let i = 0; i < updates.requestItems.length; i++) {
        const item = updates.requestItems[i];
        
        // Only validate setupType fields if this is a Material Request or if setupType is explicitly set
        if (requestType === 'Material Request' && item.setupType) {
          if (item.setupType === 'SingleLocation' && !item.location) {
            return res.status(400).json({
              success: false,
              message: `Location is required for Single Location setup in item ${i + 1}`
            });
          }
          
          if (item.setupType === 'SupplyChainRoute' && (!item.fromLocation || !item.toLocation)) {
            return res.status(400).json({
              success: false,
              message: `From Location and To Location are required for Supply Chain Route setup in item ${i + 1}`
            });
          }
        }
      }
    }
    
    // Use findById and save to properly handle nested Mixed types
    const dataRequest = await DataRequest.findById(req.params.id);

    if (!dataRequest) {
      return res.status(404).json({
        success: false,
        message: 'Data request not found'
      });
    }

    // Handle status update with proper logic
    if (statusUpdate !== undefined) {
      dataRequest.status = statusUpdate;
      
      // Handle status-specific updates
      if (statusUpdate === 'submitted') {
        dataRequest.submittedAt = new Date();
      } else if (statusUpdate === 'approved') {
        if (!approvedBy) {
          return res.status(400).json({
            success: false,
            message: 'Approved By is required when approving a request'
          });
        }
        dataRequest.approvedBy = approvedBy;
        dataRequest.approvedAt = new Date();
      } else if (statusUpdate === 'rejected' || statusUpdate === 'dc_rejected') {
        if (!rejectionReason) {
          return res.status(400).json({
            success: false,
            message: 'Rejection reason is required when rejecting a request'
          });
        }
        dataRequest.rejectionReason = rejectionReason;
      } else if (statusUpdate === 'dc_referback') {
        if (!referbackReason) {
          return res.status(400).json({
            success: false,
            message: 'Referback reason is required when sending a request back for rework'
          });
        }
        dataRequest.referbackReason = referbackReason;
      } else if (statusUpdate === 'completed') {
        dataRequest.completedAt = new Date();
      }
    }
    
    // Handle notes update if provided
    if (notes !== undefined) {
      dataRequest.notes = notes;
    }
    
    // Handle approvedBy, rejectionReason, and referbackReason if provided separately (not via status update)
    if (approvedBy !== undefined && statusUpdate !== 'approved') {
      dataRequest.approvedBy = approvedBy;
    }
    if (rejectionReason !== undefined && statusUpdate !== 'rejected' && statusUpdate !== 'dc_rejected') {
      dataRequest.rejectionReason = rejectionReason;
    }
    if (referbackReason !== undefined && statusUpdate !== 'dc_referback') {
      dataRequest.referbackReason = referbackReason;
    }

    // Apply other updates to the document
    Object.keys(updates).forEach(key => {
      // Skip status-related fields as they're handled above
      if (key === 'status' || key === 'approvedBy' || key === 'rejectionReason' || key === 'referbackReason' || key === 'notes') {
        return;
      }
      
      if (key === 'requestItems') {
        // Replace the entire requestItems array
        console.log(`📝 Updating requestItems array with ${updates[key].length} item(s)`);
        if (updates[key].length > 0) {
          console.log(`📋 First item keys:`, Object.keys(updates[key][0]));
        }
        dataRequest.set('requestItems', updates[key]);
      } else {
        dataRequest.set(key, updates[key]);
      }
    });

    // Mark requestItems and nested Mixed fields as modified to ensure Mongoose saves them
    dataRequest.markModified('requestItems');
    
    // Mark nested Mixed fields within requestItems as modified
    if (dataRequest.requestItems && Array.isArray(dataRequest.requestItems)) {
      dataRequest.requestItems.forEach((item, index) => {
        if (item.supplyChainRouteData) {
          dataRequest.markModified(`requestItems.${index}.supplyChainRouteData`);
        }
        if (item.assignedTasks) {
          dataRequest.markModified(`requestItems.${index}.assignedTasks`);
        }
        if (item.approvalSteps) {
          dataRequest.markModified(`requestItems.${index}.approvalSteps`);
        }
        if (item.attachments) {
          dataRequest.markModified(`requestItems.${index}.attachments`);
        }
      });
    }
    
    if (dataRequest.specificFieldsObject) {
      dataRequest.markModified('specificFieldsObject');
    }
    
    // Save the document to ensure all nested fields are persisted
    await dataRequest.save({ runValidators: true });

    console.log('✅ Data Request updated successfully:', {
      id: dataRequest._id,
      requestId: dataRequest.requestId,
      requestType: dataRequest.requestType,
      status: dataRequest.status,
      requestItems: dataRequest.requestItems ? dataRequest.requestItems.length : 0
    });

    res.json({
      success: true,
      message: 'Data request updated successfully',
      data: dataRequest
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
      message: 'Error updating data request',
      error: error.message
    });
  }
});

// PUT update data request by request ID
router.put('/by-request-id/:requestId', async (req, res) => {
  try {
    const updates = req.body;
    
    // Prevent updating certain fields
    delete updates.requestId;
    // Note: status and related fields are now allowed to be updated via PUT
    
    // Extract status-related fields for special handling
    const statusUpdate = updates.status;
    const approvedBy = updates.approvedBy;
    const rejectionReason = updates.rejectionReason;
    const referbackReason = updates.referbackReason;
    const notes = updates.notes;
    
    // Remove status-related fields from regular updates (will be handled separately)
    delete updates.submittedAt;
    delete updates.approvedAt;
    
    console.log("🔄 Data Request PUT by requestId - Updates:", Object.keys(updates));
    console.log("🔄 Data Request PUT by requestId - requestType:", updates.requestType);
    console.log("🔄 Data Request PUT by requestId - dataFormat:", updates.dataFormat);
    console.log("🔄 Data Request PUT by requestId - status:", statusUpdate);
    
    // Fetch existing request first (needed for validation and update)
    const dataRequest = await DataRequest.findOne({ requestId: req.params.requestId });
    
    if (!dataRequest) {
      return res.status(404).json({
        success: false,
        message: 'Data request not found'
      });
    }
    
    // Validate requestItems if being updated
    if (updates.requestItems) {
      if (!Array.isArray(updates.requestItems) || updates.requestItems.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one data request item is required in requestItems array'
        });
      }
      
      // Dynamic validation based on requestType
      // Only validate setupType-specific fields for Material Requests or when setupType is explicitly used
      const requestType = updates.requestType || dataRequest.requestType;
      for (let i = 0; i < updates.requestItems.length; i++) {
        const item = updates.requestItems[i];
        
        // Only validate setupType fields if this is a Material Request or if setupType is explicitly set
        if (requestType === 'Material Request' && item.setupType) {
          if (item.setupType === 'SingleLocation' && !item.location) {
            return res.status(400).json({
              success: false,
              message: `Location is required for Single Location setup in item ${i + 1}`
            });
          }
          
          if (item.setupType === 'SupplyChainRoute' && (!item.fromLocation || !item.toLocation)) {
            return res.status(400).json({
              success: false,
              message: `From Location and To Location are required for Supply Chain Route setup in item ${i + 1}`
            });
          }
        }
      }
    }

    // Handle status update with proper logic
    if (statusUpdate !== undefined) {
      dataRequest.status = statusUpdate;
      
      // Handle status-specific updates
      if (statusUpdate === 'submitted') {
        dataRequest.submittedAt = new Date();
      } else if (statusUpdate === 'approved') {
        if (!approvedBy) {
          return res.status(400).json({
            success: false,
            message: 'Approved By is required when approving a request'
          });
        }
        dataRequest.approvedBy = approvedBy;
        dataRequest.approvedAt = new Date();
      } else if (statusUpdate === 'rejected' || statusUpdate === 'dc_rejected') {
        if (!rejectionReason) {
          return res.status(400).json({
            success: false,
            message: 'Rejection reason is required when rejecting a request'
          });
        }
        dataRequest.rejectionReason = rejectionReason;
      } else if (statusUpdate === 'dc_referback') {
        if (!referbackReason) {
          return res.status(400).json({
            success: false,
            message: 'Referback reason is required when sending a request back for rework'
          });
        }
        dataRequest.referbackReason = referbackReason;
      } else if (statusUpdate === 'completed') {
        dataRequest.completedAt = new Date();
      }
    }
    
    // Handle notes update if provided
    if (notes !== undefined) {
      dataRequest.notes = notes;
    }
    
    // Handle approvedBy, rejectionReason, and referbackReason if provided separately (not via status update)
    if (approvedBy !== undefined && statusUpdate !== 'approved') {
      dataRequest.approvedBy = approvedBy;
    }
    if (rejectionReason !== undefined && statusUpdate !== 'rejected' && statusUpdate !== 'dc_rejected') {
      dataRequest.rejectionReason = rejectionReason;
    }
    if (referbackReason !== undefined && statusUpdate !== 'dc_referback') {
      dataRequest.referbackReason = referbackReason;
    }

    // Apply other updates to the document
    Object.keys(updates).forEach(key => {
      // Skip status-related fields as they're handled above
      if (key === 'status' || key === 'approvedBy' || key === 'rejectionReason' || key === 'referbackReason' || key === 'notes') {
        return;
      }
      
      if (key === 'requestItems') {
        // Replace the entire requestItems array
        console.log(`📝 Updating requestItems array with ${updates[key].length} item(s)`);
        if (updates[key].length > 0) {
          console.log(`📋 First item keys:`, Object.keys(updates[key][0]));
        }
        dataRequest.set('requestItems', updates[key]);
      } else {
        dataRequest.set(key, updates[key]);
      }
    });

    // Mark requestItems and nested Mixed fields as modified to ensure Mongoose saves them
    dataRequest.markModified('requestItems');
    
    // Mark nested Mixed fields within requestItems as modified
    if (dataRequest.requestItems && Array.isArray(dataRequest.requestItems)) {
      dataRequest.requestItems.forEach((item, index) => {
        if (item.supplyChainRouteData) {
          dataRequest.markModified(`requestItems.${index}.supplyChainRouteData`);
        }
        if (item.assignedTasks) {
          dataRequest.markModified(`requestItems.${index}.assignedTasks`);
        }
        if (item.approvalSteps) {
          dataRequest.markModified(`requestItems.${index}.approvalSteps`);
        }
        if (item.attachments) {
          dataRequest.markModified(`requestItems.${index}.attachments`);
        }
      });
    }
    
    if (dataRequest.specificFieldsObject) {
      dataRequest.markModified('specificFieldsObject');
    }
    
    // Save the document to ensure all nested fields are persisted
    await dataRequest.save({ runValidators: true });

    console.log('✅ Data Request updated successfully (by requestId):', {
      id: dataRequest._id,
      requestId: dataRequest.requestId,
      requestType: dataRequest.requestType,
      status: dataRequest.status,
      requestItems: dataRequest.requestItems ? dataRequest.requestItems.length : 0
    });

    res.json({
      success: true,
      message: 'Data request updated successfully',
      data: dataRequest
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
      message: 'Error updating data request',
      error: error.message
    });
  }
});

// PATCH update data request status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, approvedBy, rejectionReason, referbackReason, notes } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    const dataRequest = await DataRequest.findById(req.params.id);
    if (!dataRequest) {
      return res.status(404).json({
        success: false,
        message: 'Data request not found'
      });
    }
    
    // Update status
    dataRequest.status = status;
    
    // Handle status-specific updates
    if (status === 'submitted') {
      dataRequest.submittedAt = new Date();
    } else if (status === 'approved') {
      if (!approvedBy) {
        return res.status(400).json({
          success: false,
          message: 'Approved By is required when approving a request'
        });
      }
      dataRequest.approvedBy = approvedBy;
      dataRequest.approvedAt = new Date();
    } else if (status === 'rejected' || status === 'dc_rejected') {
      if (!rejectionReason) {
        return res.status(400).json({
          success: false,
          message: 'Rejection reason is required when rejecting a request'
        });
      }
      dataRequest.rejectionReason = rejectionReason;
    } else if (status === 'dc_referback') {
      if (!referbackReason) {
        return res.status(400).json({
          success: false,
          message: 'Referback reason is required when sending a request back for rework'
        });
      }
      dataRequest.referbackReason = referbackReason;
    } else if (status === 'completed') {
      dataRequest.completedAt = new Date();
    }
    
    // Update notes if provided
    if (notes !== undefined) {
      dataRequest.notes = notes;
    }
    
    await dataRequest.save();

    res.json({
      success: true,
      message: 'Data request status updated successfully',
      data: dataRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating data request status',
      error: error.message
    });
  }
});

// DELETE data request (soft delete by updating status)
router.delete('/:id', async (req, res) => {
  try {
    const dataRequest = await DataRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );

    if (!dataRequest) {
      return res.status(404).json({
        success: false,
        message: 'Data request not found'
      });
    }

    res.json({
      success: true,
      message: 'Data request cancelled successfully',
      data: dataRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling data request',
      error: error.message
    });
  }
});

// DELETE data request by request ID
router.delete('/by-request-id/:requestId', async (req, res) => {
  try {
    const dataRequest = await DataRequest.findOneAndUpdate(
      { requestId: req.params.requestId },
      { status: 'cancelled' },
      { new: true }
    );

    if (!dataRequest) {
      return res.status(404).json({
        success: false,
        message: 'Data request not found'
      });
    }

    res.json({
      success: true,
      message: 'Data request cancelled successfully',
      data: dataRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling data request',
      error: error.message
    });
  }
});

// GET data request statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await DataRequest.aggregate([
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

    const priorityStats = await DataRequest.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const monthlyStats = await DataRequest.aggregate([
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
      message: 'Error fetching data request statistics',
      error: error.message
    });
  }
});

module.exports = router;
