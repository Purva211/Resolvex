const User = require('../models/User');
exports.getAgents = async (req, res) => {
  const agents = await User.find({ role: 'agent' }).select('-password').sort('name');
  res.json(agents);
};
exports.getUsers = async (req, res) => {
  const users = await User.find().select('-password').sort('-createdAt');
  res.json(users);
};
