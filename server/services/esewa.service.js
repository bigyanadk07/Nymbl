// services/esewa.service.js

const crypto =
  require('crypto');

const esewaConfig =
  require('../config/esewa');


// ============================================================
// GENERATE TRANSACTION UUID
// ============================================================

const generateTransactionUuid =
  () => {

    return (
      `TXN-${Date.now()}-` +
      `${crypto.randomBytes(6).toString('hex')}`
    );

  };


// ============================================================
// GENERATE SIGNATURE
// ============================================================
//
// eSewa ePay V2 signs:
//
// total_amount
// transaction_uuid
// product_code
//
// Format:
//
// total_amount=100,transaction_uuid=...,product_code=...
//
// ============================================================

const generateSignature = ({
  totalAmount,
  transactionUuid,
  productCode
}) => {

  const message =
    `total_amount=${totalAmount},` +
    `transaction_uuid=${transactionUuid},` +
    `product_code=${productCode}`;


  return crypto
    .createHmac(
      'sha256',
      esewaConfig.secretKey
    )
    .update(message)
    .digest('base64');

};


// ============================================================
// CREATE PAYMENT PAYLOAD
// ============================================================

const createPaymentPayload = ({
  amount,
  transactionUuid
}) => {

  const totalAmount =
    Number(amount).toFixed(2);


  const productCode =
    esewaConfig.productCode;


  const signature =
    generateSignature({

      totalAmount,

      transactionUuid,

      productCode

    });


  return {

    amount:
      totalAmount,

    tax_amount:
      '0',

    total_amount:
      totalAmount,

    transaction_uuid:
      transactionUuid,

    product_code:
      productCode,

    product_service_charge:
      '0',

    product_delivery_charge:
      '0',

    success_url:
      esewaConfig.successUrl,

    failure_url:
      esewaConfig.failureUrl,

    signed_field_names:
      'total_amount,transaction_uuid,product_code',

    signature

  };

};


// ============================================================
// VERIFY RETURNED SIGNATURE
// ============================================================

const verifySignature = ({
  totalAmount,
  transactionUuid,
  productCode,
  signature
}) => {

  if (
    !totalAmount ||
    !transactionUuid ||
    !productCode ||
    !signature
  ) {

    return false;

  }


  const expectedSignature =
    generateSignature({

      totalAmount,

      transactionUuid,

      productCode

    });


  const expectedBuffer =
    Buffer.from(
      expectedSignature,
      'utf8'
    );


  const receivedBuffer =
    Buffer.from(
      signature,
      'utf8'
    );


  if (
    expectedBuffer.length !==
    receivedBuffer.length
  ) {

    return false;

  }


  return crypto.timingSafeEqual(
    expectedBuffer,
    receivedBuffer
  );

};


// ============================================================
// CHECK TRANSACTION STATUS
// ============================================================
//
// Server-side verification with eSewa.
//
// ============================================================

const checkTransactionStatus =
  async ({
    totalAmount,
    transactionUuid
  }) => {

    const params =
      new URLSearchParams({

        product_code:
          esewaConfig.productCode,

        total_amount:
          Number(totalAmount).toFixed(2),

        transaction_uuid:
          transactionUuid

      });


    const verificationUrl =
      `https://rc.esewa.com.np/` +
      `api/epay/transaction/status/` +
      `?${params.toString()}`;


    console.log(
      'Checking eSewa transaction status:',
      transactionUuid
    );


    const response =
      await fetch(
        verificationUrl,
        {
          method: 'GET',

          headers: {
            'Content-Type':
              'application/json'
          }
        }
      );


    if (!response.ok) {

      throw new Error(

        `eSewa verification request failed: ` +
        `${response.status}`

      );

    }


    const result =
      await response.json();


    console.log(
      'eSewa transaction status:',
      result
    );


    return result;

  };


// ============================================================
// EXPORTS
// ============================================================

module.exports = {

  generateTransactionUuid,

  generateSignature,

  createPaymentPayload,

  verifySignature,

  checkTransactionStatus

};