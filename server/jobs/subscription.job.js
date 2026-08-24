// jobs/subscriptionJob.js

const paymentService =
  require('../services/payment.service');


// ============================================================
// SUBSCRIPTION EXPIRATION JOB
// ============================================================
//
// This job is responsible for:
//
// active → expired
//
// It does NOT perform payment.
// It does NOT create subscriptions.
// It does NOT renew subscriptions.
//
// ============================================================

const runSubscriptionExpirationJob =
  async () => {

    try {

      console.log(
        'Checking for expired subscriptions...'
      );


      const result =
        await paymentService
          .expireSubscriptions();


      if (result.success) {

        console.log(

          `Subscription expiration check ` +
          `completed. ` +
          `${result.expiredCount} ` +
          `subscription(s) expired.`

        );

      } else {

        console.error(

          'Subscription expiration job failed:',
          result.error

        );

      }

    } catch (error) {

      console.error(

        'Subscription expiration job crashed:',
        error

      );

    }

  };


module.exports = {

  runSubscriptionExpirationJob

};