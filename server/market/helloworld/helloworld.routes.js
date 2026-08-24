// market/hello-world/hello-world.routes.js

const express = require('express');

const helloWorldController = require('./helloworld.controller');

const router = express.Router();

router.get('/', helloWorldController.getHelloWorld);

module.exports = router;