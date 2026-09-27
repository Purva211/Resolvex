const Notification = require('../models/Notification');

exports.list = async (req, res) => {
  try {
    const items = await Notification.find({ recipient: req.user._id })
      .populate('complaint', 'complaintId title')
      .sort('-createdAt')
      .limit(50);
    const unread = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
    res.json({ items, unread });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.read = async (req, res) => {
  try {
    const item = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!item) return res.status(404).json({ message: 'Notification not found' });
    res.json(item);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.readAll = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
