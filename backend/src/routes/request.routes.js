const express = require('express');
const {
  getRequests,
  getMyRequests,
  createRequest,
  updateRequest,
  markReturned
} = require('../controllers/requests.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// User routes
router.get('/me', getMyRequests);
router.post('/', createRequest);

// Admin routes
router.get('/', authorize('admin'), getRequests);
router.put('/:id', authorize('admin'), updateRequest);
router.put('/:id/return', authorize('admin'), markReturned);

module.exports = router;
