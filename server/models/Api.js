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
    required: true
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