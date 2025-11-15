const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// GET all tasks with pagination and filtering
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
    
    // Filter by task type
    if (req.query.taskType) {
      filter.taskType = req.query.taskType;
    }
    
    // Filter by priority
    if (req.query.priority) {
      filter.priority = req.query.priority;
    }
    
    // Filter by assigned user
    if (req.query.assignedTo) {
      filter.assignedTo = req.query.assignedTo;
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
    
    // Filter by due date
    if (req.query.dueDate) {
      filter.dueDate = { $lte: new Date(req.query.dueDate) };
    }
    
    // Filter by overdue tasks (only for active tasks)
    if (req.query.overdue === 'true') {
      filter.dueDate = { $lt: new Date() };
      filter.status = { $in: ['Active', 'active', 'in_progress', 'pending'] };
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
      const tasks = await Task.find(filter);
      
      // Score tasks based on search relevance
      const scoredTasks = tasks.map(task => {
        let score = 0;
        const searchTerm = req.query.search.toLowerCase();
        
        // Name match (highest priority)
        if (task.name && task.name.toLowerCase().includes(searchTerm)) {
          score += 100;
        }
        
        // Description match
        if (task.description && task.description.toLowerCase().includes(searchTerm)) {
          score += 50;
        }
        
        // Data object match
        if (task.dataObject && task.dataObject.toLowerCase().includes(searchTerm)) {
          score += 30;
        }
        
        // Priority boost
        if (task.priority === 'Critical') score += 20;
        else if (task.priority === 'High') score += 15;
        else if (task.priority === 'Medium') score += 10;
        else if (task.priority === 'Low') score += 5;
        
        // Status boost
        if (task.status === 'Active' || task.status === 'active' || task.status === 'in_progress') score += 10;
        else if (task.status === 'Draft' || task.status === 'draft') score += 5;
        else if (task.status === 'pending') score += 8;
        
        // Overdue penalty (only for active tasks)
        const activeStatuses = ['Active', 'active', 'in_progress', 'pending'];
        if (activeStatuses.includes(task.status) && task.isOverdue) score -= 15;
        
        return {
          ...task.toObject(),
          matchScore: score
        };
      });
      
      // Sort by match score
      scoredTasks.sort((a, b) => b.matchScore - a.matchScore);
      
      // Apply pagination
      const total = scoredTasks.length;
      const paginatedTasks = scoredTasks.slice(skip, skip + limit);
      
      return res.json({
        success: true,
        data: paginatedTasks,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    }

    const tasks = await Task.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Task.countDocuments(filter);

    res.json({
      success: true,
      data: tasks,
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
      message: 'Error fetching tasks',
      error: error.message
    });
  }
});

// GET single task by ID
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching task',
      error: error.message
    });
  }
});

// GET task by custom ID (id field)
router.get('/by-task-id/:taskId', async (req, res) => {
  try {
    const task = await Task.findOne({ id: req.params.taskId });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching task',
      error: error.message
    });
  }
});

// POST create new task
router.post('/', async (req, res) => {
  try {
    const taskData = req.body;
    
    // Check if task with same ID already exists
    if (taskData.id) {
      const existingTask = await Task.findOne({ id: taskData.id });
      if (existingTask) {
        return res.status(400).json({
          success: false,
          message: 'Task with this ID already exists'
        });
      }
    }
    
    // Set default values if not provided
    if (!taskData.createdBy) {
      taskData.createdBy = 'system';
    }
    
    const task = new Task(taskData);
    await task.save();

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
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
      message: 'Error creating task',
      error: error.message
    });
  }
});

// PUT update task
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    
    console.log('🔄 Task PUT - Updates received:', Object.keys(updates));
    console.log('🔄 Task PUT - Task ID:', updates.id);
    console.log('🔄 Task PUT - Status:', updates.status);
    console.log('🔄 Task PUT - Workstream:', updates.workstream);
    
    // Prevent updating certain fields
    delete updates.id;
    delete updates.createdAt;
    delete updates.createdBy;
    
    // Use findById and save to properly handle all field updates
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Apply updates to the document
    Object.keys(updates).forEach(key => {
      task.set(key, updates[key]);
    });

    // Save the document
    await task.save({ runValidators: true });

    console.log('✅ Task updated successfully:', {
      id: task._id,
      taskId: task.id,
      name: task.name,
      status: task.status,
      workstream: task.workstream
    });

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    console.error('❌ Task PUT Error:', error.message);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      console.error('❌ Validation errors:', messages);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating task',
      error: error.message
    });
  }
});

// PATCH update task status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, lastModifiedBy } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    const updateData = { status };
    if (lastModifiedBy) {
      updateData.lastModifiedBy = lastModifiedBy;
    }
    
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      message: 'Task status updated successfully',
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating task status',
      error: error.message
    });
  }
});

// PATCH assign task
router.patch('/:id/assign', async (req, res) => {
  try {
    const { assignedTo, lastModifiedBy } = req.body;
    
    if (!assignedTo) {
      return res.status(400).json({
        success: false,
        message: 'Assigned to is required'
      });
    }
    
    const updateData = { assignedTo };
    if (lastModifiedBy) {
      updateData.lastModifiedBy = lastModifiedBy;
    }
    
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      message: 'Task assigned successfully',
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error assigning task',
      error: error.message
    });
  }
});

// DELETE task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully',
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting task',
      error: error.message
    });
  }
});

// GET tasks by user (assigned to or created by)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { includeInactive = false } = req.query;
    
    const filter = {
      $or: [
        { assignedTo: userId },
        { createdBy: userId }
      ]
    };
    
    if (!includeInactive) {
      filter.isActive = true;
    }
    
    const tasks = await Task.find(filter)
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: tasks,
      searchCriteria: {
        userId,
        includeInactive: includeInactive === 'true',
        totalMatches: tasks.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user tasks',
      error: error.message
    });
  }
});

// GET task statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Task.aggregate([
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          activeTasks: {
            $sum: { $cond: [{ $in: ['$status', ['Active', 'active', 'in_progress', 'pending']] }, 1, 0] }
          },
          draftTasks: {
            $sum: { $cond: [{ $in: ['$status', ['Draft', 'draft']] }, 1, 0] }
          },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          failedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          },
          cancelledTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          archivedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'Archived'] }, 1, 0] }
          },
          overdueTasks: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $in: ['$status', ['Active', 'active', 'in_progress', 'pending']] },
                    { $lt: ['$dueDate', new Date()] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const priorityStats = await Task.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const taskTypeStats = await Task.aggregate([
      {
        $group: {
          _id: '$taskType',
          count: { $sum: 1 }
        }
      }
    ]);

    const monthlyStats = await Task.aggregate([
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
          totalTasks: 0,
          activeTasks: 0,
          draftTasks: 0,
          archivedTasks: 0,
          overdueTasks: 0
        },
        byPriority: priorityStats,
        byTaskType: taskTypeStats,
        monthly: monthlyStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching task statistics',
      error: error.message
    });
  }
});

// GET all unique task types
router.get('/meta/task-types', async (req, res) => {
  try {
    const taskTypes = await Task.distinct('taskType');
    res.json({
      success: true,
      data: taskTypes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching task types',
      error: error.message
    });
  }
});

// GET all unique priorities
router.get('/meta/priorities', async (req, res) => {
  try {
    const priorities = await Task.distinct('priority');
    res.json({
      success: true,
      data: priorities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching priorities',
      error: error.message
    });
  }
});

// GET all unique tags
router.get('/meta/tags', async (req, res) => {
  try {
    const tags = await Task.distinct('tags');
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

// GET all unique statuses
router.get('/meta/statuses', async (req, res) => {
  try {
    const statuses = ['draft', 'pending', 'in_progress', 'active', 'completed', 'cancelled', 'failed', 'on_hold', 'Active', 'Draft', 'Archived'];
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

module.exports = router;
