// middleware/auth.js

const jwt = require('jsonwebtoken');
const config = require('../config/default.config');
const User = require('../models/user.model');

module.exports = async function(req, res, next) {
  // Get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Get user from token
    const user = await User.findById(decoded.user._id);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid user' });
    }
    
    // Include all user fields in req.user
    req.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone
    };
    
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token is not valid' });
    }
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    
    res.status(401).json({ message: 'Token is not valid' });
  }
};