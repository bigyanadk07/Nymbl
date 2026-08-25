// routes/apis.js
const express = require('express');
const router = express.Router();
const apiController = require('../controllers/api.controller');
const auth = require('../middleware/auth.middleware');
const { publicRateLimiter } = require('../middleware/ratelimiter.middleware');

// GET /apis - Get all APIs
router.get('/', publicRateLimiter, apiController.getAllApis);

// GET /apis/accessible - Get APIs available to the logged-in user
router.get('/accessible', auth, apiController.getAccessibleApis);

// GET /apis/keys - Get user's existing API keys
router.get('/keys', auth, apiController.getUserApiKeys);

// GET /apis/:id - Get API by ID
router.get('/:id', publicRateLimiter, apiController.getApiById);

// POST /apis/keys - Generate API key
router.post('/keys', auth, apiController.generateApiKey);

// DELETE /apis/keys/:keyId - Revoke API key
router.delete('/keys/:keyId', auth, apiController.revokeApiKey);

module.exports = router;