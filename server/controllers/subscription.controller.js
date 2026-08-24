const Subscription = require('../models/subscription.model');
const Package = require('../models/package.model');


// Start a subscription/payment process
const createSubscription = async (req, res) => {

  try {

    const userId = req.user._id;

    const {
      packageId
    } = req.body;


    if (!packageId) {

      return res.status(400).json({

        success: false,

        message:
          'Package ID is required'

      });

    }


    // Find package
    const packageData =
      await Package.findById(packageId);


    if (!packageData) {

      return res.status(404).json({

        success: false,

        message:
          'Package not found'

      });

    }


    // Check active subscription
    const existingSubscription =
      await Subscription.findOne({

        userId,

        packageId,

        status: 'active'

      });


    if (existingSubscription) {

      return res.status(400).json({

        success: false,

        message:
          'You are already subscribed to this package'

      });

    }


    /**
     * Check whether there is already a pending
     * subscription for this package.
     *
     * A pending subscription means the user may
     * already have started a payment attempt.
     */
    let subscription =
      await Subscription.findOne({

        userId,

        packageId,

        status: 'pending'

      });


    /**
     * If there is no pending subscription,
     * create one.
     *
     * IMPORTANT:
     *
     * We do NOT activate it here.
     *
     * Payment must succeed first.
     */
    if (!subscription) {

      subscription =
        await Subscription.create({

          userId,

          packageId,

          status: 'pending',

          currentPeriodStart: null,

          currentPeriodEnd: null

        });

    }


    return res.status(201).json({

      success: true,

      message:
        'Subscription created and waiting for payment',

      subscription

    });

  } catch (error) {

    console.error(
      'Create subscription error:',
      error
    );


    return res.status(500).json({

      success: false,

      message:
        'Failed to create subscription'

    });

  }

};


// Get current user's subscriptions
const getMySubscriptions = async (req, res) => {

  try {

    const userId = req.user._id;


    const subscriptions =
      await Subscription.find({

        userId

      });


    return res.status(200).json({

      success: true,

      subscriptions

    });

  } catch (error) {

    console.error(
      'Get subscriptions error:',
      error
    );


    return res.status(500).json({

      success: false,

      message:
        'Failed to get subscriptions'

    });

  }

};


module.exports = {

  createSubscription,

  getMySubscriptions

};