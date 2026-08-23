// routes/packages.js

const express = require('express');

const router = express.Router();

const packageController =
  require('../controllers/packageController');

const auth =
  require('../middleware/auth');

const {
  publicRateLimiter
} = require('../middleware/rateLimiter');


// ============================================================
// PUBLIC PACKAGE ROUTES
// ============================================================


// GET /packages
//
// Get all available packages.
//

router.get(
  '/',
  publicRateLimiter,
  packageController.getAllPackages
);


// ============================================================
// PACKAGE DETAILS
// ============================================================


// GET /packages/:id
//
// Get package details.
//
// Authentication is required because the response
// includes the logged-in user's subscription status.
//

router.get(
  '/:id',
  auth,
  publicRateLimiter,
  packageController.getPackageById
);


module.exports = router;