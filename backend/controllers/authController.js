const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const User = require('../models/User');
const Otp = require('../models/Otp');
const { sendOtpEmail } = require('../utils/emailService');

const createAccessToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  });
};

const createRefreshToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
};



   
const generateOtp = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};
const createCsrfToken = () => crypto.randomBytes(24).toString('hex');

const setRefreshTokenCookie = (res, token) => {
  const secureCookie = process.env.NODE_ENV === 'production';
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: secureCookie,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  });
};

const setCsrfTokenCookie = (res) => {
  const csrfToken = createCsrfToken();
  const secureCookie = process.env.NODE_ENV === 'production';
  res.cookie('XSRF-TOKEN', csrfToken, {
    httpOnly: false,
    secure: secureCookie,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
  return csrfToken;
};

const sendRegistrationOtp = async ({ fullName, email, password }) => {
  const otp = generateOtp();
  const passwordHash = await bcrypt.hash(password, 12);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  const lastSentAt = new Date();

  const existingOtp = await Otp.findOne({ email });
  if (existingOtp) {
    existingOtp.fullName = fullName;
    existingOtp.passwordHash = passwordHash;
    existingOtp.otp = otp;
    existingOtp.expiresAt = expiresAt;
    existingOtp.attempts = 0;
    existingOtp.lastSentAt = lastSentAt;
    await existingOtp.save();
  } else {
    await Otp.create({ fullName, email, passwordHash, otp, expiresAt, lastSentAt });
  }

  await sendOtpEmail({ to: email, fullName, otp });
};

const buildUserPayload = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
});

exports.register = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        message: 'Account already exists. Please login.',
        code: 'ACCOUNT_EXISTS'
      });
    }

    // Send OTP for new registration
    await sendRegistrationOtp({ fullName, email, password });
    res.status(200).json({ 
      message: 'OTP sent to your email. Please verify to complete registration.',
      email 
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      message: 'Unable to send OTP. Please try again later.',
      code: 'SEND_OTP_FAILED'
    });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    // Find OTP record
    const otpEntry = await Otp.findOne({ email });
    if (!otpEntry) {
      return res.status(400).json({ 
        message: 'OTP not found. Please request a new OTP.',
        code: 'OTP_NOT_FOUND'
      });
    }

    // Check attempt limits
    if (otpEntry.attempts >= 5) {
      await Otp.deleteOne({ email });
      return res.status(429).json({ 
        message: 'Too many OTP attempts. Please request a new OTP.',
        code: 'OTP_ATTEMPTS_EXCEEDED'
      });
    }

    // Check if OTP expired
    if (otpEntry.expiresAt < new Date()) {
      await Otp.deleteOne({ email });
      return res.status(400).json({ 
        message: 'OTP expired. Please request a new OTP.',
        code: 'OTP_EXPIRED'
      });
    }

    // Validate OTP
    if (otpEntry.otp !== otp) {
      otpEntry.attempts += 1;
      await otpEntry.save();
      const remainingAttempts = 5 - otpEntry.attempts;
      return res.status(400).json({ 
        message: `Invalid OTP. ${remainingAttempts} attempts remaining.`,
        code: 'INVALID_OTP',
        remainingAttempts
      });
    }

    // Check if user already created (race condition check)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      await Otp.deleteOne({ email });
      return res.status(409).json({ 
        message: 'Account already exists. Please login.',
        code: 'ACCOUNT_EXISTS'
      });
    }

    // Create user account
    const user = await User.create({
      fullName: otpEntry.fullName,
      email: otpEntry.email,
      password: otpEntry.passwordHash,
    });

    // Clean up OTP
    await Otp.deleteOne({ email });

    // Generate tokens
    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    setRefreshTokenCookie(res, refreshToken);
    setCsrfTokenCookie(res);

    res.status(201).json({
      message: 'Registration successful! Welcome to Fresh Mart.',
      user: buildUserPayload(user),
      accessToken,
      code: 'REGISTRATION_SUCCESS'
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ 
      message: 'Unable to complete registration. Please try again later.',
      code: 'VERIFY_OTP_FAILED'
    });
  }
};

exports.resendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res.status(400).json({ 
        message: 'Email is required',
        code: 'EMAIL_REQUIRED'
      });
    }

    // Check if user already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        message: 'Account already exists. Please login.',
        code: 'ACCOUNT_EXISTS'
      });
    }

    // Find pending OTP
    const otpEntry = await Otp.findOne({ email });
    if (!otpEntry) {
      return res.status(400).json({ 
        message: 'No pending registration found. Please start new registration.',
        code: 'NO_PENDING_OTP'
      });
    }

    // Check cooldown (prevent spam)
    const elapsed = Date.now() - new Date(otpEntry.lastSentAt).getTime();
    const cooldownMs = 30 * 1000; // 30 seconds
    if (elapsed < cooldownMs) {
      const retryAfter = Math.ceil((cooldownMs - elapsed) / 1000);
      return res.status(429).json({ 
        message: `Please wait ${retryAfter} seconds before requesting a new OTP`,
        retryAfter,
        code: 'RESEND_COOLDOWN'
      });
    }

    // Generate new OTP
    otpEntry.otp = generateOtp();
    otpEntry.expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    otpEntry.attempts = 0;
    otpEntry.lastSentAt = new Date();
    await otpEntry.save();

    // Send email
    await sendOtpEmail({ to: email, fullName: otpEntry.fullName, otp: otpEntry.otp });
    
    res.status(200).json({ 
      message: 'New OTP sent to your email',
      code: 'OTP_RESENT'
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ 
      message: 'Unable to resend OTP. Please try again later.',
      code: 'RESEND_OTP_FAILED'
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Generate tokens
    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    setRefreshTokenCookie(res, refreshToken);
    setCsrfTokenCookie(res);

    res.status(200).json({ 
      message: 'Login successful',
      user: buildUserPayload(user), 
      accessToken,
      code: 'LOGIN_SUCCESS'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Login failed. Please try again later.',
      code: 'LOGIN_FAILED'
    });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: 'Missing refresh token' });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'Invalid refresh token' });

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    setRefreshTokenCookie(res, refreshToken);
    setCsrfTokenCookie(res);

    res.json({ user: buildUserPayload(user), accessToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.clearCookie('refreshToken', { path: '/api/auth' });
    res.status(401).json({ message: 'Could not refresh session' });
  }
};

exports.csrfToken = async (req, res) => {
  try {
    const csrfToken = setCsrfTokenCookie(res);
    res.json({ csrfToken });
  } catch (error) {
    console.error('CSRF token error:', error);
    res.status(500).json({ message: 'Unable to create CSRF token' });
  }
};

exports.profile = async (req, res) => {
  const user = req.user;
  res.json({ user: buildUserPayload(user) });
};

exports.logout = async (req, res) => {
  res.clearCookie('refreshToken', { path: '/api/auth' });
  res.clearCookie('XSRF-TOKEN', { path: '/' });
  res.json({ message: 'Logged out successfully' });
};
