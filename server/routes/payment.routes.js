// routes/payment.routes.js

const express = require('express');

const router = express.Router();

const {
  initiateEsewaPayment,
  handleEsewaSuccess,
  handleEsewaFailure
} = require('../controllers/payment.controller');

const authMiddleware = require('../middleware/auth.middleware');


// Initiate eSewa payment
router.post(
  '/esewa/initiate',
  authMiddleware,
  initiateEsewaPayment
);


// eSewa success callback
router.get(
  '/esewa/success',
  handleEsewaSuccess
);


// eSewa failure callback
router.get(
  '/esewa/failure',
  handleEsewaFailure
);


module.exports = router;