  // controllers/apiController.js
  const Api = require('../models/api.model');
  const ApiKey = require('../models/apikey.model');
  const Subscription = require('../models/subscription.model');
  const apiKeyGenerator = require('../utils/keygen.util');

  // Get all available APIs
  exports.getAllApis = async (req, res) => {
    try {
      const apis = await Api.find();
      
      res.json(apis.map(api => ({
        id: api._id,
        name: api.name,
        description: api.description,
        category: api.category,
        endpoint: api.endpoint,
        usageLimit: api.usageLimit
      })));
    } catch (err) {
      console.error('Get APIs error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  };

  // Get API by ID
  exports.getApiById = async (req, res) => {
    try {
      const api = await Api.findById(req.params.id);
      
      if (!api) {
        return res.status(404).json({ message: 'API not found' });
      }
      
      res.json({
        id: api._id,
        name: api.name,
        description: api.description,
        category: api.category,
        endpoint: api.endpoint,
        usageLimit: api.usageLimit
      });
    } catch (err) {
      console.error('Get API error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  };

  // Get user's API keys
  exports.getUserApiKeys = async (req, res) => {
    try {
      // First, get the user's active subscriptions
      const subscriptions = await Subscription.find({
        userId: req.user._id,
        status: 'active'
      }).populate({
        path: 'packageId',
        populate: {
          path: 'apis'
        }
      });
      
      // Extract all API IDs the user has access to through their subscriptions
      const accessibleApiIds = new Set();
      subscriptions.forEach(subscription => {
        subscription.packageId.apis.forEach(api => {
          accessibleApiIds.add(api._id.toString());
        });
      });
      
      // Find the user's API keys
      const apiKeys = await ApiKey.find({
        userId: req.user._id,
        isActive: true
      }).populate('apiId');
      
      // Filter to only include keys for APIs the user has access to
      const validApiKeys = apiKeys.filter(key => 
        accessibleApiIds.has(key.apiId._id.toString())
      );
      
      res.json(validApiKeys.map(key => ({
        id: key._id,
        key: key.key,
        api: {
          id: key.apiId._id,
          name: key.apiId.name,
          endpoint: key.apiId.endpoint,
          category: key.apiId.category
        },
        createdAt: key.createdAt
      })));
    } catch (err) {
      console.error('Get API keys error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  };

  // Get APIs accessible through user's active subscriptions
exports.getAccessibleApis = async (req, res) => {
  try {
    // Find all active subscriptions belonging to the user
    const subscriptions = await Subscription.find({
      userId: req.user._id,
      status: 'active'
    }).populate({
      path: 'packageId',
      populate: {
        path: 'apis'
      }
    });

    // Collect all APIs from active subscriptions
    const apiMap = new Map();

    subscriptions.forEach(subscription => {
      if (!subscription.packageId) {
        return;
      }

      subscription.packageId.apis.forEach(api => {
        if (api && !apiMap.has(api._id.toString())) {
          apiMap.set(api._id.toString(), api);
        }
      });
    });

    const accessibleApis = Array.from(apiMap.values());

    // Find the user's active API keys
    const apiKeys = await ApiKey.find({
      userId: req.user._id,
      isActive: true
    });

    // Create a lookup map:
    // API ID -> API key
    const apiKeyMap = new Map();

    apiKeys.forEach(apiKey => {
      apiKeyMap.set(apiKey.apiId.toString(), apiKey);
    });

    // Combine API information with API key information
    const result = accessibleApis.map(api => {
      const apiKey = apiKeyMap.get(api._id.toString());

      return {
        id: api._id,
        name: api.name,
        description: api.description,
        category: api.category,
        endpoint: api.endpoint,
        usageLimit: api.usageLimit,

        hasApiKey: !!apiKey,

        apiKey: apiKey
          ? {
              id: apiKey._id,
              createdAt: apiKey.createdAt
            }
          : null
      };
    });

    return res.json({
      success: true,
      apis: result
    });

  } catch (err) {
    console.error('Get accessible APIs error:', err);

    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

  // Generate a new API key for a specific API
  exports.generateApiKey = async (req, res) => {
    try {
      const { apiId } = req.body;
      
      if (!apiId) {
        return res.status(400).json({ message: 'API ID is required' });
      }
      
      // Check if the API exists
      const api = await Api.findById(apiId);
      
      if (!api) {
        return res.status(404).json({ message: 'API not found' });
      }
      
      // Check if the user has an active subscription that includes this API
      const subscriptions = await Subscription.find({
        userId: req.user._id,
        status: 'active'
      }).populate({
        path: 'packageId',
        populate: {
          path: 'apis'
        }
      });
      
      let hasAccess = false;
      subscriptions.forEach(subscription => {
        subscription.packageId.apis.forEach(subscriptionApi => {
          if (subscriptionApi._id.toString() === apiId) {
            hasAccess = true;
          }
        });
      });
      
      if (!hasAccess) {
        return res.status(403).json({ 
          message: 'You do not have an active subscription that includes this API' 
        });
      }
      
      // Check if user already has a key for this API
      const existingKey = await ApiKey.findOne({
        userId: req.user._id,
        apiId,
        isActive: true
      });
      
      if (existingKey) {
        return res.json({
          id: existingKey._id,
          key: existingKey.key,
          api: {
            id: api._id,
            name: api.name,
            endpoint: api.endpoint
          },
          createdAt: existingKey.createdAt
        });
      }
      
      // Generate a new API key
      const apiKey = new ApiKey({
        userId: req.user._id,
        apiId,
        key: apiKeyGenerator.generateApiKey()
      });
      
      await apiKey.save();
      
      res.json({
        id: apiKey._id,
        key: apiKey.key,
        api: {
          id: api._id,
          name: api.name,
          endpoint: api.endpoint
        },
        createdAt: apiKey.createdAt
      });
    } catch (err) {
      console.error('Generate API key error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  };

  // Revoke an API key
  exports.revokeApiKey = async (req, res) => {
    try {
      const { keyId } = req.params;
      
      const apiKey = await ApiKey.findOne({
        _id: keyId,
        userId: req.user._id
      });
      
      if (!apiKey) {
        return res.status(404).json({ message: 'API key not found' });
      }
      
      apiKey.isActive = false;
      await apiKey.save();
      
      res.json({ success: true });
    } catch (err) {
      console.error('Revoke API key error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  };