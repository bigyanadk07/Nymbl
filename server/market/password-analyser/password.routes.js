// market/password-analyzer/password-analyzer.routes.js

const express = require('express');

const passwordAnalyzerController = require('./password.controller');

const router = express.Router();

router.post('/', passwordAnalyzerController.analyze);

module.exports = router;