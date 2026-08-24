// scripts/sendpackage.script.js

require('dotenv').config({ path: '../.env' });

const mongoose = require('mongoose');

const Package = require('../models/package.model');
const Api = require('../models/api.model');


// ============================================================
// API DEFINITIONS
// ============================================================

const sampleApis = [
  {
    name: 'Hello World API',
    description: 'A simple API that returns a Hello World message.',
    usageLimit: 1000,
    pricePerRequest: 0,
    endpoint: '/api/v1/hello',
    category: 'Utility'
  },

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


// ============================================================
// PACKAGE DEFINITIONS
// ============================================================

const packageDefinitions = [
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

    isPopular: false
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

    isPopular: true
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

    isPopular: false
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

    isPopular: false
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

    isPopular: false
  }
];


// ============================================================
// SEED FUNCTION
// ============================================================

async function seedPackages() {

  try {

    const mongoURI =
      process.env.MONGO_URI ||
      'mongodb://localhost:27017/Apistore';


    // ========================================================
    // CONNECT TO DATABASE
    // ========================================================

    await mongoose.connect(mongoURI);

    console.log('✅ MongoDB Connected');


    // ========================================================
    // SEED APIs
    // ========================================================

    console.log('\n🔍 Checking marketplace APIs...');


    const apiDocuments = [];


    for (const apiDefinition of sampleApis) {

      // Find API using its unique identifying information
      const existingApi = await Api.findOne({
        name: apiDefinition.name
      });


      if (existingApi) {

        console.log(
          `⏭️ API already exists: ${existingApi.name}`
        );

        apiDocuments.push(existingApi);

        continue;
      }


      // Create API if it does not exist
      const newApi = await Api.create(apiDefinition);


      console.log(
        `✅ API created: ${newApi.name}`
      );


      apiDocuments.push(newApi);

    }


    console.log(
      `\n✅ Marketplace API check complete. ${apiDocuments.length} APIs available.`
    );


    // ========================================================
    // SEED PACKAGES
    // ========================================================

    console.log('\n🔍 Checking marketplace packages...');


    const apiIds = apiDocuments.map(api => api._id);


    for (const packageDefinition of packageDefinitions) {

      const existingPackage = await Package.findOne({
        name: packageDefinition.name,
        billingCycle: packageDefinition.billingCycle
      });


      if (existingPackage) {

        console.log(
          `⏭️ Package already exists: ${existingPackage.name}`
        );


        // ----------------------------------------------------
        // Add any missing APIs to the existing package
        // ----------------------------------------------------

        const existingApiIds =
          existingPackage.apis.map(
            apiId => apiId.toString()
          );


        const missingApiIds =
          apiIds.filter(
            apiId =>
              !existingApiIds.includes(
                apiId.toString()
              )
          );


        if (missingApiIds.length > 0) {

          existingPackage.apis.push(
            ...missingApiIds
          );


          await existingPackage.save();


          console.log(
            `   ↳ Added ${missingApiIds.length} missing API(s) to ${existingPackage.name}`
          );

        }


        continue;

      }


      // ------------------------------------------------------
      // Create new package
      // ------------------------------------------------------

      const newPackage = await Package.create({

        ...packageDefinition,

        apis: apiIds

      });


      console.log(
        `✅ Package created: ${newPackage.name}`
      );

    }


    // ========================================================
    // COMPLETE
    // ========================================================

    console.log('\n========================================');
    console.log('✅ Marketplace seeding completed');
    console.log('========================================\n');


    // ========================================================
    // DISCONNECT
    // ========================================================

    await mongoose.disconnect();

    console.log('✅ MongoDB Disconnected');


  } catch (error) {

    console.error('\n❌ Seeding error:', error);


    try {

      await mongoose.disconnect();

    } catch (disconnectError) {

      console.error(
        '❌ MongoDB disconnect error:',
        disconnectError
      );

    }


    process.exit(1);

  }

}


// ============================================================
// RUN SEEDER
// ============================================================

seedPackages();