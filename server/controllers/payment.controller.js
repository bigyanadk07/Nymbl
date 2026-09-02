const Payment = require('../models/payment.model');
const Subscription = require('../models/subscription.model');
const Package = require('../models/package.model');

const esewaConfig = require('../config/esewa.config');

const {
  generateTransactionUuid,
  createPaymentPayload,
  verifySignature,
  checkTransactionStatus
} = require('../services/esewa.service');


/*
 * Initiate eSewa payment
 */
const initiateEsewaPayment = async (req, res) => {
  try {

    const userId = req.user._id;

    const { packageId } =
      req.body;


    if (!packageId) {
      return res.status(400).json({
        success: false,
        message: 'Package ID is required'
      });
    }


    /*
     * Find package.
     */
    const packageData =
      await Package.findById(packageId);


    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }


    /*
     * Check for an ACTIVE subscription.
     *
     * Pending subscriptions are allowed here because
     * a previous payment attempt may have failed.
     */
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


    /*
     * Generate transaction UUID.
     */
    const transactionUuid =
      generateTransactionUuid();


    /*
     * Create pending subscription.
     */
    const subscription =
      await Subscription.create({

        userId,

        packageId,

        status: 'pending',

        currentPeriodStart: null,

        currentPeriodEnd: null

      });


    /*
     * Create pending payment.
     */
    const payment =
      await Payment.create({

        userId,

        subscriptionId:
          subscription._id,

        packageId,

        provider: 'esewa',

        transactionUuid,

        amount:
          packageData.price,

        currency: 'NPR',

        status: 'pending'

      });


    /*
     * Generate eSewa payload.
     */
    const paymentPayload =
      createPaymentPayload({

        amount:
          packageData.price,

        transactionUuid

      });


    return res.status(201).json({

      success: true,

      payment: {

        id:
          payment._id,

        transactionUuid,

        amount:
          packageData.price,

        currency: 'NPR',

        provider: 'esewa',

        status:
          payment.status

      },

      esewa: {

        paymentUrl:
          esewaConfig.paymentUrl,

        ...paymentPayload

      }

    });

  } catch (error) {

    console.error(
      'eSewa payment initiation error:',
      error
    );

    return res.status(500).json({

      success: false,

      message:
        'Failed to initiate eSewa payment'

    });
  }
};


/*
 * Handle successful eSewa payment.
 *
 * eSewa sends a Base64 encoded "data"
 * parameter to the success URL.
 */
const handleEsewaSuccess = async (req, res) => {

  try {

    console.log(
      'eSewa success callback query:',
      req.query
    );

    console.log(
      'eSewa success callback URL:',
      req.originalUrl
    );


    const { data } =
      req.query;


    if (!data) {

      return res.status(400).json({

        success: false,

        message:
          'Missing eSewa response data'

      });
    }


    /*
     * Decode Base64 response.
     */
    let paymentResponse;

    try {

      const decodedData =
        Buffer
          .from(data, 'base64')
          .toString('utf-8');

      paymentResponse =
        JSON.parse(decodedData);

    } catch (error) {

      console.error(
        'Failed to decode eSewa response:',
        error
      );

      return res.status(400).json({

        success: false,

        message:
          'Invalid eSewa response data'

      });
    }


    console.log(
      'Decoded eSewa success response:',
      paymentResponse
    );


    const {
      status,
      signature,
      transaction_code: transactionCode,
      total_amount: totalAmount,
      transaction_uuid: transactionUuid,
      product_code: productCode
    } = paymentResponse;


    /*
     * Validate required response fields.
     */
    if (
      !status ||
      !signature ||
      !transactionUuid ||
      !productCode ||
      totalAmount === undefined
    ) {

      return res.status(400).json({

        success: false,

        message:
          'Invalid eSewa response'

      });
    }


    /*
     * Find our payment.
     */
    const payment =
      await Payment.findOne({

        transactionUuid,

        provider: 'esewa'

      });


    if (!payment) {

      return res.status(404).json({

        success: false,

        message:
          'Payment transaction not found'

      });
    }


    /*
     * Prevent duplicate processing.
     */
    if (
      payment.status === 'success'
    ) {

      return res.status(200).json({

        success: true,

        message:
          'Payment already processed',

        payment

      });
    }


    /*
     * Verify product code.
     */
    if (
      productCode !==
      esewaConfig.productCode
    ) {

      return res.status(400).json({

        success: false,

        message:
          'Invalid eSewa product code'

      });
    }


    /*
     * Verify amount.
     */
    if (
      Number(totalAmount) !==
      Number(payment.amount)
    ) {

      return res.status(400).json({

        success: false,

        message:
          'Payment amount mismatch'

      });
    }


    /*
     * Verify eSewa signature.
     */
    const isValidSignature = verifySignature(paymentResponse);


    if (!isValidSignature) {

      return res.status(400).json({

        success: false,

        message:
          'Invalid eSewa signature'

      });
    }


    /*
     * eSewa success response should be COMPLETE.
     */
    if (
      status !== 'COMPLETE'
    ) {

      payment.status =
        'failed';

      payment.updatedAt =
        new Date();

      await payment.save();

      return res.status(400).json({

        success: false,

        message:
          `eSewa payment status: ${status}`

      });
    }


    /*
     * Server-side transaction verification.
     *
     * Never trust the browser redirect alone.
     */
    const verification =
      await checkTransactionStatus({

        totalAmount:
          payment.amount,

        transactionUuid

      });


    if (
      !verification ||
      verification.status !== 'COMPLETE'
    ) {

      console.error(
        'eSewa verification failed:',
        verification
      );

      return res.status(400).json({

        success: false,

        message:
          'eSewa transaction verification failed',

        status:
          verification?.status

      });
    }


    /*
     * Update payment.
     */
    payment.status =
      'success';

    payment.transactionCode =
      transactionCode ||
      verification.ref_id;

    payment.paidAt =
      new Date();

    payment.updatedAt =
      new Date();


    await payment.save();


    /*
     * Find subscription.
     */
    const subscription =
      await Subscription.findById(
        payment.subscriptionId
      );


    if (!subscription) {

      return res.status(404).json({

        success: false,

        message:
          'Subscription not found'

      });
    }


    /*
     * Find package.
     */
    const packageData =
      await Package.findById(
        payment.packageId
      );


    if (!packageData) {

      return res.status(404).json({

        success: false,

        message:
          'Package not found'

      });
    }


    /*
     * Calculate subscription period.
     */
    const startDate =
      new Date();

    const endDate =
      new Date(startDate);


    if (
      packageData.billingCycle ===
      'monthly'
    ) {

      endDate.setMonth(
        endDate.getMonth() + 1
      );

    }


    if (
      packageData.billingCycle ===
      'quarterly'
    ) {

      endDate.setMonth(
        endDate.getMonth() + 3
      );

    }


    if (
      packageData.billingCycle ===
      'yearly'
    ) {

      endDate.setFullYear(
        endDate.getFullYear() + 1
      );

    }


    /*
     * Activate subscription.
     */
    subscription.status =
      'active';

    subscription.currentPeriodStart =
      startDate;

    subscription.currentPeriodEnd =
      endDate;


    await subscription.save();


/*
 * Redirect user to the frontend success page.
 *
 * Payment has already been verified and the
 * subscription has already been activated above.
 */
return res.redirect(
  `${process.env.FRONTEND_URL}/payment/success` +
  `?transactionCode=${encodeURIComponent(
    payment.transactionCode || ''
  )}` +
  `&amount=${encodeURIComponent(
    payment.amount
  )}`
);

  } catch (error) {

    console.error(
      'eSewa success handling error:',
      error
    );

    return res.status(500).json({

      success: false,

      message:
        'Failed to process eSewa payment'

    });
  }
};


/*
 * Handle failed/cancelled eSewa payment.
 *
 * IMPORTANT:
 *
 * eSewa may redirect to failure_url without
 * providing the Base64 "data" parameter.
 *
 * Therefore we DO NOT require req.query.data here.
 */
const handleEsewaFailure = async (req, res) => {

  try {

    console.log(
      'eSewa failure callback query:',
      req.query
    );

    console.log(
      'eSewa failure callback URL:',
      req.originalUrl
    );


    /*
     * eSewa may provide transaction_uuid
     * directly, or may provide no data at all.
     *
     * Try to extract it if available.
     */
    let transactionUuid =
      req.query.transaction_uuid ||
      req.query.transactionUuid ||
      null;


    /*
     * Some eSewa responses may provide Base64 data.
     *
     * If it exists, try to decode it.
     */
    if (
      !transactionUuid &&
      req.query.data
    ) {

      try {

        const decodedData =
          Buffer
            .from(
              req.query.data,
              'base64'
            )
            .toString('utf-8');

        const paymentResponse =
          JSON.parse(decodedData);

        transactionUuid =
          paymentResponse.transaction_uuid;

        console.log(
          'Decoded eSewa failure response:',
          paymentResponse
        );

      } catch (error) {

        console.error(
          'Could not decode eSewa failure data:',
          error
        );

      }
    }


    /*
     * If we have a transaction UUID,
     * try to find the payment.
     */
    if (transactionUuid) {

      const payment =
        await Payment.findOne({

          transactionUuid,

          provider: 'esewa'

        });


      if (payment) {

        /*
         * If payment isn't already successful,
         * mark it as failed.
         */
        if (
          payment.status !==
          'success'
        ) {

          payment.status =
            'failed';

          payment.updatedAt =
            new Date();

          await payment.save();


          /*
           * Find corresponding subscription.
           */
          const subscription =
            await Subscription.findById(
              payment.subscriptionId
            );


          if (subscription) {

            /*
             * A failed payment should not
             * remain active.
             */
            if (
              subscription.status !==
              'active'
            ) {

              subscription.status =
                'canceled';

              await subscription.save();

            }

          }

        }


return res.redirect(
  `${process.env.FRONTEND_URL}/payment/failure`
);
      }
    }


    /*
     * We don't know which transaction failed.
     *
     * Do NOT mark random pending payments
     * as failed.
     *
     * This is safer than guessing.
     */
    return res.status(200).json({

      success: false,

      message:
        'eSewa payment failed or was cancelled',

      transactionUuid:
        transactionUuid

    });

  } catch (error) {

    console.error(
      'eSewa failure handling error:',
      error
    );

    return res.status(500).json({

      success: false,

      message:
        'Failed to process eSewa failure'

    });
  }
};

/*
 * ============================================================
 * GET MY PAYMENTS  (INVOICES)
 * ============================================================
 *
 * The Payment collection is the source of truth for invoices.
 *
 * Payment.status maps onto the invoice status the frontend
 * expects — note that 'success' becomes 'paid':
 *
 *   success   ->  paid
 *   pending   ->  pending
 *   failed    ->  failed
 *   refunded  ->  refunded
 *
 * ============================================================
 */

const INVOICE_STATUS_MAP = {
  success: 'paid',
  pending: 'pending',
  failed: 'failed',
  refunded: 'refunded'
};


/*
 * Build a stable, human-readable invoice number.
 *
 * Payment has no invoiceNumber field yet, so we derive one
 * deterministically from the payment date and its id. The same
 * payment always yields the same number, so it is safe to show
 * to users and to reference in support conversations.
 *
 * Example:  NYM-202609-4F9C2A
 */
const buildInvoiceNumber = (payment) => {
  const created = payment.createdAt
    ? new Date(payment.createdAt)
    : new Date();

  const year = created.getFullYear();

  const month = String(created.getMonth() + 1).padStart(2, '0');

  const suffix = String(payment._id)
    .replace(/-/g, '')
    .slice(0, 6)
    .toUpperCase();

  return `NYM-${year}${month}-${suffix}`;
};


const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      userId: req.user._id
    })
      .populate('packageId')
      .sort({ createdAt: -1 });

    const invoices = payments.map(payment => ({
      id: payment._id,

      invoiceNumber: buildInvoiceNumber(payment),

      subscriptionId: payment.subscriptionId,

      // Guard: packageId populates to null if the package was deleted
      packageId: payment.packageId
        ? payment.packageId._id
        : null,

      packageName: payment.packageId
        ? payment.packageId.name
        : 'Unavailable package',

      billingCycle: payment.packageId
        ? payment.packageId.billingCycle
        : null,

      amount: payment.amount,

      currency: payment.currency || 'NPR',

      status: INVOICE_STATUS_MAP[payment.status] || 'pending',

      paymentMethod: payment.provider,

      transactionCode: payment.transactionCode,

      transactionUuid: payment.transactionUuid,

      createdAt: payment.createdAt,

      paidAt: payment.paidAt
    }));

    /*
     * Compute the summary server-side so the numbers stay
     * consistent no matter which client renders them.
     */
    const paidInvoices = invoices.filter(
      invoice => invoice.status === 'paid'
    );

    return res.json({
      success: true,

      summary: {
        totalInvoices: invoices.length,

        paidInvoices: paidInvoices.length,

        totalPaid: paidInvoices.reduce(
          (total, invoice) => total + (invoice.amount || 0),
          0
        ),

        currency: invoices[0]?.currency || 'NPR'
      },

      data: invoices
    });
  } catch (err) {
    console.error('Get my payments error:', err);

    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {

  initiateEsewaPayment,

  handleEsewaSuccess,

  handleEsewaFailure,

  getMyPayments

};