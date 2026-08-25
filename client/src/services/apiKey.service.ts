const API_URL = 'http://localhost:5000';

// ============================================================
// Types
// ============================================================

export interface ApiKeyApi {
  id: string;
  name: string;
  endpoint: string;
  category: string;
}

export interface ApiKey {
  id: string;
  key: string;
  api: ApiKeyApi;
  createdAt: string;
}

export interface AccessibleApi {
  id: string;
  name: string;
  description: string;
  category: string;
  endpoint: string;
  usageLimit: number;

  hasApiKey: boolean;

  apiKey: {
    id: string;
    createdAt: string;
  } | null;
}

export interface AccessibleApisResponse {
  success: boolean;
  apis: AccessibleApi[];
}

// ============================================================
// Get APIs accessible through active subscriptions
// ============================================================

export const getAccessibleApis = async (): Promise<AccessibleApi[]> => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Authentication token not found');
  }

  const response = await fetch(`${API_URL}/apis/accessible`, {
    method: 'GET',

    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.message || 'Failed to fetch accessible APIs'
    );
  }

  const data: AccessibleApisResponse = await response.json();

  return data.apis;
};

// ============================================================
// Get User API Keys
// ============================================================

export const getApiKeys = async (): Promise<ApiKey[]> => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Authentication token not found');
  }

  const response = await fetch(`${API_URL}/apis/keys`, {
    method: 'GET',

    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.message || 'Failed to fetch API keys'
    );
  }

  return response.json();
};

// ============================================================
// Generate API Key
// ============================================================

export const generateApiKey = async (
  apiId: string
): Promise<ApiKey> => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Authentication token not found');
  }

  const response = await fetch(`${API_URL}/apis/keys`, {
    method: 'POST',

    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },

    body: JSON.stringify({
      apiId,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.message || 'Failed to generate API key'
    );
  }

  return response.json();
};

// ============================================================
// Revoke API Key
// ============================================================

export const revokeApiKey = async (
  keyId: string
): Promise<void> => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Authentication token not found');
  }

  const response = await fetch(
    `${API_URL}/apis/keys/${keyId}`,
    {
      method: 'DELETE',

      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.message || 'Failed to revoke API key'
    );
  }
};