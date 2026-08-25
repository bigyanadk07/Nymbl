// market/password-analyzer/password-analyzer.controller.js

const passwordAnalyzerService = require('./password.service');

const MAX_PASSWORD_LENGTH = 256;

const analyze = async (req, res, next) => {
  try {

    const { password } = req.body;


    // ----------------------------------------------------------
    // Validate presence
    // ----------------------------------------------------------

    if (password === undefined || password === null) {

      return res.status(400).json({
        success: false,
        message: 'The "password" field is required'
      });

    }


    // ----------------------------------------------------------
    // Validate type
    // ----------------------------------------------------------

    if (typeof password !== 'string') {

      return res.status(400).json({
        success: false,
        message: 'The "password" field must be a string'
      });

    }


    // ----------------------------------------------------------
    // Validate non-empty
    // ----------------------------------------------------------

    if (password.length === 0) {

      return res.status(400).json({
        success: false,
        message: 'The "password" field must not be empty'
      });

    }


    // ----------------------------------------------------------
    // Guard against unreasonably long input
    // ----------------------------------------------------------

    if (password.length > MAX_PASSWORD_LENGTH) {

      return res.status(400).json({
        success: false,
        message: `The "password" field must not exceed ${MAX_PASSWORD_LENGTH} characters`
      });

    }


    // ----------------------------------------------------------
    // IMPORTANT: never log or persist the raw password.
    // Only the derived analysis below leaves this function.
    // ----------------------------------------------------------

    const data = passwordAnalyzerService.analyzePassword(password);

    return res.status(200).json({
      success: true,
      data
    });

  } catch (error) {

    // Do not let the raw password leak into error logs/traces.
    next(new Error('Failed to analyze password'));

  }
};

module.exports = {
  analyze
};