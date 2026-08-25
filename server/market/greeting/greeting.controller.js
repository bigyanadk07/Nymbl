// market/greeting/greeting.controller.js

const greetingService = require('./greering.service');

const getGreeting = async (req, res, next) => {
  try {
    const data = greetingService.getGreeting();

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGreeting
};