const mongoose = require('mongoose');

module.exports = (req, res, next) => {
  const invalidId = Object.values(req.params).find(
    (value) => value && !mongoose.Types.ObjectId.isValid(value)
  );

  if (invalidId) {
    return res.status(400).json({ message: 'Invalid identifier provided' });
  }

  next();
};