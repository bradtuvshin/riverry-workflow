const express = require('express');
const Task = require('../models/Task');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/artist/my-tasks', async (req, res) => {
  try {
    if (req.user.role !== 'artist') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { status, page = 1, limit = 10 } = req.query;

    const filter = { assignedTo: req.user._id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const tasks = await Task.find(filter)
      .sort({ dueDate: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Task.countDocuments(filter);

    const stats = await Task.aggregate([
      { $match: { assignedTo: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const taskStats = {
      total: total,
      pending: 0,
      assigned: 0,
      in_progress: 0,
      submitted: 0,
      completed: 0
    };

    stats.forEach(stat => {
      taskStats[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: {
        tasks,
        stats: taskStats,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get artist tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get artist tasks',
      error: error.message
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'firstName lastName email role artistInfo')
      .populate('assignedBy', 'firstName lastName');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (req.user.role === 'artist' && 
        (!task.assignedTo || task.assignedTo._id.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this task'
      });
    }

    res.json({
      success: true,
      data: { task }
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get task',
      error: error.message
    });
  }
});

router.put('/:id/submit', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only assigned artist can submit this task'
      });
    }

    task.status = 'submitted';
    task.submittedAt = new Date();
    
    await task.save();

    res.json({
      success: true,
      message: 'Task submitted successfully',
      data: { task }
    });
  } catch (error) {
    console.error('Submit task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit task',
      error: error.message
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { status, actualHours } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (req.user.role === 'artist') {
      if (task.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      
      if (status && ['in_progress', 'submitted'].includes(status)) {
        task.status = status;
        if (status === 'in_progress' && !task.startedAt) {
          task.startedAt = new Date();
        }
        if (status === 'submitted') {
          task.submittedAt = new Date();
        }
      }
      if (actualHours) {
        task.timeTracking.actualHours = actualHours;
      }
    }

    await task.save();

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: { task }
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task',
      error: error.message
    });
  }
});

module.exports = router;
