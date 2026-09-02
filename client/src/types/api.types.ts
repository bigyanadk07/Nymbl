
export interface ApiRateLimit {
  capacity: number;
  refillRate: number;
  leakRate: number;
}

export interface Api {
  id: string;
  name: string;
  description?: string;
  category?: string;
  endpoint: string;
  pricePerRequest?: number;
  usageLimit: number;

  rateLimit?: ApiRateLimit;

  status: 'active' | 'inactive';

  createdAt: string;
}

