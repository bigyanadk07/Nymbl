// market/text-analyzer/text-analyzer.routes.js

const express = require('express');

const textAnalyzerController = require('./analyser.controller');

const router = express.Router();

router.post('/', textAnalyzerController.analyze);

module.exports = router;