// middleware/ratelimiter.middleware.js

const rateLimit = require('express-rate-limit');

const ApiUsage = require('../models/apiusuage.model');


// ============================================================
// API USAGE / QUOTA CHECK
// ============================================================

const apiRateLimiter = async (req, res, next) => {

  try {

    if (!req.apiKeyInfo) {

      return res.status(500).json({

        success: false,

        message:
          'API Gateway context is missing'

      });

    }


    const {
      apiKeyId
    } = req.apiKeyInfo;


    // --------------------------------------------------------
    // Current month
    // --------------------------------------------------------

    const startOfMonth = new Date();

    startOfMonth.setDate(1);

    startOfMonth.setHours(
      0,
      0,
      0,
      0
    );


    // --------------------------------------------------------
    // Get API usage
    // --------------------------------------------------------

    const usage =
      await ApiUsage.countDocuments({

        apiKeyId,

        timestamp: {
          $gte: startOfMonth
        }

      });


    // --------------------------------------------------------
    // API monthly limit
    //
    // For the first implementation we use the API's
    // usageLimit field.
    //
    // Later we will move package-specific limits here.
    // --------------------------------------------------------

    const Api =
      require('../models/api.model');

    const api =
      await Api.findById(
        req.apiKeyInfo.apiId
      );


    if (!api) {

      return res.status(404).json({

        success: false,

        message: 'API not found'

      });

    }


    if (usage >= api.usageLimit) {

      return res.status(429).json({

        success: false,

        message:
          'API monthly usage limit exceeded'

      });

    }


    next();

  } catch (error) {

    console.error(
      'API usage limiter error:',
      error
    );


    return res.status(500).json({

      success: false,

      message:
        'Server error while checking API usage'

    });

  }

};


// ============================================================
// GENERAL PUBLIC RATE LIMITER
// ============================================================

const publicRateLimiter = rateLimit({

  windowMs: 15 * 60 * 1000,

  max: 100,

  message: {

    success: false,

    message:
      'Too many requests from this IP, please try again later'

  }

});


module.exports = {

  apiRateLimiter,

  publicRateLimiter

};