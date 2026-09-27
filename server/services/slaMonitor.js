const Complaint = require('../models/Complaint');
const { notifySlaBreached } = require('./notificationService');

async function checkSlaBreaches() {
  const now = new Date();
  const complaints = await Complaint.find({
    status: { $nin: ['RESOLVED','CLOSED'] },
    slaDueAt: { $lt: now },
    slaBreachedAt: null
  }).select('_id complaintId status slaDueAt slaBreachedAt history');

  for (const complaint of complaints) {
    complaint.slaBreachedAt = now;
    // `history` must be selected above before calling push().
    // Keep this guard for older documents that may not have a history array.
    if (!Array.isArray(complaint.history)) complaint.history = [];
    complaint.history.push({
      action: 'SLA_BREACHED',
      message: `SLA breached on ${now.toLocaleString()}`,
      by: null
    });
    await complaint.save();
    await notifySlaBreached(complaint);
  }
  if (complaints.length) console.log(`SLA monitor: ${complaints.length} complaint(s) breached.`);
  return complaints.length;
}

function startSlaMonitor() {
  checkSlaBreaches().catch(err => console.error('SLA monitor error:', err.message));
  setInterval(() => checkSlaBreaches().catch(err => console.error('SLA monitor error:', err.message)), 5 * 60 * 1000);
}

module.exports = { checkSlaBreaches, startSlaMonitor };
