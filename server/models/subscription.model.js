// models/Subscription.js

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const SubscriptionSchema =
  new mongoose.Schema({

    // ============================================================
    // IDENTIFIER
    // ============================================================

    _id: {
      type: String,
      default: uuidv4
    },

    // ============================================================
    // USER
    // ============================================================

    userId: {
      type: String,
      ref: 'User',
      required: true,
      index: true
    },

    // ============================================================
    // PACKAGE
    // ============================================================

    packageId: {
      type: String,
      ref: 'Package',
      required: true,
      index: true
    },

    // ============================================================
    // STATUS
    // ============================================================

    status: {
      type: String,

      required: true,

      enum: [
        'pending',
        'active',
        'canceled',
        'expired',
        'past_due'
      ],

      default: 'pending',

      index: true
    },

    // ============================================================
    // SUBSCRIPTION PERIOD
    // ============================================================
    //
    // These dates define the actual quota period.
    //
    // Example:
    //
    // currentPeriodStart:
    // August 25
    //
    // currentPeriodEnd:
    // September 25
    //
    // Usage for this subscription must be counted only
    // between these dates.
    //
    // ============================================================

    currentPeriodStart: {
      type: Date,
      default: null
    },

    currentPeriodEnd: {
      type: Date,
      default: null
    },

    // ============================================================
    // PAYMENT DETAILS
    // ============================================================

    paymentDetails: {
      type: Object,
      default: null
    },

    // ============================================================
    // TIMESTAMPS
    // ============================================================

    createdAt: {
      type: Date,
      default: Date.now
    },

    updatedAt: {
      type: Date,
      default: Date.now
    }

  });


// ============================================================
// INDEXES
// ============================================================
//
// Used heavily by the API Gateway when finding an active
// subscription for a user.
//
// ============================================================

SubscriptionSchema.index({
  userId: 1,
  status: 1
});


// Used when checking a particular package subscription.

SubscriptionSchema.index({
  userId: 1,
  packageId: 1,
  status: 1
});


// Useful for subscription-period queries.

SubscriptionSchema.index({
  status: 1,
  currentPeriodEnd: 1
});


// ============================================================
// AUTOMATIC UPDATED TIMESTAMP
// ============================================================

SubscriptionSchema.pre(
  'save',
  function (next) {

    this.updatedAt = new Date();

    next();

  }
);


module.exports =
  mongoose.model(
    'Subscription',
    SubscriptionSchema
  );