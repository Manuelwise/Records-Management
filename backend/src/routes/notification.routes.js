const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Get all notifications for the current user
router.get('/', async (req, res, next) => {
  try {
    const notifications = await req.app.locals.models.Notification
      .find({ recipientId: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: notifications
    });
  } catch (err) {
    next(err);
  }
});

// Get unread notifications count
router.get('/unread', async (req, res, next) => {
  try {
    const count = await req.app.locals.models.Notification
      .countDocuments({ 
        recipientId: req.user.id,
        read: false
      });

    res.json({
      success: true,
      data: count
    });
  } catch (err) {
    next(err);
  }
});

// Mark notification as read
router.put('/:id', async (req, res, next) => {
  try {
    const notification = await req.app.locals.models.Notification
      .findOneAndUpdate(
        { _id: req.params.id, recipientId: req.user.id },
        { read: true },
        { new: true }
      );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      data: notification
    });
  } catch (err) {
    next(err);
  }
});

// Mark all notifications as read
router.put('/', async (req, res, next) => {
  try {
    await req.app.locals.models.Notification
      .updateMany(
        { recipientId: req.user.id, read: false },
        { read: true }
      );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (err) {
    next(err);
  }
});

// Delete a notification
router.delete('/:id', async (req, res, next) => {
  try {
    const notification = await req.app.locals.models.Notification
      .findOneAndDelete({
        _id: req.params.id,
        recipientId: req.user.id
      });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
