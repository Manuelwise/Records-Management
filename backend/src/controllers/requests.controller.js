const Request = require('../models/Request');
const Record = require('../models/Record');
const User = require('../models/User');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const { sendEmail } = require('../utils/email');

// @desc    Get all requests
// @route   GET /api/requests
// @access  Private
exports.getRequests = async (req, res, next) => {
  try {
    const requests = await Request.findAll({
      include: [
        {
          model: Record,
          attributes: ['title', 'fileNumber']
        },
        {
          model: User,
          as: 'requester',
          attributes: ['username', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user's requests
// @route   GET /api/requests/me
// @access  Private
exports.getMyRequests = async (req, res, next) => {
  try {
    const requests = await Request.findAll({
      where: { requesterId: req.user.id },
      include: [
        {
          model: Record,
          attributes: ['title', 'fileNumber']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new request
// @route   POST /api/requests
// @access  Private
exports.createRequest = async (req, res, next) => {
  try {
    const { recordId, reason } = req.body;

    // Check if record exists
    const record = await Record.findByPk(recordId);
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    // Check if record is available
    if (record.status === 'checked_out') {
      return res.status(400).json({ message: 'Record is currently checked out' });
    }

    const request = await Request.create({
      recordId,
      requesterId: req.user.id,
      reason
    });

    // Create notification for admin
    const notification = await Notification.create({
      recipientId: 1, // Assuming admin has ID 1
      type: 'request_created',
      message: `New record request from ${req.user.username}`,
      requestId: request.id
    });

    // Send email to user
    await sendEmail({
      to: req.user.email,
      template: 'request_created',
      data: {
        username: req.user.username,
        recordTitle: record.title
      }
    });

    // Send real-time notification
    req.app.locals.io.to(`user:1`).emit('notification', notification);

    // Log activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'CREATE_REQUEST',
      details: { requestId: request.id, recordId },
      ipAddress: req.ip
    });

    res.status(201).json({
      success: true,
      data: request
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update request status
// @route   PUT /api/requests/:id
// @access  Private/Admin
exports.updateRequest = async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    const request = await Request.findByPk(req.params.id, {
      include: [
        { model: Record },
        { 
          model: User,
          as: 'requester',
          attributes: ['username', 'email']
        }
      ]
    });

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Update request status
    request.status = status;
    request.approvedBy = req.user.id;
    await request.save();

    // Update record status if request is approved
    if (status === 'approved') {
      await request.Record.update({ status: 'checked_out' });
    }

    // Create notification for requester
    const notification = await Notification.create({
      recipientId: request.requesterId,
      type: `request_${status}`,
      message: `Your record request has been ${status}`,
      requestId: request.id
    });

    // Send email notification
    await sendEmail({
      to: request.requester.email,
      template: `request_${status}`,
      data: {
        username: request.requester.username,
        recordTitle: request.Record.title,
        reason
      }
    });

    // Send real-time notification
    req.app.locals.io.to(`user:${request.requesterId}`).emit('notification', notification);

    // Log activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'UPDATE_REQUEST',
      details: { requestId: request.id, status },
      ipAddress: req.ip
    });

    res.json({
      success: true,
      data: request
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark request as returned
// @route   PUT /api/requests/:id/return
// @access  Private/Admin
exports.markReturned = async (req, res, next) => {
  try {
    const request = await Request.findByPk(req.params.id, {
      include: [
        { model: Record },
        {
          model: User,
          as: 'requester',
          attributes: ['username', 'email']
        }
      ]
    });

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'approved') {
      return res.status(400).json({ message: 'Request must be approved before marking as returned' });
    }

    // Update request
    request.status = 'returned';
    request.returnDate = new Date();
    await request.save();

    // Update record status
    await request.Record.update({ status: 'available' });

    // Create notification
    const notification = await Notification.create({
      recipientId: request.requesterId,
      type: 'record_returned',
      message: 'Record has been marked as returned',
      requestId: request.id
    });

    // Send email notification
    await sendEmail({
      to: request.requester.email,
      template: 'record_returned',
      data: {
        username: request.requester.username,
        recordTitle: request.Record.title
      }
    });

    // Send real-time notification
    req.app.locals.io.to(`user:${request.requesterId}`).emit('notification', notification);

    // Log activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'MARK_RETURNED',
      details: { requestId: request.id },
      ipAddress: req.ip
    });

    res.json({
      success: true,
      data: request
    });
  } catch (err) {
    next(err);
  }
};
