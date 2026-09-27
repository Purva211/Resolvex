const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
  }
  return transporter;
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, c => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;'
  }[c]));
}

async function sendComplaintResolvedEmail({ customerEmail, customerName, complaintId, title, category, resolution }) {
  const mailer = getTransporter();
  if (!mailer) {
    console.warn('Gmail notifications disabled: EMAIL_USER/EMAIL_PASS not configured.');
    return { sent: false, skipped: true };
  }

  await mailer.sendMail({
    from: `"ResolveX Support" <${process.env.EMAIL_USER}>`,
    to: customerEmail,
    subject: `Your ResolveX Complaint ${complaintId} Has Been Resolved`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#172033">
        <h2 style="color:#2563eb">ResolveX Complaint Update</h2>
        <p>Hello <strong>${escapeHtml(customerName)}</strong>,</p>
        <p>Your complaint <strong>${escapeHtml(complaintId)}</strong> has been resolved.</p>
        <hr>
        <p><strong>Complaint:</strong> ${escapeHtml(title)}</p>
        <p><strong>Category:</strong> ${escapeHtml(category)}</p>
        <p><strong>Status:</strong> <span style="color:#15803d">RESOLVED</span></p>
        <h3>Resolution</h3>
        <p>${escapeHtml(resolution || 'Your complaint has been resolved by our support team.').replace(/\n/g,'<br>')}</p>
        <hr>
        <p>Please login to ResolveX to view the complete complaint history and provide your feedback.</p>
        <p>Thank you,<br><strong>ResolveX Support Team</strong></p>
      </div>
    `
  });
  return { sent: true };
}

module.exports = { sendComplaintResolvedEmail };
