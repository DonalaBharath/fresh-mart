const jwt = require('jsonwebtoken');
const User = require('../models/User');

const getTokenFromRequest = (req) => {
  const bearer = req.headers.authorization?.split(' ')[1];
  return bearer || req.cookies.accessToken || req.cookies.token;
};

exports.protect = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return res.status(401).json({ message: 'Not authorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'Invalid token' });

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

exports.requireRole = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) {
    return res.status(403).json({ message: `${role.charAt(0).toUpperCase() + role.slice(1)} access required` });
  }
  next();
};

exports.admin = exports.requireRole('admin');
exports.customer = exports.requireRole('customer');
