// server.js
require('dotenv').config();
const app = require('./app');
const config = require('./config/default');
const connectDB = require('./config/db');
const { checkAndRenewSubscriptions } = require('./services/paymentService');
const {
  runSubscriptionExpirationJob
} = require('./jobs/subscriptionJob');

// Connect to database
connectDB();

// Set up subscription renewal check
const startSubscriptionRenewalJob = async () => {

  // Run once at startup
  await checkAndRenewSubscriptions();

  // Then run daily
  setInterval(async () => {

    await checkAndRenewSubscriptions();

  }, 24 * 60 * 60 * 1000); // 24 hours
};

// Start subscription renewal job
startSubscriptionRenewalJob();

// Start subscription expiration job
runSubscriptionExpirationJob();

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

setInterval(
  runSubscriptionExpirationJob,
  60 * 60 * 1000
);