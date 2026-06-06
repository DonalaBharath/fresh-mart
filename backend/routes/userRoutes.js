const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const userController = require('../controllers/userController');
const validateRequest = require('../middleware/validateRequest');
const { protect, admin } = require('../middleware/auth');

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many admin statistics requests. Please try again later.',
});

router.get('/me', protect, userController.getProfile);
router.put(
  '/me',
  protect,
  [
    body('fullName').optional().trim().notEmpty().withMessage('Full name is required'),
    body('phone').optional().trim().notEmpty().withMessage('Phone is required'),
    body('address').optional().trim().notEmpty().withMessage('Address is required'),
  ],
  validateRequest,
  userController.updateProfile
);
router.get('/stats', protect, admin, adminLimiter, userController.getStats);

module.exports = router;
