const express = require('express');
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const validateRequest = require('../middleware/validateRequest');
const { protect } = require('../middleware/auth');

// Registration requests - 10 requests per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many registration attempts. Please try again later.',
  skip: (req) => req.method !== 'POST', // Only apply to POST requests
});

// Login attempts - 10 requests per 15 minutes (stricter for security)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts. Please try again later.',
  skip: (req) => req.method !== 'POST',
});

// OTP requests - 15 requests per 15 minutes (increased from 6)
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: 'Too many OTP attempts. Please try again later.',
  skip: (req) => req.method !== 'POST',
});

router.get('/csrf-token', authController.csrfToken);

router.post(
  '/register',
  authLimiter,
  [
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('email').normalizeEmail().isEmail().withMessage('Valid email is required'),
    body('password')
      .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 0,
        minNumbers: 1,
        minSymbols: 0,
      })
      .withMessage('Password must be at least 8 characters and include a number'),
  ],
  validateRequest,
  authController.register
);

router.post(
  '/verify-otp',
  otpLimiter,
  [
    body('email').normalizeEmail().isEmail().withMessage('Valid email is required'),
    body('otp').isLength({ min: 4, max: 4 }).withMessage('OTP must be 4 digits').trim(),
  ],
  validateRequest,
  authController.verifyOtp
);

router.post(
  '/resend-otp',
  otpLimiter,
  [body('email').normalizeEmail().isEmail().withMessage('Valid email is required')],
  validateRequest,
  authController.resendOtp
);

router.post(
  '/login',
  loginLimiter,
  [
    body('email').normalizeEmail().isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validateRequest,
  authController.login
);

router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);
router.get('/profile', protect, authController.profile);

module.exports = router;
