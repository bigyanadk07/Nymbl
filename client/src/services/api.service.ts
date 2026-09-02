const API_URL = 'http://localhost:5000';


// ============================================================
// TYPES
// ============================================================

export interface AccessibleApi {

  id: string;

  name: string;

  description?: string;

  category?: string;

  endpoint: string;

  usageLimit: number;

  hasApiKey: boolean;

  apiKey?: {
    id: string;
    createdAt: string;
  };

  pricePerRequest?: number;

  status?: 'active' | 'inactive';

  createdAt?: string;

  rateLimit?: {

    capacity: number;

    refillRate: number;

    leakRate: number;

  };

}


export interface AccessibleApisResponse {

  success: boolean;

  apis: AccessibleApi[];

  message?: string;

}


// ============================================================
// AUTH HEADERS
// ============================================================

const getAuthHeaders = () => {

  const token =
    localStorage.getItem('token');


  return {

    'Content-Type': 'application/json',

    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),

  };

};


// ============================================================
// GET ACCESSIBLE APIS
// ============================================================

export const getAccessibleApis =
  async (): Promise<AccessibleApisResponse> => {

    const response =
      await fetch(
        `${API_URL}/apis/accessible`,
        {
          method: 'GET',
          headers: getAuthHeaders(),
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.message ||
        'Failed to fetch accessible APIs'
      );

    }


    return data;

  };