// models/ApiUsage.js

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ApiUsageSchema = new mongoose.Schema({

  _id: {
    type: String,
    default: uuidv4
  },

  // ============================================================
  // API KEY
  // ============================================================

  apiKeyId: {
    type: String,
    ref: 'ApiKey',
    required: true
  },

  // ============================================================
  // SUBSCRIPTION
  // ============================================================
  //
  // This identifies which subscription period the request
  // belongs to.
  //
  // This is important when a subscription renews.
  //
  // ============================================================

  subscriptionId: {
    type: String,
    ref: 'Subscription',
    required: true
  },

  // ============================================================
  // API
  // ============================================================

  apiId: {
    type: String,
    ref: 'Api',
    required: true
  },

  timestamp: {
    type: Date,
    default: Date.now
  },

  endpoint: {
    type: String,
    required: true
  },

  responseTime: {
    type: Number
  },

  statusCode: {
    type: Number
  }

});

// ============================================================
// INDEXES
// ============================================================
//
// Most usage queries will be:
//
// subscription + API + timestamp
//
// or:
//
// API key + timestamp
//
// ============================================================

ApiUsageSchema.index({
  subscriptionId: 1,
  apiId: 1,
  timestamp: 1
});

ApiUsageSchema.index({
  apiKeyId: 1,
  timestamp: 1
});

module.exports = mongoose.model('ApiUsage', ApiUsageSchema);