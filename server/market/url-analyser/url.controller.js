// market/url-analyzer/url-analyzer.controller.js

const urlAnalyzerService = require('./url.service');

const ALLOWED_PROTOCOLS = ['http:', 'https:'];

const analyze = async (req, res, next) => {
  try {

    const { url } = req.body;


    // ----------------------------------------------------------
    // Validate presence
    // ----------------------------------------------------------

    if (url === undefined || url === null) {

      return res.status(400).json({
        success: false,
        message: 'The "url" field is required'
      });

    }


    // ----------------------------------------------------------
    // Validate type
    // ----------------------------------------------------------

    if (typeof url !== 'string') {

      return res.status(400).json({
        success: false,
        message: 'The "url" field must be a string'
      });

    }


    // ----------------------------------------------------------
    // Validate non-empty
    // ----------------------------------------------------------

    if (url.trim().length === 0) {

      return res.status(400).json({
        success: false,
        message: 'The "url" field must not be empty'
      });

    }


    // ----------------------------------------------------------
    // Validate it's a parseable, absolute URL
    // ----------------------------------------------------------

    let parsed;

    try {

      parsed = new URL(url);

    } catch (parseError) {

      return res.status(400).json({
        success: false,
        message: 'Invalid URL format'
      });

    }


    // ----------------------------------------------------------
    // Validate protocol is http or https
    // ----------------------------------------------------------

    if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {

      return res.status(400).json({
        success: false,
        message: 'URL protocol must be either "http" or "https"'
      });

    }


    const data = urlAnalyzerService.analyzeUrl(url);

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