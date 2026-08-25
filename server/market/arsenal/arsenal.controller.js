// market/arsenal/arsenal.controller.js

const arsenalService = require('./arsenal.service');

const getArsenalStatus = async (req, res, next) => {
  try {
    const data = arsenalService.getArsenalStatus();

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getArsenalStatus
};