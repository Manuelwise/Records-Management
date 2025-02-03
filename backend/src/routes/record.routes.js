const express = require('express');
const {
  getRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
  searchRecords
} = require('../controllers/records.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Public routes (authenticated users)
router.get('/', getRecords);
router.get('/search', searchRecords);
router.get('/:id', getRecord);

// Admin only routes
router.post('/', authorize('admin'), createRecord);
router.put('/:id', authorize('admin'), updateRecord);
router.delete('/:id', authorize('admin'), deleteRecord);

module.exports = router;
