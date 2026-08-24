// scripts/seedPackages.js

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Package = require('../models/package.model');
const Api = require('../models/api.model');

// Sample APIs to seed if none exist
// const sampleApis = [
//     {
//       name: 'Weather API',
//       description: 'Access to real-time weather data',
//       usageLimit: 100000,
//       endpoint: '/api/weather',
//       category: 'Weather'
//     },
//     {
//       name: 'Finance API',
//       description: 'Financial data and market insights',
//       usageLimit: 100000,
//       endpoint: '/api/finance',
//       category: 'Finance'
//     },
//     {
//       name: 'Maps API',
//       description: 'Geolocation and mapping services',
//       usageLimit: 100000,
//       endpoint: '/api/maps',
//       category: 'Maps'
//     },
//     {
//       name: 'News API',
//       description: 'Real-time news updates',
//       usageLimit: 100000,
//       endpoint: '/api/news',
//       category: 'News'
//     }
//   ];

const sampleApis = [
  {
    name: 'Minecraft API',
    description: 'Access Minecraft server status, player stats, and skins.',
    usageLimit: 49000,
    pricePerRequest: 0.001,
    endpoint: '/api/minecraft',
    category: 'Gaming'
  },
  {
    name: 'Valorant API',
    description: 'Fetch Valorant player profiles, match history, and stats.',
    usageLimit: 123456,
    pricePerRequest: 0.002,
    endpoint: '/api/valorant',
    category: 'Gaming'
  },
  {
    name: 'REPO API',
    description: 'Retrieve data from the REPO gaming servers and leaderboards.',
    usageLimit: 69000,
    pricePerRequest: 0.0015,
    endpoint: '/api/repo',
    category: 'Gaming'
  }
];

async function seedPackages() {
  try {
    const mongoURI = 'mongodb://localhost:27017/Apistore';
    
    if (!mongoURI) {
      throw new Error('MongoDB URI is not defined in environment variables.');
    }

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');

    // Clear existing packages
    await Package.deleteMany({});
    console.log('🗑️ Existing packages deleted');

    // Fetch existing APIs
    let apis = await Api.find({}).select('_id');

    // If no APIs exist, insert sample APIs
    if (apis.length === 0) {
      console.log('ℹ️ No APIs found, seeding sample APIs...');
      const insertedApis = await Api.insertMany(sampleApis);
      apis = insertedApis.map(api => ({ _id: api._id }));
      console.log('✅ Sample APIs seeded');
    } else {
      console.log(`✅ Found ${apis.length} existing APIs`);
    }

    // Define packages after APIs are ready
    const packages = [
      {
        name: 'Basic',
        description: 'Basic API access with limited requests',
        price: 29.99,
        billingCycle: 'monthly',
        features: [
          '100,000 API calls per month',
          'Basic rate limiting',
          'Email support',
          'API documentation access'
        ],
        isPopular: false,
        apis: apis.map(api => api._id),
      },
      {
        name: 'Pro',
        description: 'Professional API access with higher limits',
        price: 99.99,
        billingCycle: 'monthly',
        features: [
          '500,000 API calls per month',
          'Advanced rate limiting',
          'Priority email support',
          'API documentation access',
          'Analytics dashboard'
        ],
        isPopular: true,
        apis: apis.map(api => api._id),
      },
      {
        name: 'Enterprise',
        description: 'Enterprise-grade API access with unlimited requests',
        price: 249.99,
        billingCycle: 'monthly',
        features: [
          'Unlimited API calls',
          'Custom rate limiting',
          'Dedicated support',
          'API documentation access',
          'Advanced analytics dashboard',
          'SLA guarantee',
          'Custom integration support'
        ],
        isPopular: false,
        apis: apis.map(api => api._id),
      },
      {
        name: 'Starter Annual',
        description: 'Annual billing for Basic package with discount',
        price: 299.99,
        billingCycle: 'yearly',
        features: [
          '100,000 API calls per month',
          'Basic rate limiting',
          'Email support',
          'API documentation access',
          '2 months free compared to monthly billing'
        ],
        isPopular: false,
        apis: apis.map(api => api._id),
      },
      {
        name: 'Pro Annual',
        description: 'Annual billing for Pro package with discount',
        price: 999.99,
        billingCycle: 'yearly',
        features: [
          '500,000 API calls per month',
          'Advanced rate limiting',
          'Priority email support',
          'API documentation access',
          'Analytics dashboard',
          '2 months free compared to monthly billing'
        ],
        isPopular: false,
        apis: apis.map(api => api._id),
      }
    ];

    // Insert packages
    await Package.insertMany(packages);
    console.log('✅ Packages seeded successfully');

    await mongoose.disconnect();
    console.log('✅ MongoDB Disconnected');

  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

// Run the seeder
seedPackages();
