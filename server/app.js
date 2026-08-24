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

// API Gateway for actual API endpoints
app.use('/api/v1', apiGateway, (req, res) => {
  // This is where you'd handle the actual API functionality
  // For now, we're just returning a successful response
  res.json({
    success: true,
    message: 'API request successful',
    endpoint: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

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