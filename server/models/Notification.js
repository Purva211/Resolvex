const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['COMPLAINT_CREATED','COMPLAINT_ASSIGNED','COMPLAINT_RESOLVED','SLA_BREACHED','COMPLAINT_REOPENED','COMPLAINT_CLOSED'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  complaint: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', default: null },
  isRead: { type: Boolean, default: false },
  eventKey: { type: String, unique: true, sparse: true }
}, { timestamps: true });

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
