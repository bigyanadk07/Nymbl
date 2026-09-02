// middleware/ratelimiter.middleware.js

const rateLimit = require('express-rate-limit');

const ApiUsage = require('../models/apiusuage.model');


// ============================================================
// IN-MEMORY BUCKET STORAGE
// ============================================================
//
// Each API key gets its own rate-limit state.
//
// This is suitable for the current MVP / single-server setup.
//
// Later, this should be moved to Redis so multiple server
// instances can share the same rate-limit state.
//
// ============================================================

const tokenBuckets = new Map();

const leakyBuckets = new Map();


// ============================================================
// HELPER: SET RATE LIMIT HEADERS
// ============================================================

const setRateLimitHeaders = (
  res,
  limit,
  remaining
) => {

  res.setHeader(
    'X-RateLimit-Limit',
    String(Math.max(0, Math.floor(limit)))
  );

  res.setHeader(
    'X-RateLimit-Remaining',
    String(
      Math.max(
        0,
        Math.floor(remaining)
      )
    )
  );

};


// ============================================================
// TOKEN BUCKET
// ============================================================
//
// The token bucket controls bursts.
//
// Example:
//
// capacity = 10
// refillRate = 2
//
// A newly created bucket starts with 10 tokens.
//
// The user can therefore make 10 requests immediately.
//
// After that, 2 tokens are added every second.
//
// ============================================================

const checkTokenBucket = (
  apiKeyId,
  capacity,
  refillRate
) => {

  const now = Date.now();


  let bucket =
    tokenBuckets.get(apiKeyId);


  // ----------------------------------------------------------
  // Create bucket
  // ----------------------------------------------------------

  if (!bucket) {

    bucket = {

      tokens: capacity,

      lastRefill: now,

      capacity,

      refillRate

    };

    tokenBuckets.set(
      apiKeyId,
      bucket
    );

  }


  // ----------------------------------------------------------
  // Handle configuration changes
  // ----------------------------------------------------------
  //
  // If the package/API rate-limit configuration changes while
  // the server is running, update the existing bucket.
  //
  // ----------------------------------------------------------

  if (
    bucket.capacity !== capacity ||
    bucket.refillRate !== refillRate
  ) {

    bucket.capacity = capacity;

    bucket.refillRate = refillRate;

    bucket.tokens =
      Math.min(
        bucket.tokens,
        capacity
      );

  }


  // ----------------------------------------------------------
  // Calculate elapsed time
  // ----------------------------------------------------------

  const elapsedSeconds =
    (now - bucket.lastRefill) / 1000;


  // ----------------------------------------------------------
  // Refill tokens
  // ----------------------------------------------------------

  if (
    elapsedSeconds > 0 &&
    refillRate > 0
  ) {

    const tokensToAdd =
      elapsedSeconds * refillRate;


    bucket.tokens =
      Math.min(

        capacity,

        bucket.tokens +
        tokensToAdd

      );


    bucket.lastRefill =
      now;

  }


  // ----------------------------------------------------------
  // Request rejected
  // ----------------------------------------------------------

  if (bucket.tokens < 1) {

    const secondsUntilToken =
      refillRate > 0

        ? (1 - bucket.tokens) /
          refillRate

        : Infinity;


    return {

      allowed: false,

      remaining:
        bucket.tokens,

      retryAfter:
        Number.isFinite(
          secondsUntilToken
        )
          ? Math.max(
              1,
              Math.ceil(
                secondsUntilToken
              )
            )
          : null

    };

  }


  // ----------------------------------------------------------
  // Consume token
  // ----------------------------------------------------------

  bucket.tokens -= 1;


  return {

    allowed: true,

    remaining:
      bucket.tokens,

    retryAfter: 0

  };

};


// ============================================================
// LEAKY BUCKET
// ============================================================
//
// The leaky bucket controls the sustained request flow.
//
// Example:
//
// capacity = 10
// leakRate = 2
//
// Up to 10 requests can exist in the bucket.
//
// The bucket drains at 2 requests/second.
//
// ============================================================

const checkLeakyBucket = (
  apiKeyId,
  capacity,
  leakRate
) => {

  const now = Date.now();


  let bucket =
    leakyBuckets.get(apiKeyId);


  // ----------------------------------------------------------
  // Create bucket
  // ----------------------------------------------------------

  if (!bucket) {

    bucket = {

      requests: [],

      lastLeak: now,

      capacity,

      leakRate

    };

    leakyBuckets.set(
      apiKeyId,
      bucket
    );

  }


  // ----------------------------------------------------------
  // Handle configuration changes
  // ----------------------------------------------------------

  if (
    bucket.capacity !== capacity ||
    bucket.leakRate !== leakRate
  ) {

    bucket.capacity =
      capacity;

    bucket.leakRate =
      leakRate;

    // If the new capacity is smaller than the current queue,
    // keep only the newest requests that fit.

    if (
      bucket.requests.length >
      capacity
    ) {

      bucket.requests =
        bucket.requests.slice(
          -capacity
        );

    }

  }


  // ----------------------------------------------------------
  // Calculate elapsed time
  // ----------------------------------------------------------

  const elapsedSeconds =
    (now - bucket.lastLeak) /
    1000;


  // ----------------------------------------------------------
  // Remove leaked requests
  // ----------------------------------------------------------

  if (
    elapsedSeconds > 0 &&
    leakRate > 0
  ) {

    const requestsToLeak =
      Math.floor(
        elapsedSeconds *
        leakRate
      );


    if (
      requestsToLeak > 0
    ) {

      bucket.requests.splice(
        0,
        requestsToLeak
      );


      bucket.lastLeak =
        now;

    }

  }


  // ----------------------------------------------------------
  // Current queue size
  // ----------------------------------------------------------

  const currentSize =
    bucket.requests.length;


  // ----------------------------------------------------------
  // Bucket full
  // ----------------------------------------------------------

  if (
    currentSize >=
    capacity
  ) {

    const secondsUntilSpace =
      leakRate > 0
        ? 1 / leakRate
        : Infinity;


    return {

      allowed: false,

      remaining: 0,

      retryAfter:
        Number.isFinite(
          secondsUntilSpace
        )
          ? Math.max(
              1,
              Math.ceil(
                secondsUntilSpace
              )
            )
          : null

    };

  }


  // ----------------------------------------------------------
  // Add request
  // ----------------------------------------------------------

  bucket.requests.push(
    now
  );


  return {

    allowed: true,

    remaining:
      capacity -
      bucket.requests.length,

    retryAfter: 0

  };

};


// ============================================================
// API RATE LIMITER
// ============================================================
//
// Performs:
//
// 1. Subscription-period quota check
// 2. Token bucket check
// 3. Leaky bucket check
//
// Only requests passing all checks reach the actual API.
//
// ============================================================

const apiRateLimiter = async (
  req,
  res,
  next
) => {

  try {

    // ========================================================
    // 1. VERIFY GATEWAY CONTEXT
    // ========================================================

    if (!req.apiKeyInfo) {

      return res.status(500).json({

        success: false,

        message:
          'API Gateway context is missing'

      });

    }


    const {

      apiKeyId,

      apiId,

      subscriptionId,

      monthlyRequestLimit,

      subscriptionPeriodStart,

      subscriptionPeriodEnd,

      rateLimit

    } = req.apiKeyInfo;


    // ========================================================
    // 2. VALIDATE RATE LIMIT CONFIGURATION
    // ========================================================

    const capacity =
      Number(
        rateLimit?.capacity
      );

    const refillRate =
      Number(
        rateLimit?.refillRate
      );

    const leakRate =
      Number(
        rateLimit?.leakRate
      );


    if (
      !Number.isFinite(capacity) ||
      capacity <= 0 ||
      !Number.isFinite(refillRate) ||
      refillRate <= 0 ||
      !Number.isFinite(leakRate) ||
      leakRate <= 0
    ) {

      return res.status(500).json({

        success: false,

        message:
          'Invalid API rate-limit configuration'

      });

    }


    // ========================================================
    // 3. VALIDATE SUBSCRIPTION PERIOD
    // ========================================================

    if (
      !subscriptionId ||
      !subscriptionPeriodStart ||
      !subscriptionPeriodEnd
    ) {

      return res.status(500).json({

        success: false,

        message:
          'Subscription period information is missing'

      });

    }


    const periodStart =
      new Date(
        subscriptionPeriodStart
      );

    const periodEnd =
      new Date(
        subscriptionPeriodEnd
      );


    if (
      isNaN(periodStart.getTime()) ||
      isNaN(periodEnd.getTime())
    ) {

      return res.status(500).json({

        success: false,

        message:
          'Invalid subscription period'

      });

    }


    const now =
      new Date();


    if (
      now < periodStart ||
      now > periodEnd
    ) {

      return res.status(403).json({

        success: false,

        message:
          'Subscription period is not active'

      });

    }


    // ========================================================
    // 4. MONTHLY / SUBSCRIPTION QUOTA
    // ========================================================
    //
    // IMPORTANT:
    //
    // We no longer count from the first day of the calendar
    // month.
    //
    // Instead, usage is counted only inside the current
    // subscription period.
    //
    // Example:
    //
    // Subscription:
    // Aug 25 → Sep 25
    //
    // Usage is counted:
    //
    // Aug 25 → Sep 25
    //
    // ========================================================

    const usage =
      await ApiUsage.countDocuments({

        apiKeyId,

        subscriptionId,

        apiId,

        timestamp: {

          $gte:
            periodStart,

          $lte:
            periodEnd

        }

      });


    const quota =
      Number(
        monthlyRequestLimit
      );


    // --------------------------------------------------------
    // Validate quota
    // --------------------------------------------------------

    if (
      !Number.isFinite(quota) ||
      quota < 0
    ) {

      return res.status(500).json({

        success: false,

        message:
          'Invalid API usage quota'

      });

    }


    // --------------------------------------------------------
    // Quota headers
    // --------------------------------------------------------

    const quotaRemaining =
      Math.max(
        0,
        quota - usage
      );


    res.setHeader(
      'X-Quota-Limit',
      String(quota)
    );

    res.setHeader(
      'X-Quota-Remaining',
      String(quotaRemaining)
    );


    // --------------------------------------------------------
    // Monthly quota exhausted
    // --------------------------------------------------------

    if (
      usage >= quota
    ) {

      return res.status(429).json({

        success: false,

        message:
          'API subscription-period usage limit exceeded',

        limit:
          quota,

        used:
          usage,

        remaining:
          0,

        period: {

          start:
            periodStart,

          end:
            periodEnd

        }

      });

    }


    // ========================================================
    // 5. TOKEN BUCKET
    // ========================================================

    const tokenResult =
      checkTokenBucket(

        apiKeyId,

        capacity,

        refillRate

      );


    // --------------------------------------------------------
    // Token bucket headers
    // --------------------------------------------------------

    setRateLimitHeaders(

      res,

      capacity,

      tokenResult.remaining

    );


    // --------------------------------------------------------
    // Token bucket rejected
    // --------------------------------------------------------

    if (
      !tokenResult.allowed
    ) {

      if (
        tokenResult.retryAfter !== null
      ) {

        res.setHeader(

          'Retry-After',

          String(
            tokenResult.retryAfter
          )

        );

      }


      return res.status(429).json({

        success: false,

        message:
          'Rate limit exceeded. Token bucket is empty.',

        retryAfter:
          tokenResult.retryAfter,

        limit:
          capacity,

        remaining:
          0

      });

    }


    // ========================================================
    // 6. LEAKY BUCKET
    // ========================================================

    const leakyResult =
      checkLeakyBucket(

        apiKeyId,

        capacity,

        leakRate

      );


    // --------------------------------------------------------
    // Use the stricter remaining value for the header
    // --------------------------------------------------------

    const remaining =
      Math.min(

        tokenResult.remaining,

        leakyResult.remaining

      );


    setRateLimitHeaders(

      res,

      capacity,

      remaining

    );


    // --------------------------------------------------------
    // Leaky bucket rejected
    // --------------------------------------------------------

    if (
      !leakyResult.allowed
    ) {

      if (
        leakyResult.retryAfter !== null
      ) {

        res.setHeader(

          'Retry-After',

          String(
            leakyResult.retryAfter
          )

        );

      }


      return res.status(429).json({

        success: false,

        message:
          'Rate limit exceeded. Leaky bucket is full.',

        retryAfter:
          leakyResult.retryAfter,

        limit:
          capacity,

        remaining:
          0

      });

    }


    // ========================================================
    // 7. ALL CHECKS PASSED
    // ========================================================

    next();

  } catch (error) {

    console.error(

      'API rate limiter error:',

      error

    );


    return res.status(500).json({

      success: false,

      message:
        'Server error while checking API rate limit'

    });

  }

};


// ============================================================
// GENERAL PUBLIC RATE LIMITER
// ============================================================
//
// This is separate from the marketplace API rate limiter.
//
// It protects general public application endpoints.
//
// ============================================================

const publicRateLimiter =
  rateLimit({

    windowMs:
      15 * 60 * 1000,

    max:
      100,

    message: {

      success: false,

      message:
        'Too many requests from this IP, please try again later'

    }

  });


// ============================================================
// CLEANUP
// ============================================================
//
// Remove inactive bucket state from memory.
//
// This prevents the Maps from growing forever.
//
// ============================================================

setInterval(

  () => {

    const now =
      Date.now();


    const BUCKET_TIMEOUT =
      30 * 60 * 1000;


    // --------------------------------------------------------
    // Token buckets
    // --------------------------------------------------------

    for (
      const [
        apiKeyId,
        bucket
      ]
      of tokenBuckets.entries()
    ) {

      if (
        now -
        bucket.lastRefill >
        BUCKET_TIMEOUT
      ) {

        tokenBuckets.delete(
          apiKeyId
        );

      }

    }


    // --------------------------------------------------------
    // Leaky buckets
    // --------------------------------------------------------

    for (
      const [
        apiKeyId,
        bucket
      ]
      of leakyBuckets.entries()
    ) {

      if (
        now -
        bucket.lastLeak >
        BUCKET_TIMEOUT
      ) {

        leakyBuckets.delete(
          apiKeyId
        );

      }

    }

  },

  10 * 60 * 1000

);


// ============================================================
// EXPORTS
// ============================================================

module.exports = {

  apiRateLimiter,

  publicRateLimiter

};