const express = require('express');

const router = express.Router();

const {
  createSubscription,
  getMySubscriptions
} = require('../controllers/subscriptionController');

const authMiddleware = require('../middleware/auth');


// Subscribe to a package
router.post(
  '/',
  authMiddleware,
  createSubscription
);


// Get logged-in user's subscriptions
router.get(
  '/my',
  authMiddleware,
  getMySubscriptions
);


module.exports = router;