const API_URL = 'http://localhost:5000';

export interface ApiKey {
  id: string;
  key: string;
  apiId: string;
  userId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  expiresAt?: string | null;
}

export interface GenerateApiKeyResponse {
  success: boolean;
  message?: string;
  apiKey?: ApiKey;
}

export interface ApiKeysResponse {
  success: boolean;
  data?: ApiKey[];
  message?: string;
}

export interface RevokeApiKeyResponse {
  success: boolean;
  message?: string;
}

export interface UpdateApiKeyStatusResponse {
  success: boolean;
  message?: string;
  apiKey?: ApiKey;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');

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
// GET USER API KEYS
// ============================================================

export const getApiKeys = async (): Promise<ApiKeysResponse> => {
  const response = await fetch(
    `${API_URL}/apis/keys`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || 'Failed to fetch API keys'
    );
  }

  return data;
};


// ============================================================
// GENERATE API KEY
// ============================================================

export const generateApiKey = async (
  apiId: string
): Promise<GenerateApiKeyResponse> => {
  const response = await fetch(
    `${API_URL}/apis/keys`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        apiId,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || 'Failed to generate API key'
    );
  }

  return data;
};


// ============================================================
// REVOKE API KEY
// ============================================================

export const revokeApiKey = async (
  apiKeyId: string
): Promise<RevokeApiKeyResponse> => {
  const response = await fetch(
    `${API_URL}/apis/keys/${apiKeyId}`,
    {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || 'Failed to revoke API key'
    );
  }

  return data;
};


// ============================================================
// ACTIVATE / DEACTIVATE API KEY
// ============================================================

export const updateApiKeyStatus = async (
  apiKeyId: string,
  isActive: boolean
): Promise<UpdateApiKeyStatusResponse> => {
  const response = await fetch(
    `${API_URL}/apis/keys/${apiKeyId}/status`,
    {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        isActive,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || 'Failed to update API key status'
    );
  }

  return data;
};