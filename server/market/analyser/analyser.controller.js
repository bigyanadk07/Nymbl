// market/text-analyzer/text-analyzer.controller.js

const textAnalyzerService = require('./analyser.service');

const analyze = async (req, res, next) => {
  try {

    const { text } = req.body;


    // ----------------------------------------------------------
    // Validate presence
    // ----------------------------------------------------------

    if (text === undefined || text === null) {

      return res.status(400).json({
        success: false,
        message: 'The "text" field is required'
      });

    }


    // ----------------------------------------------------------
    // Validate type
    // ----------------------------------------------------------

    if (typeof text !== 'string') {

      return res.status(400).json({
        success: false,
        message: 'The "text" field must be a string'
      });

    }


    // ----------------------------------------------------------
    // Validate non-empty
    // ----------------------------------------------------------

    if (text.trim().length === 0) {

      return res.status(400).json({
        success: false,
        message: 'The "text" field must not be empty'
      });

    }


    const data = textAnalyzerService.analyzeText(text);

    return res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyze
};