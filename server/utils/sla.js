const SLA_HOURS = Object.freeze({
  LOW: 72,
  MEDIUM: 48,
  HIGH: 24,
  CRITICAL: 8
});

function getSlaHours(priority) {
  return SLA_HOURS[priority] || SLA_HOURS.MEDIUM;
}

function getSlaDueAt(priority, from = new Date()) {
  return new Date(from.getTime() + getSlaHours(priority) * 60 * 60 * 1000);
}

function isSlaBreached(complaint, now = new Date()) {
  return Boolean(
    complaint.slaDueAt &&
    complaint.status !== 'RESOLVED' &&
    complaint.status !== 'CLOSED' &&
    new Date(complaint.slaDueAt) < now
  );
}

function isDueSoon(complaint, hours = 24, now = new Date()) {
  if (!complaint.slaDueAt || complaint.status === 'RESOLVED' || complaint.status === 'CLOSED') return false;
  const due = new Date(complaint.slaDueAt).getTime();
  const current = now.getTime();
  return due >= current && due <= current + hours * 60 * 60 * 1000;
}

module.exports = { SLA_HOURS, getSlaHours, getSlaDueAt, isSlaBreached, isDueSoon };
