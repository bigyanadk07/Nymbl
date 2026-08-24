// models/Subscription.js

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');


const SubscriptionSchema =
  new mongoose.Schema({

    _id: {
      type: String,
      default: uuidv4
    },


    userId: {
      type: String,
      ref: 'User',
      required: true,
      index: true
    },


    packageId: {
      type: String,
      ref: 'Package',
      required: true,
      index: true
    },


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


    currentPeriodStart: {
      type: Date,
      default: null
    },


    currentPeriodEnd: {
      type: Date,
      default: null
    },


    paymentDetails: {
      type: Object,
      default: null
    },


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
// Compound index
// ============================================================
//
// Makes looking up a user's subscription to a package faster.
//

SubscriptionSchema.index({
  userId: 1,
  packageId: 1,
  status: 1
});


// ============================================================
// Automatically update updatedAt
// ============================================================

SubscriptionSchema.pre(
  'save',
  function (next) {

    this.updatedAt =
      new Date();

    next();

  }
);


module.exports =
  mongoose.model(
    'Subscription',
    SubscriptionSchema
  );