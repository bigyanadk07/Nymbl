export interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  apis: Api[];
  features: string[];
  popular?: boolean;
  expiresAt?: string;
}

export interface Api {
  id: string;
  name: string;
  description: string;
  category: string;
  endpoint: string;
  usageLimit: number;
}