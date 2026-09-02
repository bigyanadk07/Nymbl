// models/Api.js

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ApiSchema = new mongoose.Schema({

  _id: {
    type: String,
    default: uuidv4
  },

  name: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    required: true
  },

  category: {
    type: String,
    required: true
  },

  endpoint: {
    type: String,
    required: true,
    unique: true
  },

  pricePerRequest: {
    type: Number,
    required: true,
    min: 0
  },

  usageLimit: {
    type: Number,
    required: true,
    min: 0
  },

  // ============================================================
  // DEFAULT RATE LIMIT CONFIGURATION
  // ============================================================
  //
  // These values are used when a subscribed package does not
  // provide its own rate-limit configuration.
  //
  // capacity:
  // Maximum burst allowed.
  //
  // refillRate:
  // Tokens added per second.
  //
  // leakRate:
  // Requests processed per second by the leaky bucket.
  //
  // ============================================================

  rateLimit: {

    capacity: {
      type: Number,
      default: 10,
      min: 1
    },

    refillRate: {
      type: Number,
      default: 2,
      min: 0.1
    },

    leakRate: {
      type: Number,
      default: 2,
      min: 0.1
    }

  },

  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model('Api', ApiSchema);