// routes/auth.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const auth = require('../middleware/auth.middleware');
const { publicRateLimiter } = require('../middleware/ratelimiter.middleware');

// =============================================
// 🔐 Email/Password Routes (NEW - Use these!)
// =============================================

// POST /auth/login - Login with email + password
router.post('/login', publicRateLimiter, authController.loginWithEmail);

// POST /auth/register - Register with name, email, password, phone
router.post('/register', publicRateLimiter, authController.registerWithEmail);

// =============================================
// 📱 Phone/OTP Routes (KEPT for future use)
// =============================================

// POST /auth/login-phone - Send OTP for login (phone-based)
router.post('/login-phone', publicRateLimiter, authController.loginWithPhone);

// POST /auth/verify-otp - Verify OTP and generate token
router.post('/verify-otp', publicRateLimiter, authController.verifyOTP);

// =============================================
// 👤 Protected Routes
// =============================================

// GET /auth/me - Get current user
router.get('/me', auth, authController.getCurrentUser);

module.exports = router;