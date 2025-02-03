const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Record = sequelize.define('Record', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  fileNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  status: {
    type: DataTypes.ENUM('available', 'checked_out'),
    defaultValue: 'available'
  },
  location: {
    type: DataTypes.STRING(100)
  },
  category: {
    type: DataTypes.STRING(100)
  },
  createdBy: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
});

module.exports = Record;
