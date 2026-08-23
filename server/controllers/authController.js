// controllers/authController.js

const jwt = require('jsonwebtoken');
const config = require('../config/default');
const User = require('../models/User');
const otpService = require('../services/otpService');

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { user: { _id: user._id } },
    config.jwtSecret,
    { expiresIn: config.jwtExpiration }
  );
};

// =============================================
// 🔐 NEW: Email/Password Login
// =============================================
exports.loginWithEmail = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required' 
      });
    }

    // Find user by email (include password field)
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (err) {
    console.error('Email login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// =============================================
// 📝 NEW: Register with Email/Password
// =============================================
exports.registerWithEmail = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ 
        message: 'Name, email, password, and phone are required' 
      });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ 
        message: 'Email already registered' 
      });
    }

    // Check if phone already exists
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ 
        message: 'Phone number already registered' 
      });
    }

    // Create user (password will be hashed by pre-save hook)
    const user = new User({
      name,
      email,
      password,
      phone,
      isVerified: true // Email/password users are verified
    });

    await user.save();

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// =============================================
// 📱 OTP Login (KEPT for future use)
// =============================================
exports.loginWithPhone = async (req, res) => {
  try {
    console.log("Full request body:", req.body);
    console.log("Request headers:", req.headers);
    
    const { phone } = req.body;
    console.log("Extracted phone:", phone);
    
    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }
    
    // Send verification code via Twilio Verify
    const codeSent = await otpService.sendVerificationCode(phone);
    
    if (!codeSent) {
      return res.status(500).json({ message: 'Failed to send verification code' });
    }
    
    return res.json({ success: true, message: 'Verification code sent successfully' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// =============================================
// ✅ Verify OTP (KEPT for future use)
// =============================================
exports.verifyOTP = async (req, res) => {
  try {
    const { phone, code } = req.body;
    
    if (!phone || !code) {
      return res.status(400).json({ message: 'Phone number and verification code are required' });
    }
    
    // Verify code
    const isValid = await otpService.verifyCode(phone, code);
    
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }
    
    // Find or create user
    let user = await User.findOne({ phone });
    
    if (!user) {
      // First-time login, we'll create a minimal user
      user = new User({ 
        phone, 
        name: 'User',
        email: `${phone}@temp.com`, // Placeholder email
        password: Math.random().toString(36).slice(-8) // Random temp password
      });
      await user.save();
    }
    
    // Create JWT token
    const token = generateToken(user);
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (err) {
    console.error('Code verification error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// =============================================
// 📝 Register (KEPT for backwards compatibility)
// =============================================
exports.register = async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    if (!name || !phone) {
      return res.status(400).json({ message: 'Name and phone number are required' });
    }
    
    // Check if user already exists
    const phoneExists = await User.findOne({ phone });
    
    let user;
    if (phoneExists) {
      // Update existing user
      user = phoneExists;
      user.name = name;
      await user.save();
    } else {
      // Create new user (with placeholder email/password)
      user = new User({ 
        name, 
        phone,
        email: `${phone}@temp.com`,
        password: Math.random().toString(36).slice(-8)
      });
      await user.save();
    }
    
    // Create JWT token
    const token = generateToken(user);
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// =============================================
// 👤 Get Current User
// =============================================
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone
    });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};