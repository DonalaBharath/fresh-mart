const User = require('../models/User');

exports.getProfile = async (req, res) => {
  res.json({ user: req.user });
};

exports.updateProfile = async (req, res) => {
  const { fullName, phone, address } = req.body;
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { fullName, phone, address }, { new: true, runValidators: true }).select('-password');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Unable to update profile' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalOrders = await require('../models/Order').countDocuments();
    const totalProducts = await require('../models/Product').countDocuments();
    res.json({ totalCustomers, totalOrders, totalProducts });
  } catch (error) {
    res.status(500).json({ message: 'Unable to load statistics' });
  }
};
