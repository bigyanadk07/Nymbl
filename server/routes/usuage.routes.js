// routes/usage.js
const express = require('express');
const router = express.Router();
const usageController = require('../controllers/usuage.controller');
const auth = require('../middleware/auth.middleware');

// GET /usage/stats - Get usage statistics
router.get('/stats', auth, usageController.getUsageStats);

// GET /usage/overview - Per-API usage + 30-day daily series
router.get('/overview', auth, usageController.getUsageOverview);

module.exports = router;