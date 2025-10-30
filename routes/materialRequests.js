const express = require('express');
const router = express.Router();
const MaterialRequest = require('../models/MaterialRequest');
const DataRequest = require('../models/DataRequest');

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
    
    // Filter by priority
    if (req.query.priority) {
      filter.priority = req.query.priority;
    }
    
    // Filter by parent request ID
    if (req.query.parentRequestId) {
      filter.parentRequestId = req.query.parentRequestId;
    }
    
    // Filter by setup type
    if (req.query.setupType) {
      filter.setupType = req.query.setupType;
    }
    
    // Filter by material type
    if (req.query.materialType) {
      filter.materialType = req.query.materialType;
    }
    
    // Filter by material group
    if (req.query.materialGroup) {
      filter.materialGroup = req.query.materialGroup;
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
    
    // Search by request ID, description, material ID
    if (req.query.search) {
      filter.$or = [
        { requestId: { $regex: req.query.search, $options: 'i' } },
        { requestDescription: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { materialId: { $regex: req.query.search, $options: 'i' } },
        { 'requestItems.materialId': { $regex: req.query.search, $options: 'i' } },
        { 'requestItems.description': { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Sort options
    let sort = { createdAt: -1 };
    if (req.query.sortBy) {
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
      sort = { [req.query.sortBy]: sortOrder };
    }

    const materialRequests = await MaterialRequest.find(filter)
      .populate('parentRequestId', 'requestId description status')
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
    const materialRequest = await MaterialRequest.findById(req.params.id)
      .populate('parentRequestId', 'requestId description status materialId materialType');
    
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
    } else {
      // Generate request ID if not provided
      const timestamp = Date.now().toString(36).toUpperCase();
      const randomStr = Math.random().toString(36).substr(2, 5).toUpperCase();
      requestData.requestId = `REQ-${timestamp}-${randomStr}`;
    }
    
    // Validate parent request exists if parentRequestId is provided
    if (requestData.parentRequestId) {
      const parentRequest = await DataRequest.findById(requestData.parentRequestId);
      if (!parentRequest) {
        return res.status(400).json({
          success: false,
          message: 'Parent request not found'
        });
      }
    }
    
    // Validate requestItems if present (preferred structure)
    if (requestData.requestItems && Array.isArray(requestData.requestItems) && requestData.requestItems.length > 0) {
      // Validate each item in requestItems array
      for (let i = 0; i < requestData.requestItems.length; i++) {
        const item = requestData.requestItems[i];
        
        // Validate required fields
        if (!item.materialId) {
          return res.status(400).json({
            success: false,
            message: `Material ID is required for item ${i + 1}`
          });
        }
        
        if (!item.description) {
          return res.status(400).json({
            success: false,
            message: `Description is required for item ${i + 1}`
          });
        }
        
        if (!item.uom) {
          return res.status(400).json({
            success: false,
            message: `UOM is required for item ${i + 1}`
          });
        }
        
        if (!item.materialType) {
          return res.status(400).json({
            success: false,
            message: `Material Type is required for item ${i + 1}`
          });
        }
        
        if (!item.materialGroup) {
          return res.status(400).json({
            success: false,
            message: `Material Group is required for item ${i + 1}`
          });
        }
        
        // Validate setup type specific fields
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
        
        // Validate supply chain route data locations if present in item
        if (item.supplyChainRouteData && item.supplyChainRouteData.locations && Array.isArray(item.supplyChainRouteData.locations)) {
          for (let j = 0; j < item.supplyChainRouteData.locations.length; j++) {
            const location = item.supplyChainRouteData.locations[j];
            
            // Validate location has required fields
            if (!location.id) {
              return res.status(400).json({
                success: false,
                message: `Location ID is required for location ${j + 1} in item ${i + 1}`
              });
            }
            
            if (!location.name) {
              return res.status(400).json({
                success: false,
                message: `Location name is required for location ${j + 1} in item ${i + 1}`
              });
            }
            
            if (!location.type) {
              return res.status(400).json({
                success: false,
                message: `Location type is required for location ${j + 1} in item ${i + 1}`
              });
            }
          }
        }
      }
    } else if (!requestData.materialId) {
      // Validate required material fields at header level (backward compatibility)
      // Only validate if requestItems is not present
      return res.status(400).json({
        success: false,
        message: 'Either requestItems array or header-level material fields are required'
      });
    } else {
      // Validate header-level fields (backward compatibility)
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
        console.log(`MaterialRequest >> Supply Chain Route Data:`, requestData.supplyChainRouteData);
        
        // If supplyChainRouteData contains locations array
        if (requestData.supplyChainRouteData.locations && Array.isArray(requestData.supplyChainRouteData.locations)) {
          for (let i = 0; i < requestData.supplyChainRouteData.locations.length; i++) {
            const location = requestData.supplyChainRouteData.locations[i];
            console.log(`MaterialRequest >> Location ${i}: type=${location.type}, id=${location.id}, name=${location.name}`);
            
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
    }
    
    // Set initial status
    if (!requestData.status) {
      requestData.status = 'draft';
    }
    
    console.log("requestData", requestData);
    const materialRequest = new MaterialRequest(requestData);
    await materialRequest.save();

    // Populate parent request data for response
    if (materialRequest.parentRequestId) {
      await materialRequest.populate('parentRequestId', 'requestId description status');
    }

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
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Material request with this Request ID already exists',
        error: error.message
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
    delete updates.completedAt;
    
    console.log("updates >> ", updates);
    
    // Validate requestItems if being updated
    if (updates.requestItems && Array.isArray(updates.requestItems)) {
      // Validate each item in requestItems array
      for (let i = 0; i < updates.requestItems.length; i++) {
        const item = updates.requestItems[i];
        
        // Validate required fields
        if (!item.materialId) {
          return res.status(400).json({
            success: false,
            message: `Material ID is required for item ${i + 1}`
          });
        }
        
        if (!item.description) {
          return res.status(400).json({
            success: false,
            message: `Description is required for item ${i + 1}`
          });
        }
        
        if (!item.uom) {
          return res.status(400).json({
            success: false,
            message: `UOM is required for item ${i + 1}`
          });
        }
        
        if (!item.materialType) {
          return res.status(400).json({
            success: false,
            message: `Material Type is required for item ${i + 1}`
          });
        }
        
        if (!item.materialGroup) {
          return res.status(400).json({
            success: false,
            message: `Material Group is required for item ${i + 1}`
          });
        }
        
        // Validate setup type specific fields
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
        
        // Validate supply chain route data locations if present in item
        if (item.supplyChainRouteData && item.supplyChainRouteData.locations && Array.isArray(item.supplyChainRouteData.locations)) {
          for (let j = 0; j < item.supplyChainRouteData.locations.length; j++) {
            const location = item.supplyChainRouteData.locations[j];
            
            // Validate location has required fields
            if (!location.id) {
              return res.status(400).json({
                success: false,
                message: `Location ID is required for location ${j + 1} in item ${i + 1}`
              });
            }
            
            if (!location.name) {
              return res.status(400).json({
                success: false,
                message: `Location name is required for location ${j + 1} in item ${i + 1}`
              });
            }
            
            if (!location.type) {
              return res.status(400).json({
                success: false,
                message: `Location type is required for location ${j + 1} in item ${i + 1}`
              });
            }
          }
        }
      }
    } else {
      // Validate setup type specific fields at header level (for backward compatibility)
      if (updates.setupType === 'SingleLocation' && !updates.location) {
        return res.status(400).json({
          success: false,
          message: 'Location is required for Single Location setup'
        });
      }
      
      if (updates.setupType === 'SupplyChainRoute' && (!updates.fromLocation || !updates.toLocation)) {
        return res.status(400).json({
          success: false,
          message: 'From Location and To Location are required for Supply Chain Route setup'
        });
      }
      
      // Validate supply chain route data if being updated at header level
      if (updates.supplyChainRouteData) {
        console.log(`MaterialRequest Update >> Supply Chain Route Data:`, updates.supplyChainRouteData);
        
        // If supplyChainRouteData contains locations array
        if (updates.supplyChainRouteData.locations && Array.isArray(updates.supplyChainRouteData.locations)) {
          for (let i = 0; i < updates.supplyChainRouteData.locations.length; i++) {
            const location = updates.supplyChainRouteData.locations[i];
            console.log(`MaterialRequest Update >> Location ${i}: type=${location.type}, id=${location.id}, name=${location.name}`);
            
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
    }
    
    // Use findOne and save to properly handle nested array updates
    const materialRequest = await MaterialRequest.findOne({ requestId: req.params.requestId });

    if (!materialRequest) {
      return res.status(404).json({
        success: false,
        message: 'Material request not found'
      });
    }

    // Apply updates to the document
    Object.keys(updates).forEach(key => {
      if (key === 'requestItems') {
        // Replace the entire requestItems array
        console.log(`📝 Updating requestItems array with ${updates[key].length} item(s)`);
        if (updates[key].length > 0) {
          console.log(`📋 First item keys:`, Object.keys(updates[key][0]));
          console.log(`📋 First item supplyChainRoute:`, updates[key][0].supplyChainRoute);
          console.log(`📋 First item supplyChainRouteData:`, updates[key][0].supplyChainRouteData ? 'Present' : 'Missing');
          console.log(`📋 First item assignedTasks:`, updates[key][0].assignedTasks ? 'Present' : 'Missing');
        }
        materialRequest.requestItems = updates[key];
      } else {
        materialRequest[key] = updates[key];
      }
    });

    // Mark requestItems as modified to ensure Mongoose saves it
    materialRequest.markModified('requestItems');
    
    // Save the document to ensure all nested fields are persisted
    await materialRequest.save({ runValidators: true });
    
    // Populate parent request data for response
    await materialRequest.populate('parentRequestId', 'requestId description status');

    console.log('✅ Material Request updated successfully:', {
      requestId: materialRequest.requestId,
      requestItems: materialRequest.requestItems ? materialRequest.requestItems.length : 0,
      firstItemSupplyChainRoute: materialRequest.requestItems?.[0]?.supplyChainRoute,
      firstItemSupplyChainRouteData: materialRequest.requestItems?.[0]?.supplyChainRouteData ? 'Present' : 'Missing',
      firstItemAssignedTasks: materialRequest.requestItems?.[0]?.assignedTasks ? 'Present' : 'Missing'
    });
    
    // Additional verification - log the actual saved data
    if (materialRequest.requestItems && materialRequest.requestItems.length > 0) {
      const firstItem = materialRequest.requestItems[0];
      console.log('📊 Saved first item details:', {
        materialId: firstItem.materialId,
        hasSupplyChainRoute: !!firstItem.supplyChainRoute,
        hasSupplyChainRouteData: !!firstItem.supplyChainRouteData,
        supplyChainRouteDataKeys: firstItem.supplyChainRouteData ? Object.keys(firstItem.supplyChainRouteData) : [],
        hasAssignedTasks: !!firstItem.assignedTasks,
        assignedTasksKeys: firstItem.assignedTasks ? Object.keys(firstItem.assignedTasks) : []
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
    delete updates.completedAt;
    
    console.log("updates >> ", updates);
    
    // Validate requestItems if being updated
    if (updates.requestItems && Array.isArray(updates.requestItems)) {
      // Validate each item in requestItems array
      for (let i = 0; i < updates.requestItems.length; i++) {
        const item = updates.requestItems[i];
        
        // Validate required fields
        if (!item.materialId) {
          return res.status(400).json({
            success: false,
            message: `Material ID is required for item ${i + 1}`
          });
        }
        
        if (!item.description) {
          return res.status(400).json({
            success: false,
            message: `Description is required for item ${i + 1}`
          });
        }
        
        if (!item.uom) {
          return res.status(400).json({
            success: false,
            message: `UOM is required for item ${i + 1}`
          });
        }
        
        if (!item.materialType) {
          return res.status(400).json({
            success: false,
            message: `Material Type is required for item ${i + 1}`
          });
        }
        
        if (!item.materialGroup) {
          return res.status(400).json({
            success: false,
            message: `Material Group is required for item ${i + 1}`
          });
        }
        
        // Validate setup type specific fields
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
        
        // Validate supply chain route data locations if present in item
        if (item.supplyChainRouteData && item.supplyChainRouteData.locations && Array.isArray(item.supplyChainRouteData.locations)) {
          for (let j = 0; j < item.supplyChainRouteData.locations.length; j++) {
            const location = item.supplyChainRouteData.locations[j];
            
            // Validate location has required fields
            if (!location.id) {
              return res.status(400).json({
                success: false,
                message: `Location ID is required for location ${j + 1} in item ${i + 1}`
              });
            }
            
            if (!location.name) {
              return res.status(400).json({
                success: false,
                message: `Location name is required for location ${j + 1} in item ${i + 1}`
              });
            }
            
            if (!location.type) {
              return res.status(400).json({
                success: false,
                message: `Location type is required for location ${j + 1} in item ${i + 1}`
              });
            }
          }
        }
      }
    } else {
      // Validate setup type specific fields at header level (for backward compatibility)
      if (updates.setupType === 'SingleLocation' && !updates.location) {
        return res.status(400).json({
          success: false,
          message: 'Location is required for Single Location setup'
        });
      }
      
      if (updates.setupType === 'SupplyChainRoute' && (!updates.fromLocation || !updates.toLocation)) {
        return res.status(400).json({
          success: false,
          message: 'From Location and To Location are required for Supply Chain Route setup'
        });
      }
      
      // Validate supply chain route data if being updated at header level
      if (updates.supplyChainRouteData) {
        console.log(`MaterialRequest Update >> Supply Chain Route Data:`, updates.supplyChainRouteData);
        
        // If supplyChainRouteData contains locations array
        if (updates.supplyChainRouteData.locations && Array.isArray(updates.supplyChainRouteData.locations)) {
          for (let i = 0; i < updates.supplyChainRouteData.locations.length; i++) {
            const location = updates.supplyChainRouteData.locations[i];
            console.log(`MaterialRequest Update >> Location ${i}: type=${location.type}, id=${location.id}, name=${location.name}`);
            
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
    }
    
    // Use findById and save to properly handle nested array updates
    const materialRequest = await MaterialRequest.findById(req.params.id);

    if (!materialRequest) {
      return res.status(404).json({
        success: false,
        message: 'Material request not found'
      });
    }

    // Apply updates to the document
    Object.keys(updates).forEach(key => {
      if (key === 'requestItems') {
        // Replace the entire requestItems array
        console.log(`📝 Updating requestItems array with ${updates[key].length} item(s)`);
        if (updates[key].length > 0) {
          console.log(`📋 First item keys:`, Object.keys(updates[key][0]));
          console.log(`📋 First item supplyChainRoute:`, updates[key][0].supplyChainRoute);
          console.log(`📋 First item supplyChainRouteData:`, updates[key][0].supplyChainRouteData ? 'Present' : 'Missing');
          console.log(`📋 First item assignedTasks:`, updates[key][0].assignedTasks ? 'Present' : 'Missing');
        }
        // Use set to properly assign the array
        materialRequest.set('requestItems', updates[key]);
      } else {
        materialRequest.set(key, updates[key]);
      }
    });

    // Mark requestItems and nested Mixed fields as modified to ensure Mongoose saves them
    materialRequest.markModified('requestItems');
    
    // Mark nested Mixed fields within requestItems as modified
    if (materialRequest.requestItems && Array.isArray(materialRequest.requestItems)) {
      materialRequest.requestItems.forEach((item, index) => {
        if (item.supplyChainRouteData) {
          materialRequest.markModified(`requestItems.${index}.supplyChainRouteData`);
        }
        if (item.assignedTasks) {
          materialRequest.markModified(`requestItems.${index}.assignedTasks`);
        }
      });
    }
    
    // Save the document to ensure all nested fields are persisted
    await materialRequest.save({ runValidators: true });
    
    // Populate parent request data for response
    await materialRequest.populate('parentRequestId', 'requestId description status');

    console.log('✅ Material Request updated successfully:', {
      id: materialRequest._id,
      requestId: materialRequest.requestId,
      requestItems: materialRequest.requestItems ? materialRequest.requestItems.length : 0,
      firstItemSupplyChainRoute: materialRequest.requestItems?.[0]?.supplyChainRoute,
      firstItemSupplyChainRouteData: materialRequest.requestItems?.[0]?.supplyChainRouteData ? 'Present' : 'Missing',
      firstItemAssignedTasks: materialRequest.requestItems?.[0]?.assignedTasks ? 'Present' : 'Missing'
    });
    
    // Additional verification - log the actual saved data and verify from database
    if (materialRequest.requestItems && materialRequest.requestItems.length > 0) {
      const firstItem = materialRequest.requestItems[0];
      console.log('📊 Saved first item details:', {
        materialId: firstItem.materialId,
        hasSupplyChainRoute: !!firstItem.supplyChainRoute,
        hasSupplyChainRouteData: !!firstItem.supplyChainRouteData,
        supplyChainRouteDataKeys: firstItem.supplyChainRouteData ? Object.keys(firstItem.supplyChainRouteData) : [],
        hasAssignedTasks: !!firstItem.assignedTasks,
        assignedTasksKeys: firstItem.assignedTasks ? Object.keys(firstItem.assignedTasks) : []
      });
    }
    
    // Re-fetch from database to verify persistence
    const verifiedDoc = await MaterialRequest.findById(materialRequest._id);
    if (verifiedDoc && verifiedDoc.requestItems && verifiedDoc.requestItems.length > 0) {
      const verifiedItem = verifiedDoc.requestItems[0];
      console.log('🔍 Verified from database:', {
        hasSupplyChainRoute: !!verifiedItem.supplyChainRoute,
        hasSupplyChainRouteData: !!verifiedItem.supplyChainRouteData,
        hasAssignedTasks: !!verifiedItem.assignedTasks
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
    const { status, approvedBy, rejectionReason, notes } = req.body;
    
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
    } else if (status === 'completed') {
      materialRequest.completedAt = new Date();
    }
    
    // Update notes if provided
    if (notes !== undefined) {
      materialRequest.notes = notes;
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

// DELETE material request by request ID
router.delete('/by-request-id/:requestId', async (req, res) => {
  try {
    const materialRequest = await MaterialRequest.findOneAndUpdate(
      { requestId: req.params.requestId },
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
          },
          cancelledRequests: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          }
        }
      }
    ]);

    const priorityStats = await MaterialRequest.aggregate([
      {
        $group: {
          _id: '$priority',
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
    }).populate('parentRequestId', 'requestId description status materialId materialType');
    
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

// GET all material requests for a specific parent request
router.get('/parent/:parentRequestId', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 500;
    const skip = (page - 1) * limit;
    
    const filter = { parentRequestId: req.params.parentRequestId };
    
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

    const materialRequests = await MaterialRequest.find(filter)
      .populate('parentRequestId', 'requestId description status')
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
      message: 'Error fetching material requests for parent',
      error: error.message
    });
  }
});

module.exports = router;



