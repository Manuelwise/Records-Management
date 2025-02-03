const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const scheduleReminders = require('./utils/scheduler');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Store models in app locals for easy access in routes
app.locals.models = {
  Notification: require('./models/Notification'),
  ActivityLog: require('./models/ActivityLog')
};

// Make io available globally for the scheduler
global.io = io;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/records', require('./routes/record.routes'));
app.use('/api/requests', require('./routes/request.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/activity', require('./routes/activity.routes'));

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Store user ID for notifications
  socket.on('authenticate', (userId) => {
    socket.userId = userId;
    socket.join(`user:${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Add socket.io instance to app locals for use in controllers
app.locals.io = io;

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await connectDB();
  
  // Initialize the reminder scheduler
  scheduleReminders();
  console.log('Reminder scheduler initialized');
});
