// market/greeting/greeting.routes.js

const express = require('express');

const greetingController = require('./greeting.controller');

const router = express.Router();

router.get('/', greetingController.getGreeting);

module.exports = router;