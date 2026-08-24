// services/paymentService.js

const Subscription =
  require('../models/subscription.model');


// ============================================================
// EXPIRE SUBSCRIPTIONS
// ============================================================
//
// Finds active subscriptions whose billing period has ended.
//
// active → expired
//
// This function DOES NOT renew subscriptions.
// ============================================================

const expireSubscriptions =
  async () => {

    try {

      const now =
        new Date();


      const result =
        await Subscription.updateMany(

          {
            status: 'active',

            currentPeriodEnd: {
              $ne: null,
              $lte: now
            }
          },

          {
            $set: {
              status: 'expired',
              updatedAt: now
            }
          }

        );


      return {

        success: true,

        expiredCount:
          result.modifiedCount || 0

      };


    } catch (error) {

      console.error(
        'Expire subscriptions error:',
        error
      );


      return {

        success: false,

        expiredCount: 0,

        error:
          error.message

      };

    }

  };


// ============================================================
// CHECK SUBSCRIPTIONS FOR RENEWAL
// ============================================================
//
// IMPORTANT:
//
// This currently does NOT charge users.
//
// It only identifies subscriptions that have expired.
//
// Automatic recurring payment will be added later when
// we implement the appropriate payment-provider mechanism.
//
// ============================================================

const checkAndRenewSubscriptions =
  async () => {

    try {

      console.log(
        'Checking subscriptions for renewal...'
      );


      const now =
        new Date();


      const subscriptions =
        await Subscription.find({

          status: 'active',

          currentPeriodEnd: {
            $ne: null,
            $lte: now
          }

        });


      if (
        subscriptions.length === 0
      ) {

        console.log(
          'No subscriptions require renewal.'
        );


        return {

          success: true,

          renewedCount: 0

        };

      }


      console.log(

        `${subscriptions.length} ` +
        `subscription(s) require renewal ` +
        `but automatic renewal is not ` +
        `enabled yet.`

      );


      return {

        success: true,

        renewedCount: 0,

        pendingRenewalCount:
          subscriptions.length

      };


    } catch (error) {

      console.error(
        'Subscription renewal check error:',
        error
      );


      return {

        success: false,

        renewedCount: 0,

        error:
          error.message

      };

    }

  };


// ============================================================
// EXPORTS
// ============================================================
//
// IMPORTANT:
//
// index.js imports:
//
// const {
//   checkAndRenewSubscriptions
// } = require('./services/paymentService');
//
// Therefore this function MUST be exported.
// ============================================================

module.exports = {

  expireSubscriptions,

  checkAndRenewSubscriptions

};