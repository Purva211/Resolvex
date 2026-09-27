const { analyzeComplaint } = require('../services/aiComplaintService');

exports.analyzeComplaint = async (req, res) => {
  try {
    const description = String(req.body.description || '').trim();
    if (!description) return res.status(400).json({ message: 'Complaint description is required' });
    if (description.length > 5000) return res.status(400).json({ message: 'Complaint description cannot exceed 5000 characters' });

    const result = await analyzeComplaint(description);
    res.json({ success: true, analysis: result });
  } catch (error) {
    const status = error.code === 'AI_NOT_CONFIGURED' ? 503 : 502;
    res.status(status).json({
      success: false,
      message: error.message || 'AI analysis failed',
      code: error.code || 'AI_ERROR'
    });
  }
};
