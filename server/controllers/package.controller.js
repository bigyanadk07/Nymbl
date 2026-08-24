const Package = require('../models/package.model');
const Subscription = require('../models/subscription.model');


// ============================================================
// GET ALL PACKAGES
// GET /packages
// ============================================================

exports.getAllPackages = async (req, res) => {

  try {

    const packages =
      await Package.find()
        .populate(
          'apis',
          'name description category'
        );


    res.json(

      packages.map(pkg => ({

        id:
          pkg._id,

        name:
          pkg.name,

        description:
          pkg.description,

        price:
          pkg.price,

        billingCycle:
          pkg.billingCycle,

        features:
          pkg.features,

        isPopular:
          pkg.isPopular,

        apis:
          pkg.apis

      }))

    );

  } catch (err) {

    console.error(
      'Get packages error:',
      err
    );

    res.status(500).json({

      success: false,

      message:
        'Server error'

    });

  }

};


// ============================================================
// GET PACKAGE BY ID
// GET /packages/:id
// ============================================================

exports.getPackageById = async (req, res) => {

  try {

    const packageData =
      await Package.findById(
        req.params.id
      )
      .populate(
        'apis',
        'name description category'
      );


    if (!packageData) {

      return res.status(404).json({

        success: false,

        message:
          'Package not found'

      });

    }


    // --------------------------------------------------------
    // Check whether the logged-in user has an ACTIVE
    // subscription to this package.
    // --------------------------------------------------------

    let isSubscribed = false;

    let subscription = null;


    if (req.user) {

      subscription =
        await Subscription.findOne({

          userId:
            req.user._id,

          packageId:
            packageData._id,

          status:
            'active'

        });


      if (subscription) {

        isSubscribed = true;

      }

    }


    // --------------------------------------------------------
    // Return package information.
    // --------------------------------------------------------

    res.json({

      id:
        packageData._id,

      name:
        packageData.name,

      description:
        packageData.description,

      price:
        packageData.price,

      billingCycle:
        packageData.billingCycle,

      features:
        packageData.features,

      isPopular:
        packageData.isPopular,

      apis:
        packageData.apis,


      // ------------------------------------------------------
      // Subscription information
      // ------------------------------------------------------

      isSubscribed,

      subscription:

        subscription

          ? {

              id:
                subscription._id,

              status:
                subscription.status,

              currentPeriodStart:
                subscription.currentPeriodStart,

              currentPeriodEnd:
                subscription.currentPeriodEnd

            }

          : null

    });


  } catch (err) {

    console.error(
      'Get package error:',
      err
    );

    res.status(500).json({

      success: false,

      message:
        'Server error'

    });

  }

};