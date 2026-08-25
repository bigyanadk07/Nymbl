// middleware/apigateway.middleware.js

const Api = require('../models/api.model');
const Subscription = require('../models/subscription.model');
const Package = require('../models/package.model');
const ApiKey = require('../models/apikey.model');

const {
  apiRateLimiter
} = require('./ratelimiter.middleware');

const usageController = require('../controllers/usuage.controller');


// ============================================================
// API GATEWAY
// ============================================================

const apiGateway = async (req, res, next) => {

  const startTime = Date.now();

  try {

    // --------------------------------------------------------
    // 1. Identify requested API
    // --------------------------------------------------------

    const requestedEndpoint = req.baseUrl;

    const api = await Api.findOne({
      endpoint: requestedEndpoint,
      status: 'active'
    });

    if (!api) {

      return res.status(404).json({
        success: false,
        message: 'API not found or inactive'
      });

    }


    // --------------------------------------------------------
    // 2. Get API key
    // --------------------------------------------------------

    const apiKey = req.header('X-API-Key');

    if (!apiKey) {

      return res.status(401).json({
        success: false,
        message: 'API key is required'
      });

    }


    // --------------------------------------------------------
    // 3. Validate API key
    // --------------------------------------------------------

    const apiKeyDoc = await ApiKey.findOne({
      key: apiKey,
      isActive: true
    });

    if (!apiKeyDoc) {

      return res.status(401).json({
        success: false,
        message: 'Invalid or inactive API key'
      });

    }


    // --------------------------------------------------------
    // 4. Verify API key belongs to requested API
    // --------------------------------------------------------

    if (
      apiKeyDoc.apiId.toString() !==
      api._id.toString()
    ) {

      return res.status(403).json({
        success: false,
        message: 'API key does not have access to this API'
      });

    }


    // --------------------------------------------------------
    // 5. Verify active subscription
    // --------------------------------------------------------

    const subscriptions = await Subscription.find({
      userId: apiKeyDoc.userId,
      status: 'active'
    }).populate({
      path: 'packageId',
      populate: {
        path: 'apis'
      }
    });


    // --------------------------------------------------------
    // 6. Check whether subscription contains API
    // --------------------------------------------------------

    let hasAccess = false;

    for (const subscription of subscriptions) {

      if (!subscription.packageId) {
        continue;
      }

      const packageApis =
        subscription.packageId.apis || [];

      const apiIncluded = packageApis.some(
        packageApi =>
          packageApi._id.toString() ===
          api._id.toString()
      );

      if (apiIncluded) {

        hasAccess = true;

        break;

      }

    }


    if (!hasAccess) {

      return res.status(403).json({
        success: false,
        message:
          'You do not have an active subscription for this API'
      });

    }


    // --------------------------------------------------------
    // 7. Store request information
    // --------------------------------------------------------

    req.apiKeyInfo = {

      apiKeyId: apiKeyDoc._id,

      apiId: api._id,

      userId: apiKeyDoc.userId,

      endpoint: req.originalUrl

    };


    // --------------------------------------------------------
    // 8. Apply API rate limiting / usage quota
    // --------------------------------------------------------

    apiRateLimiter(req, res, async (err) => {

      if (err) {

        return next(err);

      }


      // ------------------------------------------------------
      // 9. Track usage when response finishes
      // ------------------------------------------------------

      const originalEnd = res.end;


      res.end = function (...args) {

        const responseTime =
          Date.now() - startTime;


        usageController
          .trackApiUsage(
            req.apiKeyInfo,
            responseTime,
            res.statusCode
          )
          .catch(error => {

            console.error(
              'Error tracking API usage:',
              error
            );

          });


        originalEnd.apply(this, args);

      };


      // ------------------------------------------------------
      // 10. Continue to actual API
      // ------------------------------------------------------

      next();

    });


  } catch (error) {

    console.error(
      'API Gateway error:',
      error
    );


    return res.status(500).json({

      success: false,

      message:
        'Internal server error in API Gateway'

    });

  }

};


module.exports = apiGateway;