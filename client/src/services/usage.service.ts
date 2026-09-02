const API_URL = 'http://localhost:5000';

// ============================================================
// TYPES
// ============================================================

export interface UsageBreakdown {
date: string;
count: number;
}

export interface UsagePeriod {
from: string;
to: string;
}

export interface UsageStats {
total: number;
limit: number;
remaining: number;

successful: number;
failed: number;

averageResponseTime: number;

breakdown: UsageBreakdown[];

period: UsagePeriod;
}

export interface UsageStatsResponse {
success?: boolean;

total: number;
limit: number;
remaining: number;

successful: number;
failed: number;

averageResponseTime: number;

breakdown: UsageBreakdown[];

period: UsagePeriod;

message?: string;
}

// ============================================================
// AUTH HEADERS
// ============================================================

const getAuthHeaders = () => {

const token =
localStorage.getItem('token');

return {


'Content-Type':
  'application/json',

...(token
  ? {
      Authorization:
        `Bearer ${token}`,
    }
  : {}),

};

};

// ============================================================
// GET USAGE STATISTICS
// ============================================================
//
// GET /usage/stats
//
// Optional:
//
// ?apiId=<API_ID>
//
// Required:
//
// ?from=<DATE>
// &to=<DATE>
//
// ============================================================

export const getUsageStats = async (
from: string,
to: string,
apiId?: string
): Promise<UsageStatsResponse> => {

const params =
new URLSearchParams();

params.append(
'from',
from
);

params.append(
'to',
to
);

if (apiId) {


params.append(
  'apiId',
  apiId
);


}

const response =
await fetch(
`${API_URL}/usage/stats?${params.toString()}`,
{
method: 'GET',


    headers:
      getAuthHeaders(),
  }
);


const data =
await response.json();

if (!response.ok) {

throw new Error(
  data.message ||
  'Failed to fetch usage statistics'
);


}

return data;

};
