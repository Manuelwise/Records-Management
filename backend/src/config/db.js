const mongoose = require('mongoose');
const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// PostgreSQL connection
const sequelize = new Sequelize(process.env.POSTGRES_URI || 'postgres://localhost:5432/records_management', {
  dialect: 'postgres',
  logging: false,
});

// MongoDB connection
const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/records_management');
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exitCode = 1;
  }
};

// Test PostgreSQL connection
const connectPostgres = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL Connected');
  } catch (error) {
    console.error('PostgreSQL connection error:', error);
    process.exitCode = 1;
  }
};

const connectDB = async () => {
  await connectMongoDB();
  await connectPostgres();
};

module.exports = connectDB;
module.exports.sequelize = sequelize;
module.exports.mongoose = mongoose;
