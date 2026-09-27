const Notification = require('../models/Notification');
const User = require('../models/User');

async function createNotification({ recipient, type, title, message, complaint = null, eventKey }) {
  if (!recipient) return null;
  try {
    return await Notification.create({ recipient, type, title, message, complaint, eventKey });
  } catch (err) {
    // Duplicate eventKey means the same event was already notified.
    if (err.code === 11000) return Notification.findOne({ eventKey });
    throw err;
  }
}

async function notifyComplaintCreated(complaint) {
  return createNotification({
    recipient: complaint.customer,
    type: 'COMPLAINT_CREATED',
    title: 'Complaint created',
    message: `${complaint.complaintId} was created successfully.`,
    complaint: complaint._id,
    eventKey: `${complaint._id}:created`
  });
}

async function notifyComplaintAssigned(complaint, agent) {
  return createNotification({
    recipient: agent._id,
    type: 'COMPLAINT_ASSIGNED',
    title: 'Complaint assigned',
    message: `${complaint.complaintId} has been assigned to you.`,
    complaint: complaint._id,
    eventKey: `${complaint._id}:assigned:${agent._id}:${new Date().getTime()}`
  });
}

async function notifyComplaintResolved(complaint) {
  return createNotification({
    recipient: complaint.customer,
    type: 'COMPLAINT_RESOLVED',
    title: 'Complaint resolved',
    message: `${complaint.complaintId} has been resolved. Please review the resolution.`,
    complaint: complaint._id,
    eventKey: `${complaint._id}:resolved:${complaint.resolvedAt ? new Date(complaint.resolvedAt).getTime() : Date.now()}`
  });
}

async function notifySlaBreached(complaint) {
  const admins = await User.find({ role: 'admin' }).select('_id');
  return Promise.all(admins.map(admin => createNotification({
    recipient: admin._id,
    type: 'SLA_BREACHED',
    title: 'SLA breached',
    message: `${complaint.complaintId} has breached its SLA and requires attention.`,
    complaint: complaint._id,
    eventKey: `${complaint._id}:sla-breached`
  })));
}

async function notifyComplaintReopened(complaint) {
  if (!complaint.assignedTo) return null;
  return createNotification({
    recipient: complaint.assignedTo,
    type: 'COMPLAINT_REOPENED',
    title: 'Complaint reopened',
    message: `${complaint.complaintId} was reopened by the customer.`,
    complaint: complaint._id,
    eventKey: `${complaint._id}:reopened:${Date.now()}`
  });
}

module.exports = {
  createNotification,
  notifyComplaintCreated,
  notifyComplaintAssigned,
  notifyComplaintResolved,
  notifySlaBreached,
  notifyComplaintReopened
};
