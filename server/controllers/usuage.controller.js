// controllers/usageController.js

const ApiUsage = require('../models/apiusuage.model');
const ApiKey = require('../models/apikey.model');
const Api = require('../models/api.model');
const Subscription = require('../models/subscription.model');
const Package = require('../models/package.model');

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



// ============================================================
// GET USAGE OVERVIEW
// ============================================================
//
// GET /usage/overview
//
// For every API the user can reach through an ACTIVE
// subscription, returns:
//
//   - the enforced monthly quota
//   - requests used inside the current subscription period
//   - remaining requests
//   - absolute AND percentage values for each
//   - a 30-day daily series (count + cumulative)
//   - a stable colour, so the chart line and the table
//     swatch can never disagree
//
// ============================================================

exports.getUsageOverview = async (req, res) => {

  try {

    const userId = req.user._id;

    const TIMEZONE = 'Asia/Kathmandu';
    const WINDOW_DAYS = 30;
    const DAY_MS = 24 * 60 * 60 * 1000;

    // Assigned server-side so the frontend never has to
    // reinvent the mapping.
    const COLOR_PALETTE = [
      '#2563eb', // blue
      '#16a34a', // green
      '#ea580c', // orange
      '#9333ea', // violet
      '#0891b2', // cyan
      '#dc2626', // red
      '#ca8a04', // amber
      '#db2777'  // pink
    ];

    // "YYYY-MM-DD" for a Date, evaluated in TIMEZONE.
    // en-CA produces exactly that shape, and it sorts
    // lexicographically, which the period checks rely on.
    const localDayKey = (date) =>
      new Intl.DateTimeFormat('en-CA', {
        timeZone: TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(date);

    const percentOf = (part, whole) =>
      whole > 0
        ? Math.round((part / whole) * 1000) / 10
        : 0;


    // ------------------------------------------------------------
    // 1. THE 30-DAY WINDOW
    // ------------------------------------------------------------

    const windowEnd = new Date();

    // One full day wider than the axis, so the oldest bucket
    // on the chart is always a complete day.
    const matchStart =
      new Date(windowEnd.getTime() - WINDOW_DAYS * DAY_MS);

    const dayKeys = [];
    const seenDays = new Set();

    for (let i = WINDOW_DAYS - 1; i >= 0; i -= 1) {

      const key = localDayKey(
        new Date(windowEnd.getTime() - i * DAY_MS)
      );

      if (!seenDays.has(key)) {
        seenDays.add(key);
        dayKeys.push(key);
      }

    }


    // ------------------------------------------------------------
    // 2. ONE ENTRY PER SUBSCRIBED API
    // ------------------------------------------------------------

    const subscriptions = await Subscription.find({
      userId,
      status: 'active'
    }).populate({
      path: 'packageId',
      populate: { path: 'apis' }
    });

    const entries = new Map();

    subscriptions.forEach((subscription) => {

      const pkg = subscription.packageId;

      // Package deleted -> populate() returns null
      if (!pkg || !Array.isArray(pkg.apis)) {
        return;
      }

      const periodStart = subscription.currentPeriodStart
        ? new Date(subscription.currentPeriodStart)
        : null;

      const periodEnd = subscription.currentPeriodEnd
        ? new Date(subscription.currentPeriodEnd)
        : null;

      pkg.apis.forEach((api) => {

        if (!api) {
          return;
        }

        const apiId = api._id.toString();
        const existing = entries.get(apiId);

        // Same API reachable through two packages: keep the
        // subscription that runs longest, since that is the
        // one still granting access.
        if (existing) {

          const existingEnd = existing.periodEnd
            ? existing.periodEnd.getTime()
            : 0;

          const candidateEnd = periodEnd
            ? periodEnd.getTime()
            : 0;

          if (candidateEnd <= existingEnd) {
            return;
          }

        }

        entries.set(apiId, {

          apiId: api._id,
          apiName: api.name,
          category: api.category,
          endpoint: api.endpoint,

          packageId: pkg._id,
          packageName: pkg.name,
          subscriptionId: subscription._id,

          periodStart,
          periodEnd,

          // SAME precedence the gateway enforces, see
          // middleware/apigateway.middleware.js:
          //   matchingPackage.monthlyRequestLimit ?? api.usageLimit
          limit: pkg.monthlyRequestLimit ?? api.usageLimit ?? 0

        });

      });

    });

    // Sorted by name so the colour assignment is stable
    // across requests.
    const list = Array.from(entries.values()).sort(
      (a, b) => String(a.apiName).localeCompare(String(b.apiName))
    );

    const emptyWindow = {
      from: dayKeys[0],
      to: dayKeys[dayKeys.length - 1],
      days: dayKeys.length,
      dates: dayKeys
    };

    if (list.length === 0) {

      return res.json({
        success: true,
        timezone: TIMEZONE,
        window: emptyWindow,
        totals: {
          apiCount: 0,
          used: 0,
          limit: 0,
          remaining: 0,
          usedPercent: 0,
          remainingPercent: 0,
          successful: 0,
          failed: 0,
          successRate: 0
        },
        apis: []
      });

    }


    // ------------------------------------------------------------
    // 3. THE USER'S API KEYS, GROUPED BY API
    // ------------------------------------------------------------
    //
    // ApiUsage rows carry no userId, so the user's own keys are
    // how the aggregations get scoped to this user.
    //
    // Revoked keys are included on purpose: requests they
    // already made did consume quota.
    //
    // ------------------------------------------------------------

    const apiKeys = await ApiKey.find({ userId });

    const keyIdsByApi = new Map();
    const activeKeysByApi = new Map();

    apiKeys.forEach((apiKey) => {

      if (!apiKey.apiId) {
        return;
      }

      const apiId = apiKey.apiId.toString();

      if (!keyIdsByApi.has(apiId)) {
        keyIdsByApi.set(apiId, []);
      }

      keyIdsByApi.get(apiId).push(apiKey._id);

      if (apiKey.isActive) {
        activeKeysByApi.set(
          apiId,
          (activeKeysByApi.get(apiId) || 0) + 1
        );
      }

    });

    const allKeyIds = apiKeys.map((apiKey) => apiKey._id);
    const allApiIds = list.map((entry) => entry.apiId);

    const isSuccess = {
      $and: [
        { $gte: ['$statusCode', 200] },
        { $lt: ['$statusCode', 400] }
      ]
    };


    // ------------------------------------------------------------
    // 4a. DAILY SERIES (drives the chart)
    // ------------------------------------------------------------

    let dailyRows = [];

    if (allKeyIds.length > 0) {

      dailyRows = await ApiUsage.aggregate([
        {
          $match: {
            apiKeyId: { $in: allKeyIds },
            apiId: { $in: allApiIds },
            timestamp: {
              $gte: matchStart,
              $lte: windowEnd
            }
          }
        },
        {
          $group: {
            _id: {
              apiId: '$apiId',
              day: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$timestamp',
                  timezone: TIMEZONE
                }
              }
            },
            count: { $sum: 1 }
          }
        }
      ]);

    }

    const dailyMap = new Map();

    dailyRows.forEach((row) => {
      dailyMap.set(`${row._id.apiId}|${row._id.day}`, row.count);
    });


    // ------------------------------------------------------------
    // 4b. QUOTA CONSUMED (drives the tables)
    // ------------------------------------------------------------
    //
    // This number has to agree with the gateway, so it is
    // counted over each API's own SUBSCRIPTION PERIOD, not over
    // the 30-day chart window. Compare with the filter in
    // middleware/ratelimiter.middleware.js.
    //
    // ------------------------------------------------------------

    let quotaRows = [];

    if (allKeyIds.length > 0) {

      quotaRows = await ApiUsage.aggregate([
        {
          $match: {
            $or: list.map((entry) => ({
              apiId: entry.apiId,
              apiKeyId: {
                $in: keyIdsByApi.get(String(entry.apiId)) || []
              },
              timestamp: {
                $gte: entry.periodStart || new Date(0),
                $lte: entry.periodEnd || windowEnd
              }
            }))
          }
        },
        {
          $group: {
            _id: '$apiId',
            used: { $sum: 1 },
            successful: { $sum: { $cond: [isSuccess, 1, 0] } },
            failed: { $sum: { $cond: [isSuccess, 0, 1] } },
            responseTimeSum: {
              $sum: { $ifNull: ['$responseTime', 0] }
            }
          }
        }
      ]);

    }

    const quotaMap = new Map();

    quotaRows.forEach((row) => {
      quotaMap.set(String(row._id), row);
    });


    // ------------------------------------------------------------
    // 5. BUILD THE RESPONSE
    // ------------------------------------------------------------

    let totalUsed = 0;
    let totalLimit = 0;
    let totalSuccessful = 0;
    let totalFailed = 0;

    const apis = list.map((entry, index) => {

      const apiId = String(entry.apiId);
      const quota = quotaMap.get(apiId);

      const used = quota ? quota.used : 0;
      const successful = quota ? quota.successful : 0;
      const failed = quota ? quota.failed : 0;

      const limit = Number(entry.limit) || 0;
      const remaining = Math.max(limit - used, 0);

      const periodStartKey = entry.periodStart
        ? localDayKey(entry.periodStart)
        : null;

      const periodEndKey = entry.periodEnd
        ? localDayKey(entry.periodEnd)
        : null;

      // Days outside this API's own subscription period stay
      // null, so the chart draws a gap rather than a
      // misleading flat line at zero.
      let insideWindow = 0;

      const shaped = dayKeys.map((day) => {

        const inPeriod =
          (!periodStartKey || day >= periodStartKey) &&
          (!periodEndKey || day <= periodEndKey);

        if (!inPeriod) {
          return { date: day, count: null };
        }

        const count = dailyMap.get(`${apiId}|${day}`) || 0;
        insideWindow += count;

        return { date: day, count };

      });

      // If the period started before the chart window opened,
      // seed the running total so the final cumulative point
      // lands exactly on `used`. Chart and table then agree.
      let running = Math.max(used - insideWindow, 0);

      const daily = shaped.map((point) => {

        if (point.count === null) {
          return {
            date: point.date,
            count: null,
            cumulative: null
          };
        }

        running += point.count;

        return {
          date: point.date,
          count: point.count,
          cumulative: running
        };

      });

      totalUsed += used;
      totalLimit += limit;
      totalSuccessful += successful;
      totalFailed += failed;

      return {

        apiId: entry.apiId,
        apiName: entry.apiName,
        category: entry.category,
        endpoint: entry.endpoint,

        packageId: entry.packageId,
        packageName: entry.packageName,
        subscriptionId: entry.subscriptionId,

        periodStart: entry.periodStart,
        periodEnd: entry.periodEnd,

        limit,
        used,
        remaining,
        usedPercent: percentOf(used, limit),
        remainingPercent: percentOf(remaining, limit),

        successful,
        failed,
        successRate: percentOf(successful, used),

        averageResponseTime:
          quota && quota.used > 0
            ? Math.round(quota.responseTimeSum / quota.used)
            : 0,

        hasApiKey: (keyIdsByApi.get(apiId) || []).length > 0,
        activeKeyCount: activeKeysByApi.get(apiId) || 0,

        color: COLOR_PALETTE[index % COLOR_PALETTE.length],

        daily

      };

    });

    const totalRemaining = Math.max(totalLimit - totalUsed, 0);

    return res.json({

      success: true,
      timezone: TIMEZONE,
      window: emptyWindow,

      totals: {
        apiCount: apis.length,
        used: totalUsed,
        limit: totalLimit,
        remaining: totalRemaining,
        usedPercent: percentOf(totalUsed, totalLimit),
        remainingPercent: percentOf(totalRemaining, totalLimit),
        successful: totalSuccessful,
        failed: totalFailed,
        successRate: percentOf(totalSuccessful, totalUsed)
      },

      apis

    });

  } catch (err) {

    console.error('Get usage overview error:', err);

    return res.status(500).json({
      success: false,
      message: 'Server error'
    });

  }

};