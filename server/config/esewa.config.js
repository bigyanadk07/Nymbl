module.exports = {
  paymentUrl:
    process.env.ESEWA_BASE_URL ||
    'https://rc-epay.esewa.com.np/api/epay/main/v2/form',

  productCode:
    process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST',

  secretKey:
    process.env.ESEWA_SECRET_KEY,

  successUrl:
    process.env.ESEWA_SUCCESS_URL,

  failureUrl:
    process.env.ESEWA_FAILURE_URL
};