const cron = require('node-cron');
const { Op } = require('sequelize');
const Request = require('../models/Request');
const Record = require('../models/Record');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendEmail } = require('./email');

// Run every day at 9:00 AM
const scheduleReminders = () => {
  cron.schedule('0 9 * * *', async () => {
    try {
      const today = new Date();
      
      // Find requests where records are due in 2 days
      const dueSoonRequests = await Request.findAll({
        where: {
          status: 'approved',
          returnDate: {
            [Op.between]: [
              new Date(today.getTime() + 24 * 60 * 60 * 1000), // tomorrow
              new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000) // day after tomorrow
            ]
          }
        },
        include: [
          { model: Record },
          {
            model: User,
            as: 'requester',
            attributes: ['username', 'email']
          }
        ]
      });

      // Send due soon notifications
      for (const request of dueSoonRequests) {
        // Create notification
        const notification = await Notification.create({
          recipientId: request.requesterId,
          type: 'record_due',
          message: `Record "${request.Record.title}" is due for return soon`,
          requestId: request.id
        });

        // Send email
        await sendEmail({
          to: request.requester.email,
          template: 'record_due',
          data: {
            username: request.requester.username,
            recordTitle: request.Record.title,
            dueDate: request.returnDate.toLocaleDateString()
          }
        });

        // Send real-time notification
        global.io?.to(`user:${request.requesterId}`).emit('notification', notification);
      }

      // Find overdue requests
      const overdueRequests = await Request.findAll({
        where: {
          status: 'approved',
          returnDate: {
            [Op.lt]: today
          }
        },
        include: [
          { model: Record },
          {
            model: User,
            as: 'requester',
            attributes: ['username', 'email']
          }
        ]
      });

      // Send overdue notifications
      for (const request of overdueRequests) {
        // Create notification
        const notification = await Notification.create({
          recipientId: request.requesterId,
          type: 'record_overdue',
          message: `Record "${request.Record.title}" is overdue`,
          requestId: request.id
        });

        // Send email
        await sendEmail({
          to: request.requester.email,
          template: 'record_overdue',
          data: {
            username: request.requester.username,
            recordTitle: request.Record.title,
            dueDate: request.returnDate.toLocaleDateString()
          }
        });

        // Send real-time notification
        global.io?.to(`user:${request.requesterId}`).emit('notification', notification);
      }

      console.log(`Reminder check completed: ${new Date().toISOString()}`);
      console.log(`Sent ${dueSoonRequests.length} due soon reminders`);
      console.log(`Sent ${overdueRequests.length} overdue notifications`);
    } catch (error) {
      console.error('Error in reminder scheduler:', error);
    }
  });
};

module.exports = scheduleReminders;
