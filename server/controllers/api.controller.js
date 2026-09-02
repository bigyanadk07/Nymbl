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
      const subscriptions = await Subscription.find({
        userId: req.user._id,
        status: 'active'
      }).populate({
        path: 'packageId',
        populate: { path: 'apis' }
      });

      // Which APIs the user may access through active subscriptions
      const accessibleApiIds = new Set();

      subscriptions.forEach(subscription => {
        // Guard: package may have been deleted -> populate returns null
        if (!subscription.packageId || !Array.isArray(subscription.packageId.apis)) {
          return;
        }

        subscription.packageId.apis.forEach(api => {
          if (api) {
            accessibleApiIds.add(api._id.toString());
          }
        });
      });

      const apiKeys = await ApiKey.find({
        userId: req.user._id,
        isActive: true
      }).populate('apiId');

      // Guard `key.apiId` too: a deleted API populates to null and would throw
      const validApiKeys = apiKeys.filter(key =>
        key.apiId && accessibleApiIds.has(key.apiId._id.toString())
      );

      return res.json({
        success: true,
        data: validApiKeys.map(key => ({
          id: key._id,
          key: key.key,
          apiId: key.apiId._id,          // flat apiId — the frontend indexes by this
          userId: key.userId,
          isActive: key.isActive,
          createdAt: key.createdAt,
          api: {
            id: key.apiId._id,
            name: key.apiId.name,
            endpoint: key.apiId.endpoint,
            category: key.apiId.category
          }
        }))
      });
    } catch (err) {
      console.error('Get API keys error:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
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
        return res.status(400).json({ success: false, message: 'API ID is required' });
      }

      const api = await Api.findById(apiId);

      if (!api) {
        return res.status(404).json({ success: false, message: 'API not found' });
      }

      const subscriptions = await Subscription.find({
        userId: req.user._id,
        status: 'active'
      }).populate({
        path: 'packageId',
        populate: { path: 'apis' }
      });

      let hasAccess = false;

      subscriptions.forEach(subscription => {
        if (!subscription.packageId || !Array.isArray(subscription.packageId.apis)) {
          return;
        }

        subscription.packageId.apis.forEach(subscriptionApi => {
          if (subscriptionApi && subscriptionApi._id.toString() === apiId.toString()) {
            hasAccess = true;
          }
        });
      });

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'You do not have an active subscription that includes this API'
        });
      }

      // Single shaper so both branches return an identical payload
      const shape = (doc) => ({
        id: doc._id,
        key: doc.key,
        apiId: api._id,
        userId: doc.userId,
        isActive: doc.isActive,
        createdAt: doc.createdAt,
        api: {
          id: api._id,
          name: api.name,
          endpoint: api.endpoint,
          category: api.category
        }
      });

      const existingKey = await ApiKey.findOne({
        userId: req.user._id,
        apiId,
        isActive: true
      });

      if (existingKey) {
        return res.json({
          success: true,
          message: 'Existing API key returned',
          apiKey: shape(existingKey)
        });
      }

      const apiKey = new ApiKey({
        userId: req.user._id,
        apiId,
        key: apiKeyGenerator.generateApiKey()
      });

      await apiKey.save();

      return res.status(201).json({
        success: true,
        message: 'API key generated successfully',
        apiKey: shape(apiKey)
      });
    } catch (err) {
      console.error('Generate API key error:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
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