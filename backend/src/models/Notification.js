const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipientId: {
    type: Number,
    required: true,
    ref: 'User'
  },
  type: {
    type: String,
    required: true,
    enum: ['request_created', 'request_approved', 'request_rejected', 'record_due', 'record_returned']
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  requestId: {
    type: Number,
    ref: 'Request'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', NotificationSchema);
