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



// ============================================================
// USAGE OVERVIEW TYPES
// ============================================================

export interface UsageDailyPoint {
  date: string;                 // "YYYY-MM-DD" in Asia/Kathmandu
  count: number | null;         // null = outside the subscription period
  cumulative: number | null;    // running total within the period
}

export interface UsageApiEntry {
  apiId: string;
  apiName: string;
  category: string;
  endpoint: string;

  packageId: string;
  packageName: string;
  subscriptionId: string;

  periodStart: string | null;
  periodEnd: string | null;

  limit: number;
  used: number;
  remaining: number;
  usedPercent: number;
  remainingPercent: number;

  successful: number;
  failed: number;
  successRate: number;
  averageResponseTime: number;

  hasApiKey: boolean;
  activeKeyCount: number;

  color: string;

  daily: UsageDailyPoint[];
}

export interface UsageOverviewTotals {
  apiCount: number;
  used: number;
  limit: number;
  remaining: number;
  usedPercent: number;
  remainingPercent: number;
  successful: number;
  failed: number;
  successRate: number;
}

export interface UsageOverviewWindow {
  from: string;
  to: string;
  days: number;
  dates: string[];
}

export interface UsageOverviewResponse {
  success: boolean;
  timezone: string;
  window: UsageOverviewWindow;
  totals: UsageOverviewTotals;
  apis: UsageApiEntry[];
  message?: string;
}


// ============================================================
// GET USAGE OVERVIEW
// ============================================================
//
// GET /usage/overview
//
// No query params: the server decides the 30-day window and
// reads each subscription period off the database.
//
// ============================================================

export const getUsageOverview =
  async (): Promise<UsageOverviewResponse> => {

    const response = await fetch(
      `${API_URL}/usage/overview`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
        'Failed to fetch usage overview'
      );
    }

    return data;

  };
