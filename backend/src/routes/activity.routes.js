const express = require('express');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply authentication and admin middleware to all routes
router.use(protect);
router.use(authorize('admin'));

// Get all activity logs
router.get('/', async (req, res, next) => {
  try {
    const logs = await req.app.locals.models.ActivityLog
      .find()
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      data: logs
    });
  } catch (err) {
    next(err);
  }
});

// Get activity logs for a specific user
router.get('/user/:userId', async (req, res, next) => {
  try {
    const logs = await req.app.locals.models.ActivityLog
      .find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: logs
    });
  } catch (err) {
    next(err);
  }
});

// Get activity logs by type
router.get('/type/:action', async (req, res, next) => {
  try {
    const logs = await req.app.locals.models.ActivityLog
      .find({ action: req.params.action })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: logs
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
