// middleware/apigateway.middleware.js

const Api = require('../models/api.model');
const Subscription = require('../models/subscription.model');
const ApiKey = require('../models/apikey.model');

const {
  apiRateLimiter
} = require('./ratelimiter.middleware');

const usageController =
  require('../controllers/usuage.controller');


// ============================================================
// API GATEWAY
// ============================================================

const apiGateway = async (req, res, next) => {

  const startTime = Date.now();

  try {

    // ========================================================
    // 1. IDENTIFY REQUESTED API
    // ========================================================

    const requestedEndpoint = req.baseUrl;

    const api = await Api.findOne({

      endpoint: requestedEndpoint,

      status: 'active'

    }).lean();


    if (!api) {

      return res.status(404).json({

        success: false,

        message:
          'API not found or inactive'

      });

    }


    // ========================================================
    // 2. GET API KEY
    // ========================================================

    const apiKey =
      req.header('X-API-Key');


    if (!apiKey) {

      return res.status(401).json({

        success: false,

        message:
          'API key is required'

      });

    }


    // ========================================================
    // 3. VALIDATE API KEY
    // ========================================================

    const apiKeyDoc =
      await ApiKey.findOne({

        key: apiKey,

        isActive: true

      }).lean();


    if (!apiKeyDoc) {

      return res.status(401).json({

        success: false,

        message:
          'Invalid or inactive API key'

      });

    }


    // ========================================================
    // 4. VERIFY API KEY BELONGS TO REQUESTED API
    // ========================================================

    if (
      apiKeyDoc.apiId.toString() !==
      api._id.toString()
    ) {

      return res.status(403).json({

        success: false,

        message:
          'API key does not have access to this API'

      });

    }


    // ========================================================
    // 5. FIND ACTIVE SUBSCRIPTION
    // ========================================================
    //
    // Instead of loading every active subscription and every
    // API inside every package, we find subscriptions belonging
    // to this user and then inspect only the packages that
    // could contain the requested API.
    //
    // ========================================================

    const subscriptions =
      await Subscription
        .find({

          userId: apiKeyDoc.userId,

          status: 'active',

          currentPeriodStart: {
            $lte: new Date()
          },

          currentPeriodEnd: {
            $gte: new Date()
          }

        })
        .populate('packageId')
        .lean();


    // ========================================================
    // 6. FIND SUBSCRIPTION THAT CONTAINS THIS API
    // ========================================================

    let matchingSubscription = null;

    let matchingPackage = null;


    for (
      const subscription
      of subscriptions
    ) {

      if (!subscription.packageId) {
        continue;
      }


      const packageApis =
        subscription.packageId.apis || [];


      const apiIncluded =
        packageApis.some(

          packageApi =>

            packageApi.toString() ===
            api._id.toString()

        );


      if (apiIncluded) {

        matchingSubscription =
          subscription;

        matchingPackage =
          subscription.packageId;

        break;

      }

    }


    // ========================================================
    // 7. VERIFY SUBSCRIPTION ACCESS
    // ========================================================

    if (
      !matchingSubscription ||
      !matchingPackage
    ) {

      return res.status(403).json({

        success: false,

        message:
          'You do not have an active subscription for this API'

      });

    }


    // ========================================================
    // 8. DETERMINE RATE LIMIT CONFIGURATION
    // ========================================================
    //
    // Package configuration takes priority.
    //
    // If a package does not define a value, the API's
    // default configuration is used.
    //
    // Example:
    //
    // Package:
    //
    // capacity = 20
    // refillRate = 5
    // leakRate = 5
    //
    // These override the API defaults.
    //
    // ========================================================

    const packageRateLimit =
      matchingPackage.rateLimit || {};


    const apiRateLimit =
      api.rateLimit || {};


    const rateLimit = {

      capacity:
        packageRateLimit.capacity ??
        apiRateLimit.capacity ??
        10,

      refillRate:
        packageRateLimit.refillRate ??
        apiRateLimit.refillRate ??
        2,

      leakRate:
        packageRateLimit.leakRate ??
        apiRateLimit.leakRate ??
        2

    };


    // ========================================================
    // 9. DETERMINE MONTHLY QUOTA
    // ========================================================
    //
    // Package-specific quota takes priority.
    //
    // Otherwise the API's usageLimit is used.
    //
    // ========================================================

    const monthlyRequestLimit =
      matchingPackage.monthlyRequestLimit ??
      api.usageLimit;


    // ========================================================
    // 10. STORE GATEWAY CONTEXT
    // ========================================================
    //
    // Everything downstream now has the information it needs.
    //
    // ========================================================

    req.apiKeyInfo = {

      apiKeyId:
        apiKeyDoc._id,

      apiId:
        api._id,

      userId:
        apiKeyDoc.userId,

      subscriptionId:
        matchingSubscription._id,

      packageId:
        matchingPackage._id,

      endpoint:
        req.originalUrl,

      // Rate limiting configuration

      rateLimit,

      // Monthly quota

      monthlyRequestLimit,

      // Subscription period

      subscriptionPeriodStart:
        matchingSubscription.currentPeriodStart,

      subscriptionPeriodEnd:
        matchingSubscription.currentPeriodEnd

    };


    // ========================================================
    // 11. APPLY RATE LIMITER
    // ========================================================

    apiRateLimiter(
      req,
      res,
      async (err) => {

        if (err) {

          return next(err);

        }


        // ====================================================
        // 12. TRACK USAGE WHEN RESPONSE FINISHES
        // ====================================================

        const originalEnd =
          res.end;


        res.end =
          function (...args) {

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


            originalEnd.apply(
              this,
              args
            );

          };


        // ====================================================
        // 13. CONTINUE TO ACTUAL API
        // ====================================================

        next();

      }

    );


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


// ============================================================
// EXPORT
// ============================================================

module.exports =
  apiGateway;