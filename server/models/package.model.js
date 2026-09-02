// models/Package.js

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const PackageSchema = new mongoose.Schema({

  _id: {
    type: String,
    default: uuidv4
  },

  name: {
    type: String,
    required: true
  },

  description: {
    type: String
  },

  price: {
    type: Number,
    required: true
  },

  billingCycle: {
    type: String,
    required: true,
    enum: ['monthly', 'quarterly', 'yearly']
  },

  features: {
    type: [String]
  },

  isPopular: {
    type: Boolean,
    default: false
  },

  // ============================================================
  // APIs INCLUDED IN THIS PACKAGE
  // ============================================================

  apis: [{
    type: String,
    ref: 'Api'
  }],

  // ============================================================
  // PACKAGE MONTHLY QUOTA
  // ============================================================
  //
  // If null, the API's usageLimit will be used.
  //
  // This allows packages to override the default API quota.
  //
  // Example:
  //
  // Basic package:
  // monthlyRequestLimit: 1000
  //
  // Premium package:
  // monthlyRequestLimit: 10000
  //
  // ============================================================

  monthlyRequestLimit: {
    type: Number,
    default: null,
    min: 0
  },

  // ============================================================
  // PACKAGE RATE LIMIT
  // ============================================================
  //
  // If null, the API's default rateLimit configuration
  // will be used.
  //
  // This makes rate limiting package-specific.
  //
  // ============================================================

  rateLimit: {

    capacity: {
      type: Number,
      default: null,
      min: 1
    },

    refillRate: {
      type: Number,
      default: null,
      min: 0.1
    },

    leakRate: {
      type: Number,
      default: null,
      min: 0.1
    }

  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model('Package', PackageSchema);