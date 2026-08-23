import { User, ApiKey } from '../types/auth';
import { Package, Api } from '../types/package';

// Mock APIs
export const mockApis: Api[] = [
  {
    id: '1',
    name: 'Weather API',
    description: 'Real-time weather data for any location',
    category: 'Weather',
    endpoint: '/api/weather',
    usageLimit: 1000,
  },
  {
    id: '2',
    name: 'Currency Exchange API',
    description: 'Up-to-date currency exchange rates',
    category: 'Finance',
    endpoint: '/api/currency',
    usageLimit: 500,
  },
  {
    id: '3',
    name: 'Stock Market API',
    description: 'Real-time stock market data',
    category: 'Finance',
    endpoint: '/api/stocks',
    usageLimit: 300,
  },
  {
    id: '4',
    name: 'Translation API',
    description: 'Translate text between languages',
    category: 'Language',
    endpoint: '/api/translate',
    usageLimit: 2000,
  },
  {
    id: '5',
    name: 'News API',
    description: 'Latest news from around the world',
    category: 'News',
    endpoint: '/api/news',
    usageLimit: 800,
  },
];

// Mock Packages
export const mockPackages: Package[] = [
  {
    id: '1',
    name: 'Starter',
    description: 'Basic package for small projects',
    price: 29,
    billingCycle: 'monthly',
    apis: [mockApis[0], mockApis[3]],
    features: ['2 API Access', '1,500 API calls monthly', 'Basic Support'],
  },
  {
    id: '2',
    name: 'Business',
    description: 'Enhanced package for growing businesses',
    price: 79,
    billingCycle: 'monthly',
    apis: [mockApis[0], mockApis[1], mockApis[3]],
    features: ['3 API Access', '5,000 API calls monthly', 'Priority Support', 'API Analytics'],
    popular: true,
  },
  {
    id: '3',
    name: 'Enterprise',
    description: 'Complete solution for large enterprises',
    price: 199,
    billingCycle: 'monthly',
    apis: mockApis,
    features: ['All APIs', 'Unlimited API calls', '24/7 Support', 'Advanced Analytics', 'Custom Integration'],
  },
];

// Mock User with subscription
export const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  package: {
    ...mockPackages[1],
    expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
  },
  apiKeys: [
    {
      id: '1',
      key: 'sk_test_abcdef123456789',
      apiId: '1',
      apiName: 'Weather API',
      usageLimit: 1000,
      usageCurrent: 750,
    },
    {
      id: '2',
      key: 'sk_test_ghijkl987654321',
      apiId: '2',
      apiName: 'Currency Exchange API',
      usageLimit: 500,
      usageCurrent: 120,
    },
    {
      id: '3',
      key: 'sk_test_mnopqr456789123',
      apiId: '4',
      apiName: 'Translation API',
      usageLimit: 2000,
      usageCurrent: 1500,
    },
  ],
};

// Mock Auth API
export const mockAuthAPI = {
  login: async (email?: string, phone?: string): Promise<{ token: string; user: User }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          token: 'mock_jwt_token',
          user: mockUser,
        });
      }, 800);
    });
  },
  
  verifyOtp: async (email?: string, phone?: string, otp?: string): Promise<{ token: string; user: User }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          token: 'mock_jwt_token',
          user: mockUser,
        });
      }, 800);
    });
  },
  
  register: async (name: string, email?: string, phone?: string): Promise<{ token: string; user: User }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          token: 'mock_jwt_token',
          user: { ...mockUser, name, email, phone },
        });
      }, 800);
    });
  },
  
  logout: async (): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 300);
    });
  },
  
  getCurrentUser: async (): Promise<User> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockUser);
      }, 500);
    });
  },
};

// Mock Package API
export const mockPackageAPI = {
  getPackages: async (): Promise<Package[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockPackages);
      }, 600);
    });
  },
  
  getPackage: async (id: string): Promise<Package> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const pack = mockPackages.find((p) => p.id === id);
        if (pack) {
          resolve(pack);
        } else {
          reject(new Error('Package not found'));
        }
      }, 400);
    });
  },
};

// Mock APIs API
export const mockApisAPI = {
  getApis: async (): Promise<Api[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockApis);
      }, 600);
    });
  },
  
  getApi: async (id: string): Promise<Api> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const api = mockApis.find((a) => a.id === id);
        if (api) {
          resolve(api);
        } else {
          reject(new Error('API not found'));
        }
      }, 400);
    });
  },
};