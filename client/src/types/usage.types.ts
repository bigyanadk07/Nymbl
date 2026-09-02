
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
  breakdown: UsageBreakdown[];
  period: UsagePeriod;
}
