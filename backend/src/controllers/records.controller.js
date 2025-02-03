const Record = require('../models/Record');
const Request = require('../models/Request');
const ActivityLog = require('../models/ActivityLog');
const { Op } = require('sequelize');

// @desc    Get all records
// @route   GET /api/records
// @access  Private
exports.getRecords = async (req, res, next) => {
  try {
    const records = await Record.findAll({
      include: [
        {
          model: Request,
          as: 'requests',
          attributes: ['id', 'status', 'requestDate', 'returnDate']
        }
      ]
    });

    res.json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single record
// @route   GET /api/records/:id
// @access  Private
exports.getRecord = async (req, res, next) => {
  try {
    const record = await Record.findByPk(req.params.id, {
      include: [
        {
          model: Request,
          as: 'requests',
          attributes: ['id', 'status', 'requestDate', 'returnDate']
        }
      ]
    });

    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    res.json({
      success: true,
      data: record
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new record
// @route   POST /api/records
// @access  Private/Admin
exports.createRecord = async (req, res, next) => {
  try {
    const record = await Record.create({
      ...req.body,
      createdBy: req.user.id
    });

    // Log activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'CREATE_RECORD',
      details: { recordId: record.id, title: record.title },
      ipAddress: req.ip
    });

    res.status(201).json({
      success: true,
      data: record
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update record
// @route   PUT /api/records/:id
// @access  Private/Admin
exports.updateRecord = async (req, res, next) => {
  try {
    let record = await Record.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    record = await record.update(req.body);

    // Log activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'UPDATE_RECORD',
      details: { recordId: record.id, updates: req.body },
      ipAddress: req.ip
    });

    res.json({
      success: true,
      data: record
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete record
// @route   DELETE /api/records/:id
// @access  Private/Admin
exports.deleteRecord = async (req, res, next) => {
  try {
    const record = await Record.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    await record.destroy();

    // Log activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'DELETE_RECORD',
      details: { recordId: req.params.id },
      ipAddress: req.ip
    });

    res.json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Search records
// @route   GET /api/records/search
// @access  Private
exports.searchRecords = async (req, res, next) => {
  try {
    const { query } = req.query;

    const records = await Record.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } },
          { fileNumber: { [Op.iLike]: `%${query}%` } }
        ]
      }
    });

    res.json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (err) {
    next(err);
  }
};
