// market/arsenal/arsenal.routes.js

const express = require('express');

const arsenalController = require('./arsenal.controller');

const router = express.Router();

router.get('/', arsenalController.getArsenalStatus);

module.exports = router;