// market/url-analyzer/url-analyzer.routes.js

const express = require('express');

const urlAnalyzerController = require('./url.controller');

const router = express.Router();

router.post('/', urlAnalyzerController.analyze);

module.exports = router;