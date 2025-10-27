const express = require('express');
const router = express.Router();
const SupplyChainRoute = require('../models/SupplyChainRoute');

// GET all supply chain routes with pagination and filtering
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
    
    // Filter by route type
    if (req.query.routeType) {
      filter.routeType = req.query.routeType;
    }
    
    // Filter by location type
    if (req.query.locationType) {
      filter['locations.type'] = req.query.locationType;
    }
    
    // Filter by specific location ID
    if (req.query.locationId) {
      filter['locations.id'] = req.query.locationId;
    }
    
    // Filter by tags
    if (req.query.tags) {
      const tags = Array.isArray(req.query.tags) ? req.query.tags : [req.query.tags];
      filter.tags = { $in: tags };
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
    
    // Search by name, description, or location names
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { 'locations.name': { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Sort options
    let sort = { createdAt: -1 };
    if (req.query.sortBy) {
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
      sort = { [req.query.sortBy]: sortOrder };
    }

    const routes = await SupplyChainRoute.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await SupplyChainRoute.countDocuments(filter);

    res.json({
      success: true,
      data: routes,
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
      message: 'Error fetching supply chain routes',
      error: error.message
    });
  }
});

// GET single supply chain route by ID
router.get('/:id', async (req, res) => {
  try {
    const route = await SupplyChainRoute.findById(req.params.id);
    
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Supply chain route not found'
      });
    }

    res.json({
      success: true,
      data: route
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching supply chain route',
      error: error.message
    });
  }
});

// GET supply chain route by route ID (custom ID field)
router.get('/by-route-id/:routeId', async (req, res) => {
  try {
    const route = await SupplyChainRoute.findOne({ id: req.params.routeId });
    
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Supply chain route not found'
      });
    }

    res.json({
      success: true,
      data: route
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching supply chain route',
      error: error.message
    });
  }
});

// POST create new supply chain route
router.post('/', async (req, res) => {
  try {
    const routeData = req.body;
    
    // Check if route with same ID already exists
    if (routeData.id) {
      const existingRoute = await SupplyChainRoute.findOne({ id: routeData.id });
      if (existingRoute) {
        return res.status(400).json({
          success: false,
          message: 'Supply chain route with this ID already exists'
        });
      }
    }
    
    // Validate required fields
    if (!routeData.locations || routeData.locations.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one location is required'
      });
    }
    
    if (!routeData.hierarchicalStructure) {
      return res.status(400).json({
        success: false,
        message: 'Hierarchical structure is required'
      });
    }
    
    // Set default status if not provided
    if (!routeData.status) {
      routeData.status = 'draft';
    }
    
    const route = new SupplyChainRoute(routeData);
    await route.save();

    res.status(201).json({
      success: true,
      message: 'Supply chain route created successfully',
      data: route
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
      message: 'Error creating supply chain route',
      error: error.message
    });
  }
});

// PUT update supply chain route
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    
    // Prevent updating certain fields
    delete updates.id;
    delete updates.createdAt;
    
    // Validate locations if being updated
    if (updates.locations && updates.locations.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one location is required'
      });
    }
    
    const route = await SupplyChainRoute.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Supply chain route not found'
      });
    }

    res.json({
      success: true,
      message: 'Supply chain route updated successfully',
      data: route
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
      message: 'Error updating supply chain route',
      error: error.message
    });
  }
});

// PATCH update supply chain route status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    const route = await SupplyChainRoute.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Supply chain route not found'
      });
    }

    res.json({
      success: true,
      message: 'Supply chain route status updated successfully',
      data: route
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating supply chain route status',
      error: error.message
    });
  }
});

// DELETE supply chain route
router.delete('/:id', async (req, res) => {
  try {
    const route = await SupplyChainRoute.findByIdAndDelete(req.params.id);

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Supply chain route not found'
      });
    }

    res.json({
      success: true,
      message: 'Supply chain route deleted successfully',
      data: route
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting supply chain route',
      error: error.message
    });
  }
});

// GET routes between two specific locations (search functionality)
router.get('/search/between-locations', async (req, res) => {
  try {
    const { fromLocation, toLocation, sortBy = 'bestMatch' } = req.query;
    
    if (!fromLocation || !toLocation) {
      return res.status(400).json({
        success: false,
        message: 'Both fromLocation and toLocation are required'
      });
    }
    console.log("AG >> ", fromLocation, toLocation)
    // Find routes that contain both locations
    const routes = await SupplyChainRoute.find({
      'locations.id': { $in: [fromLocation, toLocation] },
      status: { $in: ['active', 'draft'] }
    });
    
    // Filter and score routes based on how well they match the search criteria
    const scoredRoutes = routes.map(route => {
      const fromLocationExists = route.locations.some(loc => loc.id === fromLocation);
      const toLocationExists = route.locations.some(loc => loc.id === toLocation);
      
      if (!fromLocationExists || !toLocationExists) {
        return null; // Skip routes that don't have both locations
      }
      
      // Calculate match score
      let score = 0;
      
      // Base score for having both locations
      score += 100;
      
      // Bonus for direct connection
      const hasDirectConnection = route.connectors.some(conn => 
        (conn.from === fromLocation && conn.to === toLocation) ||
        (conn.from === toLocation && conn.to === fromLocation)
      );
      if (hasDirectConnection) {
        score += 50;
      }
      
      // Bonus for shorter routes (fewer intermediate locations)
      const totalLocations = route.locations.length;
      if (totalLocations <= 3) score += 30;
      else if (totalLocations <= 5) score += 20;
      else if (totalLocations <= 7) score += 10;
      
      // Bonus for active routes
      if (route.status === 'active') {
        score += 20;
      }
      
      // Penalty for complex routes (many connectors)
      const totalConnectors = route.connectors.length;
      if (totalConnectors > 10) score -= 10;
      else if (totalConnectors > 5) score -= 5;
      
      return {
        ...route.toObject(),
        matchScore: score,
        hasDirectConnection,
        totalLocations,
        totalConnectors
      };
    }).filter(route => route !== null);
    
    // Sort routes based on the specified criteria
    let sortedRoutes;
    switch (sortBy) {
      case 'bestMatch':
        sortedRoutes = scoredRoutes.sort((a, b) => b.matchScore - a.matchScore);
        break;
      case 'shortest':
        sortedRoutes = scoredRoutes.sort((a, b) => a.totalLocations - b.totalLocations);
        break;
      case 'mostDirect':
        sortedRoutes = scoredRoutes.sort((a, b) => {
          if (a.hasDirectConnection && !b.hasDirectConnection) return -1;
          if (!a.hasDirectConnection && b.hasDirectConnection) return 1;
          return b.matchScore - a.matchScore;
        });
        break;
      case 'newest':
        sortedRoutes = scoredRoutes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        sortedRoutes = scoredRoutes.sort((a, b) => b.matchScore - a.matchScore);
    }
    
    res.json({
      success: true,
      data: sortedRoutes,
      searchCriteria: {
        fromLocation,
        toLocation,
        sortBy,
        totalMatches: sortedRoutes.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching routes between locations',
      error: error.message
    });
  }
});

// GET routes containing a specific location
router.get('/search/by-location/:locationId', async (req, res) => {
  try {
    const { locationId } = req.params;
    const { includeInactive = false } = req.query;
    
    const filter = {
      'locations.id': locationId
    };
    
    if (!includeInactive) {
      filter.status = { $in: ['active', 'draft'] };
    }
    
    const routes = await SupplyChainRoute.find(filter)
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: routes,
      searchCriteria: {
        locationId,
        includeInactive: includeInactive === 'true',
        totalMatches: routes.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching routes by location',
      error: error.message
    });
  }
});

// GET supply chain route statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await SupplyChainRoute.aggregate([
      {
        $group: {
          _id: null,
          totalRoutes: { $sum: 1 },
          activeRoutes: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          draftRoutes: {
            $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
          },
          inactiveRoutes: {
            $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] }
          },
          archivedRoutes: {
            $sum: { $cond: [{ $eq: ['$status', 'archived'] }, 1, 0] }
          },
          averageLocationsPerRoute: { $avg: { $size: '$locations' } },
          averageConnectorsPerRoute: { $avg: { $size: '$connectors' } }
        }
      }
    ]);

    const routeTypeStats = await SupplyChainRoute.aggregate([
      {
        $group: {
          _id: '$routeType',
          count: { $sum: 1 }
        }
      }
    ]);

    const locationTypeStats = await SupplyChainRoute.aggregate([
      { $unwind: '$locations' },
      {
        $group: {
          _id: '$locations.type',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const monthlyStats = await SupplyChainRoute.aggregate([
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
          totalRoutes: 0,
          activeRoutes: 0,
          draftRoutes: 0,
          inactiveRoutes: 0,
          archivedRoutes: 0,
          averageLocationsPerRoute: 0,
          averageConnectorsPerRoute: 0
        },
        byRouteType: routeTypeStats,
        byLocationType: locationTypeStats,
        monthly: monthlyStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching supply chain route statistics',
      error: error.message
    });
  }
});

// GET all unique location types
router.get('/meta/location-types', async (req, res) => {
  try {
    const locationTypes = await SupplyChainRoute.distinct('locations.type');
    res.json({
      success: true,
      data: locationTypes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching location types',
      error: error.message
    });
  }
});

// GET all unique route types
router.get('/meta/route-types', async (req, res) => {
  try {
    const routeTypes = await SupplyChainRoute.distinct('routeType');
    res.json({
      success: true,
      data: routeTypes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching route types',
      error: error.message
    });
  }
});

// GET all unique tags
router.get('/meta/tags', async (req, res) => {
  try {
    const tags = await SupplyChainRoute.distinct('tags');
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

module.exports = router;


