// app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler } = require('./utils/errorhandler.util');
const apiGateway = require('./middleware/apigateway.middleware');

// Import routes
const authRoutes = require('./routes/auth.routes');
const packageRoutes = require('./routes/packages.routes');
const apiRoutes = require('./routes/apis.routes');
const usageRoutes = require('./routes/usuage.routes');
const subscriptionRoutes = require('./routes/subscription.routes');
const paymentRoutes = require('./routes/payment.routes');

// Import the marketplace
const helloWorldRoutes = require('./market/helloworld/helloworld.routes');
const greetingRoutes = require('./market/greeting/greeting.routes')
const arsenalRoutes = require('./market/arsenal/arsenal.routes')
const analyserRoutes = require('./market/analyser/analyser.routes')
const passwordRoutes = require('./market/password-analyser/password.routes')
const urlRoutes = require('./market/url-analyser/url.routes')

// Create Express app
const app = express();

// Apply middleware
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(morgan('dev'));

// API routes
app.use('/auth', authRoutes);
app.use('/packages', packageRoutes);
app.use('/apis', apiRoutes);
app.use('/usage', usageRoutes);
app.use('/subscriptions', subscriptionRoutes);
app.use('/payments', paymentRoutes);



// API MARKETPLACE API

// Hello World API


app.use(
  '/api/v1/hello',
  apiGateway,
  helloWorldRoutes
);

// Greeting API
app.use(
  '/api/v1/greeting',
  apiGateway,
  greetingRoutes
);

// Arsenal API
app.use(
  '/api/v1/arsenal',
  apiGateway,
  arsenalRoutes
);

// Analyser API
app.use(
  '/api/v1/analyser',
  apiGateway,
  analyserRoutes
);
// Url API
app.use(
  '/api/v1/url-analyser',
  apiGateway,
  urlRoutes
);
// Analyser API
app.use(
  '/api/v1/password-analyser',
  apiGateway,
  passwordRoutes
);
// API MARKETPLACE END


// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;