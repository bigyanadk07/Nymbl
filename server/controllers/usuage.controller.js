// controllers/usageController.js

const ApiUsage = require('../models/apiusuage.model');
const ApiKey = require('../models/apikey.model');
const Api = require('../models/api.model');


// ============================================================
// TRACK API USAGE
// ============================================================
//
// Called by the API Gateway when a response finishes.
//
// Stores:
//
// - apiKeyId
// - apiId
// - subscriptionId
// - endpoint
// - responseTime
// - statusCode
//
// ============================================================

exports.trackApiUsage = async (
  apiKeyInfo,
  responseTime,
  statusCode
) => {

  try {

    console.log(
      '[USAGE TRACKING] apiKeyInfo:',
      apiKeyInfo
    );

    console.log(
      '[USAGE TRACKING] responseTime:',
      responseTime,
      'statusCode:',
      statusCode
    );


    // --------------------------------------------------------
    // Extract required information
    // --------------------------------------------------------

    const {
      apiKeyId,
      apiId,
      subscriptionId,
      endpoint
    } = apiKeyInfo;


    // --------------------------------------------------------
    // Validate gateway context
    // --------------------------------------------------------

    if (!apiKeyId) {

      console.error(
        '[USAGE TRACKING] Missing apiKeyId'
      );

      return false;

    }


    if (!apiId) {

      console.error(
        '[USAGE TRACKING] Missing apiId'
      );

      return false;

    }


    if (!subscriptionId) {

      console.error(
        '[USAGE TRACKING] Missing subscriptionId'
      );

      return false;

    }


    if (!endpoint) {

      console.error(
        '[USAGE TRACKING] Missing endpoint'
      );

      return false;

    }


    // --------------------------------------------------------
    // Create usage record
    // --------------------------------------------------------

    const apiUsage =
      new ApiUsage({

        apiKeyId,

        apiId,

        subscriptionId,

        endpoint,

        responseTime,

        statusCode

      });


    // --------------------------------------------------------
    // Save usage record
    // --------------------------------------------------------

    await apiUsage.save();


    console.log(
      '[USAGE TRACKING] Usage recorded successfully:',
      apiUsage._id
    );


    return true;


  } catch (err) {

    console.error(
      '[USAGE TRACKING] Error:',
      err
    );

    return false;

  }

};



// ============================================================
// GET USAGE STATISTICS
// ============================================================
//
// GET /usage/stats
//
// Query parameters:
//
// ?apiId=<API_ID>
// &from=<DATE>
// &to=<DATE>
//
// Example:
//
// /usage/stats?from=2026-08-01&to=2026-08-31
//
// ============================================================

exports.getUsageStats = async (
  req,
  res
) => {

  try {

    const {
      apiId,
      from,
      to
    } = req.query;


    // ========================================================
    // VALIDATE DATES
    // ========================================================

    if (!from || !to) {

      return res.status(400).json({

        success: false,

        message:
          'From and to dates are required'

      });

    }


    const fromDate =
      new Date(from);

    const toDate =
      new Date(to);


    if (
      isNaN(fromDate.getTime()) ||
      isNaN(toDate.getTime())
    ) {

      return res.status(400).json({

        success: false,

        message:
          'Invalid date format'

      });

    }


    // --------------------------------------------------------
    // Make the end date inclusive
    // --------------------------------------------------------

    toDate.setHours(
      23,
      59,
      59,
      999
    );


    // ========================================================
    // FIND USER'S API KEYS
    // ========================================================

    const apiKeyQuery = {

      userId:
        req.user._id

    };


    if (apiId) {

      apiKeyQuery.apiId =
        apiId;

    }


    const apiKeys =
      await ApiKey
        .find(apiKeyQuery)
        .select('_id apiId isActive')
        .lean();


    const apiKeyIds =
      apiKeys.map(
        key => key._id
      );


    // ========================================================
    // ACTIVE API TOKEN COUNT
    // ========================================================
    //
    // This is based on the user's API keys.
    //
    // If apiId is supplied, only tokens belonging to that API
    // are counted.
    //
    // ========================================================

    const activeTokens =
      apiKeys.filter(
        key =>
          key.isActive === true
      ).length;


    // ========================================================
    // NO API KEYS
    // ========================================================

    if (apiKeyIds.length === 0) {

      return res.json({

        success: true,

        total: 0,

        limit: 0,

        remaining: 0,

        successful: 0,

        failed: 0,

        successRate: 0,

        errorRate: 0,

        averageResponseTime: 0,

        activeTokens: 0,

        today: 0,

        breakdown: [],

        period: {

          from: fromDate,

          to: toDate

        }

      });

    }


    // ========================================================
    // BUILD USAGE QUERY
    // ========================================================

    const usageQuery = {

      apiKeyId: {

        $in: apiKeyIds

      },

      timestamp: {

        $gte: fromDate,

        $lte: toDate

      }

    };


    // --------------------------------------------------------
    // If a specific API was requested, filter by API as well.
    // --------------------------------------------------------

    if (apiId) {

      usageQuery.apiId =
        apiId;

    }


    // ========================================================
    // TOTAL USAGE
    // ========================================================

    const total =
      await ApiUsage.countDocuments(
        usageQuery
      );


    // ========================================================
    // PERFORMANCE STATISTICS
    // ========================================================
    //
    // We calculate:
    //
    // - successful requests
    // - failed requests
    // - average response time
    //
    // Successful = HTTP 200-299
    // Failed = everything outside 200-299
    //
    // ========================================================

    const performanceStats =
      await ApiUsage.aggregate([

        {
          $match:
            usageQuery
        },

        {
          $group: {

            _id: null,

            successful: {

              $sum: {

                $cond: [

                  {
                    $and: [

                      {
                        $gte: [
                          '$statusCode',
                          200
                        ]
                      },

                      {
                        $lt: [
                          '$statusCode',
                          300
                        ]
                      }

                    ]

                  },

                  1,

                  0

                ]

              }

            },

            failed: {

              $sum: {

                $cond: [

                  {
                    $or: [

                      {
                        $lt: [
                          '$statusCode',
                          200
                        ]
                      },

                      {
                        $gte: [
                          '$statusCode',
                          300
                        ]
                      },

                      {
                        $eq: [
                          '$statusCode',
                          null
                        ]
                      }

                    ]

                  },

                  1,

                  0

                ]

              }

            },

            averageResponseTime: {

              $avg:
                '$responseTime'

            }

          }

        }

      ]);


    const performance =
      performanceStats[0] || {};


    const successful =
      performance.successful || 0;


    const failed =
      performance.failed || 0;


    const averageResponseTime =
      performance.averageResponseTime || 0;


    // ========================================================
    // SUCCESS / ERROR RATES
    // ========================================================

    const successRate =
      total > 0
        ? Number(
            (
              (successful / total) *
              100
            ).toFixed(2)
          )
        : 0;


    const errorRate =
      total > 0
        ? Number(
            (
              (failed / total) *
              100
            ).toFixed(2)
          )
        : 0;


    // ========================================================
    // DAILY BREAKDOWN
    // ========================================================

    const breakdown =
      await ApiUsage.aggregate([

        {
          $match:
            usageQuery
        },

        {
          $group: {

            _id: {

              $dateToString: {

                format:
                  '%Y-%m-%d',

                date:
                  '$timestamp'

              }

            },

            count: {

              $sum: 1

            }

          }

        },

        {
          $sort: {

            _id: 1

          }

        }

      ]);


    const formattedBreakdown =
      breakdown.map(
        item => ({

          date:
            item._id,

          count:
            item.count

        })
      );


    // ========================================================
    // TODAY'S USAGE
    // ========================================================

    const now =
      new Date();


    const todayStart =
      new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );


    const tomorrowStart =
      new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
      );


    const todayQuery = {

      ...usageQuery,

      timestamp: {

        $gte:
          todayStart,

        $lt:
          tomorrowStart

      }

    };


    const today =
      await ApiUsage.countDocuments(
        todayQuery
      );


    // ========================================================
    // DETERMINE USAGE LIMIT
    // ========================================================

    let limit = 0;


    if (apiId) {

      // ------------------------------------------------------
      // Specific API
      // ------------------------------------------------------

      const api =
        await Api
          .findById(apiId)
          .select('usageLimit')
          .lean();


      limit =
        api
          ? api.usageLimit || 0
          : 0;

    } else {

      // ------------------------------------------------------
      // All APIs
      // ------------------------------------------------------

      const apiIds =
        apiKeys.map(
          key => key.apiId
        );


      const apis =
        await Api
          .find({
            _id: {

              $in:
                apiIds

            }
          })
          .select('usageLimit')
          .lean();


      limit =
        apis.reduce(

          (sum, api) =>
            sum +
            (api.usageLimit || 0),

          0

        );

    }


    // ========================================================
    // REMAINING
    // ========================================================

    const remaining =
      Math.max(
        limit - total,
        0
      );


    // ========================================================
    // RESPONSE
    // ========================================================

    return res.json({

      success: true,

      // ------------------------------------------------------
      // Usage
      // ------------------------------------------------------

      total,

      limit,

      remaining,

      today,

      // ------------------------------------------------------
      // Performance
      // ------------------------------------------------------

      successful,

      failed,

      successRate,

      errorRate,

      averageResponseTime:
        Number(
          averageResponseTime.toFixed(2)
        ),

      // ------------------------------------------------------
      // API keys
      // ------------------------------------------------------

      activeTokens,

      // ------------------------------------------------------
      // Daily breakdown
      // ------------------------------------------------------

      breakdown:
        formattedBreakdown,

      // ------------------------------------------------------
      // Period
      // ------------------------------------------------------

      period: {

        from:
          fromDate,

        to:
          toDate

      }

    });


  } catch (err) {

    console.error(
      'Get usage stats error:',
      err
    );


    return res.status(500).json({

      success: false,

      message:
        'Server error'

    });

  }

};