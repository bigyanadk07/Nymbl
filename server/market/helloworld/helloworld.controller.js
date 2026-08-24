// market/hello-world/hello-world.controller.js

const helloWorldService = require('./helloworld.service');

const getHelloWorld = async (req, res, next) => {
  try {
    const data = helloWorldService.getHelloWorld();

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHelloWorld
};