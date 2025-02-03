const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Email templates
const emailTemplates = {
  request_created: (username, recordTitle) => ({
    subject: 'New Record Request Created',
    html: `
      <h2>New Record Request</h2>
      <p>Hello ${username},</p>
      <p>Your request for the record "${recordTitle}" has been submitted successfully.</p>
      <p>You will be notified when an administrator reviews your request.</p>
      <br>
      <p>Best regards,</p>
      <p>GNPC Records Management Team</p>
    `
  }),
  request_approved: (username, recordTitle) => ({
    subject: 'Record Request Approved',
    html: `
      <h2>Request Approved</h2>
      <p>Hello ${username},</p>
      <p>Your request for the record "${recordTitle}" has been approved.</p>
      <p>You can now collect the record from the Records Management Unit.</p>
      <br>
      <p>Best regards,</p>
      <p>GNPC Records Management Team</p>
    `
  }),
  request_rejected: (username, recordTitle, reason) => ({
    subject: 'Record Request Rejected',
    html: `
      <h2>Request Rejected</h2>
      <p>Hello ${username},</p>
      <p>Your request for the record "${recordTitle}" has been rejected.</p>
      ${reason ? `<p>Reason: ${reason}</p>` : ''}
      <p>If you have any questions, please contact the Records Management Unit.</p>
      <br>
      <p>Best regards,</p>
      <p>GNPC Records Management Team</p>
    `
  }),
  record_due: (username, recordTitle, dueDate) => ({
    subject: 'Record Return Reminder',
    html: `
      <h2>Record Return Reminder</h2>
      <p>Hello ${username},</p>
      <p>This is a reminder that the record "${recordTitle}" is due for return on ${dueDate}.</p>
      <p>Please ensure to return it to the Records Management Unit before the due date.</p>
      <br>
      <p>Best regards,</p>
      <p>GNPC Records Management Team</p>
    `
  }),
  record_overdue: (username, recordTitle, dueDate) => ({
    subject: 'Record Overdue Notice',
    html: `
      <h2>Record Overdue Notice</h2>
      <p>Hello ${username},</p>
      <p>The record "${recordTitle}" was due for return on ${dueDate}.</p>
      <p>Please return it to the Records Management Unit as soon as possible.</p>
      <br>
      <p>Best regards,</p>
      <p>GNPC Records Management Team</p>
    `
  })
};

// Send email function
const sendEmail = async ({ to, template, data }) => {
  try {
    const transporter = createTransporter();
    const { subject, html } = emailTemplates[template](data.username, data.recordTitle, data.reason);

    const mailOptions = {
      from: `"GNPC Records Management" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

module.exports = {
  sendEmail
};
