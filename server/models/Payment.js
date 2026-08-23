// models/Payment.js

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');


const PaymentSchema =
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


    subscriptionId: {
      type: String,
      ref: 'Subscription',
      required: true,
      index: true
    },


    packageId: {
      type: String,
      ref: 'Package',
      required: true,
      index: true
    },


    provider: {
      type: String,

      enum: [
        'esewa',
        'khalti',
        'stripe'
      ],

      required: true,

      index: true
    },


    transactionUuid: {
      type: String,
      required: true,
      unique: true,
      index: true
    },


    transactionCode: {
      type: String,
      default: null
    },


    amount: {
      type: Number,
      required: true
    },


    currency: {
      type: String,
      default: 'NPR'
    },


    status: {
      type: String,

      enum: [
        'pending',
        'success',
        'failed',
        'refunded'
      ],

      default: 'pending',

      index: true
    },


    paidAt: {
      type: Date,
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
// Automatically update updatedAt
// ============================================================

PaymentSchema.pre(
  'save',
  function (next) {

    this.updatedAt =
      new Date();

    next();

  }
);


module.exports =
  mongoose.model(
    'Payment',
    PaymentSchema
  );