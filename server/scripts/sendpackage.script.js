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
    name: 'Greeting API',
    description: 'Returns a time-of-day greeting (Good Morning/Afternoon/Evening/Night).',
    usageLimit: 1000,
    pricePerRequest: 0,
    endpoint: '/api/v1/greeting',
    category: 'Utility'
  },

  {
    name: 'Arsenal API',
    description: 'Returns Arsenal\'s 2025/26 league-winning status.',
    usageLimit: 1000,
    pricePerRequest: 0,
    endpoint: '/api/v1/arsenal',
    category: 'Sports'
  },
  {
  name: 'Text Analyser API',
  description: 'Analyzes text and returns character, word, sentence, and paragraph statistics, plus estimated reading time.',
  usageLimit: 500,
  pricePerRequest: 0,
  endpoint: '/api/v1/analyse',
  category: 'Utility'
},
  {
  name: 'URL Analyser API',
  description: 'Validates that the provided value is a valid URL and returns a structured analysis.',
  usageLimit: 500,
  pricePerRequest: 0,
  endpoint: '/api/v1/url-analyser',
  category: 'Utility'
},
  {
  name: 'Password Analyser API',
  description: 'Analyzes & accept a password through a POST request and analyzes its strength without storing the password anywhere.',
  usageLimit: 500,
  pricePerRequest: 0,
  endpoint: '/api/v1/password-analyser',
  category: 'Utility'
}
];


// ============================================================
// PACKAGE DEFINITIONS
//
// One package per API — `apiNames` ties each package to
// exactly one underlying API, so packages never overlap.
// ============================================================

const packageDefinitions = [
  {
    name: 'Hello World',
    description: 'Access to the Hello World API',
    price: 100,
    billingCycle: 'monthly',

    apiNames: ['Hello World API'],

    features: [
      '1,000 API calls per month',
      'Basic rate limiting',
      'Email support',
      'API documentation access'
    ],

    isPopular: false
  },

  {
    name: 'Greeting',
    description: 'Access to the Greeting API',
    price: 200,
    billingCycle: 'monthly',

    apiNames: ['Greeting API'],

    features: [
      '1,000 API calls per month',
      'Basic rate limiting',
      'Email support',
      'API documentation access'
    ],

    isPopular: true
  },

  {
    name: 'Arsenal',
    description: 'Access to the Arsenal API',
    price: 150,
    billingCycle: 'monthly',

    apiNames: ['Arsenal API'],

    features: [
      '1,000 API calls per month',
      'Basic rate limiting',
      'Email support',
      'API documentation access'
    ],

    isPopular: false
  },
  
  {
    name: 'Text Analyser',
    description: 'Access to the Text Analyser API',
    price: 200,
    billingCycle: 'monthly',

    apiNames: ['Text Analyser API'],

    features: [
      '500 API calls per month',
      'Basic rate limiting',
      'Email support',
      'API documentation access'
    ],

    isPopular: true
  },
  
  {
    name: 'URL Analyser',
    description: 'Access to the URL Analyser API',
    price: 100,
    billingCycle: 'monthly',

    apiNames: ['URL Analyser API'],

    features: [
      '500 API calls per month',
      'Basic rate limiting',
      'Email support',
      'API documentation access'
    ],

    isPopular: false
  },
  
  {
    name: 'Password Analyser',
    description: 'Access to the Password Analyser API',
    price: 100,
    billingCycle: 'monthly',

    apiNames: ['Password Analyser API'],

    features: [
      '500 API calls per month',
      'Basic rate limiting',
      'Email support',
      'API documentation access'
    ],

    isPopular: true
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


    // Map of API name -> Mongo document, used below to resolve
    // each package's `apiNames` into actual API ObjectIds.
    const apiByName = {};


    for (const apiDefinition of sampleApis) {

      // Find API using its unique identifying information
      const existingApi = await Api.findOne({
        name: apiDefinition.name
      });


      if (existingApi) {

        console.log(
          `⏭️ API already exists: ${existingApi.name}`
        );

        apiByName[existingApi.name] = existingApi;

        continue;
      }


      // Create API if it does not exist
      const newApi = await Api.create(apiDefinition);


      console.log(
        `✅ API created: ${newApi.name}`
      );


      apiByName[newApi.name] = newApi;

    }


    console.log(
      `\n✅ Marketplace API check complete. ${Object.keys(apiByName).length} APIs available.`
    );


    // ========================================================
    // SEED PACKAGES
    // ========================================================

    console.log('\n🔍 Checking marketplace packages...');


    for (const packageDefinition of packageDefinitions) {

      const { apiNames, ...packageFields } = packageDefinition;


      // Resolve this package's named APIs to their ObjectIds.
      const resolvedApiIds = [];

      for (const apiName of apiNames) {

        const apiDoc = apiByName[apiName];

        if (!apiDoc) {

          console.warn(
            `   ⚠️ API "${apiName}" not found — skipping for package "${packageDefinition.name}"`
          );

          continue;
        }

        resolvedApiIds.push(apiDoc._id);

      }


      const existingPackage = await Package.findOne({
        name: packageDefinition.name,
        billingCycle: packageDefinition.billingCycle
      });


      if (existingPackage) {

        console.log(
          `⏭️ Package already exists: ${existingPackage.name}`
        );


        // ----------------------------------------------------
        // Sync this package's APIs to exactly match `apiNames`.
        // ----------------------------------------------------

        const currentApiIds =
          existingPackage.apis
            .map(apiId => apiId.toString())
            .sort();

        const targetApiIds =
          resolvedApiIds
            .map(apiId => apiId.toString())
            .sort();

        const isSame =
          currentApiIds.length === targetApiIds.length &&
          currentApiIds.every(
            (id, index) => id === targetApiIds[index]
          );


        if (!isSame) {

          existingPackage.apis = resolvedApiIds;

          await existingPackage.save();

          console.log(
            `   ↳ Updated APIs for ${existingPackage.name} → [${apiNames.join(', ')}]`
          );

        }


        continue;

      }


      // ------------------------------------------------------
      // Create new package
      // ------------------------------------------------------

      const newPackage = await Package.create({

        ...packageFields,

        apis: resolvedApiIds

      });


      console.log(
        `✅ Package created: ${newPackage.name} → [${apiNames.join(', ')}]`
      );

    }


    // ========================================================
    // REMOVE OLD PACKAGES NOT IN THE CURRENT DEFINITIONS
    //
    // Cleans up leftovers from the previous multi-tier model
    // (Basic, Pro, Enterprise, Starter Annual, Pro Annual).
    //
    // NOTE: this only deletes the Package documents themselves.
    // Any existing Subscription/Payment records referencing
    // these packageIds are left untouched — since this is a
    // dev environment, decide separately whether you want to
    // also clean those up, or leave them as historical records.
    // ========================================================

    console.log('\n🔍 Checking for packages to remove...');


    const currentPackageKeys = packageDefinitions.map(
      p => `${p.name}::${p.billingCycle}`
    );


    const allPackages = await Package.find({});


    for (const pkg of allPackages) {

      const key = `${pkg.name}::${pkg.billingCycle}`;

      if (!currentPackageKeys.includes(key)) {

        await Package.deleteOne({ _id: pkg._id });

        console.log(
          `🗑️ Removed old package: ${pkg.name} (${pkg.billingCycle})`
        );

      }

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