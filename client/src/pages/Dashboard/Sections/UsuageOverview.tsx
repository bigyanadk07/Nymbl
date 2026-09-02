import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Activity,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Gauge,
  Inbox,
  KeyRound,
  RefreshCw,
  TrendingUp,
  XCircle,
  Zap,
} from 'lucide-react';

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  getUsageOverview,
  type UsageApiEntry,
  type UsageOverviewResponse,
} from '../../../services/usage.service';


// ============================================================
// HELPERS
// ============================================================

type ChartMode = 'cumulative' | 'daily' | 'percent';

const CHART_MODES: Array<{
  id: ChartMode;
  label: string;
  hint: string;
}> = [
  {
    id: 'cumulative',
    label: 'Cumulative',
    hint: 'Requests consumed so far this period, climbing toward the quota.',
  },
  {
    id: 'daily',
    label: 'Per day',
    hint: 'Requests made on each individual day.',
  },
  {
    id: 'percent',
    label: '% of quota',
    hint: 'Quota consumed as a percentage, so APIs with different limits are comparable.',
  },
];

const fmt = (value: number) => value.toLocaleString();

const pct = (value: number) => `${value.toFixed(1)}%`;

const formatAxisDate = (iso: string) => {
  const parts = iso.split('-').map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
    return iso;
  }
  return new Date(parts[0], parts[1] - 1, parts[2])
    .toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
};

const formatDateTime = (value: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const barTone = (percentUsed: number) => {
  if (percentUsed >= 90) return 'bg-[#EF4444]';
  if (percentUsed >= 70) return 'bg-[#F59E0B]';
  return 'bg-[#22C55E]';
};


// ============================================================
// TOOLTIP
// ============================================================

interface TooltipRow {
  value?: number | string | null;
  color?: string;
  name?: string | number;
}

interface UsageTooltipProps {
  active?: boolean;
  label?: string | number;
  payload?: TooltipRow[];
  suffix?: string;
}

const UsageTooltip: React.FC<UsageTooltipProps> = ({
  active,
  label,
  payload,
  suffix,
}) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const rows = payload.filter(
    (row) => row.value !== null && row.value !== undefined
  );

  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-[#E8ECF0] bg-white px-3 py-2 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
      <p className="mb-1.5 text-xs font-semibold text-[#1A1F36]">
        {label}
      </p>
      <div className="space-y-1">
        {rows.map((row, index) => (
          <div
            key={`${row.name ?? index}`}
            className="flex items-center gap-2 text-xs"
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: row.color }}
            />
            <span className="text-[#6B7280]">
              {row.name}
            </span>
            <span className="ml-auto font-medium text-[#1A1F36]">
              {typeof row.value === 'number'
                ? row.value.toLocaleString()
                : row.value}
              {suffix}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};


// ============================================================
// SUMMARY CARD
// ============================================================

interface SummaryCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
  color?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  icon: Icon,
  label,
  value,
  sub,
  color = '#2D5BFF',
}) => (
  <div className="group relative overflow-hidden rounded-xl border border-[#E8ECF0] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(45,91,255,0.08)] hover:border-[#2D5BFF]/20">
    {/* Decorative gradient accent */}
    <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-[#2D5BFF]/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    
    <div className="relative flex items-start gap-4">
      <div className="rounded-lg bg-[#F0F4FF] p-2.5 transition-all duration-300 group-hover:scale-105">
        <Icon className="h-5 w-5 text-[#2D5BFF]" style={{ color }} />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">
          {label}
        </p>
        <p className="mt-1 text-2xl font-semibold text-[#1A1F36]">
          {value}
        </p>
        <p className="mt-0.5 text-xs text-[#6B7280]">
          {sub}
        </p>
      </div>
    </div>
  </div>
);


// ============================================================
// PER-API TABLE
// ============================================================

const ApiUsageTable: React.FC<{ api: UsageApiEntry }> = ({ api }) => {
  const failedPercent =
    api.used > 0
      ? Math.round((api.failed / api.used) * 1000) / 10
      : 0;

  const barWidth = Math.min(Math.max(api.usedPercent, 0), 100);

  const rows = [
    {
      label: 'Used',
      value: api.used,
      percent: api.usedPercent,
      note: 'of quota',
    },
    {
      label: 'Remaining',
      value: api.remaining,
      percent: api.remainingPercent,
      note: 'of quota',
    },
    {
      label: 'Limit',
      value: api.limit,
      percent: api.limit > 0 ? 100 : 0,
      note: 'full quota',
    },
  ];

  return (
    <div className="group overflow-hidden rounded-xl border border-[#E8ECF0] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-[#2D5BFF]/20">
      {/* Header */}
      <div className="border-b border-[#F3F4F6] p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="h-3 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: api.color }}
          />
          <h3 className="text-sm font-semibold text-[#1A1F36]">
            {api.apiName}
          </h3>
          <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-xs font-medium text-[#6B7280]">
            {api.category}
          </span>
          <span className="ml-auto text-xs text-[#6B7280]">
            {api.packageName}
          </span>
        </div>

        <p className="mt-1.5 truncate font-mono text-xs text-[#6B7280]">
          {api.endpoint}
        </p>

        <p className="mt-1 text-xs text-[#6B7280]">
          {formatDateTime(api.periodStart)}
          {' → '}
          {formatDateTime(api.periodEnd)}
        </p>
      </div>

      {/* Progress */}
      <div className="px-5 pt-4">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-medium text-[#6B7280]">
            Consumption
          </span>
          <span className="font-semibold text-[#1A1F36]">
            {fmt(api.used)} / {fmt(api.limit)}
            {' · '}
            {pct(api.usedPercent)}
          </span>
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F3F4F6]">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barTone(api.usedPercent)}`}
            style={{ width: `${barWidth}%` }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="p-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#F3F4F6]">
              <th className="pb-2 text-left text-[10px] font-medium uppercase tracking-wider text-[#6B7280]">
                Metric
              </th>
              <th className="pb-2 text-right text-[10px] font-medium uppercase tracking-wider text-[#6B7280]">
                Requests
              </th>
              <th className="pb-2 text-right text-[10px] font-medium uppercase tracking-wider text-[#6B7280]">
                Percentage
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.label}
                className="border-b border-[#F9FAFB] last:border-0"
              >
                <td className="py-2 text-sm text-[#6B7280]">
                  {row.label}
                </td>
                <td className="py-2 text-right font-semibold tabular-nums text-[#1A1F36]">
                  {fmt(row.value)}
                </td>
                <td className="py-2 text-right tabular-nums text-[#6B7280]">
                  {pct(row.percent)}
                  <span className="ml-1 text-xs text-[#9CA3AF]">
                    {row.note}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Reliability strip */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-[#F3F4F6] pt-3 text-xs">
          <span className="flex items-center gap-1.5 text-[#6B7280]">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#22C55E]" />
            {fmt(api.successful)} successful
            <span className="text-[#9CA3AF]">
              ({pct(api.successRate)})
            </span>
          </span>

          <span className="flex items-center gap-1.5 text-[#6B7280]">
            <XCircle className="h-3.5 w-3.5 text-[#EF4444]" />
            {fmt(api.failed)} failed
            <span className="text-[#9CA3AF]">
              ({pct(failedPercent)})
            </span>
          </span>

          <span className="text-[#6B7280]">
            {api.averageResponseTime} ms avg
          </span>
        </div>

        {!api.hasApiKey && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-[#FFFBEB] p-2.5 text-xs text-[#92400E] border border-[#FDE68A]">
            <KeyRound className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              No API key generated for this API yet, so no requests
              can be recorded against it.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};


// ============================================================
// PAGE
// ============================================================

const UsageOverview: React.FC = () => {
  const [data, setData] =
    useState<UsageOverviewResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<ChartMode>('cumulative');
  const [hidden, setHidden] =
    useState<Record<string, boolean>>({});

  const load = useCallback(async (isRefresh: boolean) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const result = await getUsageOverview();
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load usage data'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load(false);
  }, [load]);

  const apis = data?.apis ?? [];
  const visibleApis = useMemo(
    () => apis.filter((api) => !hidden[api.apiId]),
    [apis, hidden]
  );

  const chartData = useMemo(() => {
    if (!data) return [];

    const lookup = new Map<
      string,
      Map<string, { count: number | null; cumulative: number | null }>
    >();

    data.apis.forEach((api) => {
      const perDate = new Map<
        string,
        { count: number | null; cumulative: number | null }
      >();
      api.daily.forEach((point) => {
        perDate.set(point.date, {
          count: point.count,
          cumulative: point.cumulative,
        });
      });
      lookup.set(api.apiId, perDate);
    });

    return data.window.dates.map((date) => {
      const row: Record<string, string | number | null> = {
        date,
        label: formatAxisDate(date),
      };

      data.apis.forEach((api) => {
        const point = lookup.get(api.apiId)?.get(date);
        if (!point) {
          row[api.apiId] = null;
          return;
        }

        if (mode === 'daily') {
          row[api.apiId] = point.count;
          return;
        }

        if (mode === 'cumulative') {
          row[api.apiId] = point.cumulative;
          return;
        }

        row[api.apiId] =
          point.cumulative === null
            ? null
            : api.limit > 0
              ? Math.round((point.cumulative / api.limit) * 1000) / 10
              : 0;
      });

      return row;
    });
  }, [data, mode]);

  const percentMax = useMemo(() => {
    if (mode !== 'percent') return 0;
    let max = 100;
    visibleApis.forEach((api) => {
      api.daily.forEach((point) => {
        if (point.cumulative !== null && api.limit > 0) {
          max = Math.max(
            max,
            (point.cumulative / api.limit) * 100
          );
        }
      });
    });
    return Math.ceil(max / 10) * 10;
  }, [mode, visibleApis]);

  const activeMode =
    CHART_MODES.find((entry) => entry.id === mode) ?? CHART_MODES[0];

  const totals = data?.totals;

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-56 animate-pulse rounded bg-[#F3F4F6]" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-xl bg-[#F3F4F6]"
            />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-xl bg-[#F3F4F6]" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#EF4444]" />
          <div>
            <h3 className="text-sm font-semibold text-[#991B1B]">
              Could not load usage data
            </h3>
            <p className="mt-1 text-sm text-[#DC2626]">
              {error}
            </p>
            <button
              type="button"
              onClick={() => load(false)}
              className="mt-3 rounded-lg bg-[#EF4444] px-3 py-1.5 text-sm font-medium text-white transition hover:bg-[#DC2626]"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="px-6 py-8 lg:px-10 lg:py-10">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#1A1F36]">
            Usage Logs
          </h1>
          <p className="text-sm text-[#6B7280]">
            API consumption across your active subscriptions
            {data && (
              <>
                {' · '}
                {formatAxisDate(data.window.from)}
                {' – '}
                {formatAxisDate(data.window.to)}
              </>
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={() => load(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 self-start rounded-lg border border-[#E8ECF0] bg-white px-4 py-2 text-sm font-medium text-[#1A1F36] transition-all duration-200 hover:bg-[#F9FAFB] hover:border-[#2D5BFF]/30 disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
          />
          Refresh
        </button>
      </div>

      {/* Empty state */}
      {apis.length === 0 && (
        <div className="rounded-xl border border-[#E8ECF0] bg-white p-12 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <Inbox className="mx-auto h-12 w-12 text-[#D1D5DB]" />
          <h3 className="mt-3 text-sm font-semibold text-[#1A1F36]">
            No active subscriptions
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-[#6B7280]">
            Subscribe to a package to start tracking usage. Each
            API you subscribe to gets its own quota and its own
            line on the chart.
          </p>
        </div>
      )}

      {/* Content */}
      {apis.length > 0 && totals && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              icon={TrendingUp}
              label="Total used"
              value={fmt(totals.used)}
              sub={`${pct(totals.usedPercent)} of combined quota`}
            />
            <SummaryCard
              icon={Activity}
              label="Remaining"
              value={fmt(totals.remaining)}
              sub={`${pct(totals.remainingPercent)} of combined quota`}
              color="#22C55E"
            />
            <SummaryCard
              icon={Zap}
              label="Combined limit"
              value={fmt(totals.limit)}
              sub={`across ${totals.apiCount} ${totals.apiCount === 1 ? 'API' : 'APIs'}`}
              color="#F59E0B"
            />
            <SummaryCard
              icon={Gauge}
              label="Success rate"
              value={pct(totals.successRate)}
              sub={`${fmt(totals.failed)} failed of ${fmt(totals.used)}`}
              color="#8B5CF6"
            />
          </div>

          {/* Chart */}
          <div className="rounded-xl border border-[#E8ECF0] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-[#6B7280]" />
                  <h2 className="text-sm font-semibold text-[#1A1F36]">
                    Usage over the last {data?.window.days ?? 30} days
                  </h2>
                </div>
                <p className="mt-1 text-xs text-[#6B7280]">
                  {activeMode.hint}
                </p>
              </div>

              <div className="inline-flex shrink-0 self-start rounded-lg border border-[#E8ECF0] p-0.5 bg-white">
                {CHART_MODES.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => setMode(entry.id)}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition-all duration-200 ${
                      mode === entry.id
                        ? 'bg-[#2D5BFF] text-white shadow-sm'
                        : 'text-[#6B7280] hover:text-[#1A1F36] hover:bg-[#F9FAFB]'
                    }`}
                  >
                    {entry.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Legend toggles */}
            <div className="mt-4 flex flex-wrap gap-2">
              {apis.map((api) => {
                const isHidden = Boolean(hidden[api.apiId]);
                return (
                  <button
                    key={api.apiId}
                    type="button"
                    onClick={() =>
                      setHidden((prev) => ({
                        ...prev,
                        [api.apiId]: !prev[api.apiId],
                      }))
                    }
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200 ${
                      isHidden
                        ? 'border-[#E8ECF0] text-[#9CA3AF] bg-white hover:bg-[#F9FAFB]'
                        : 'border-[#2D5BFF]/30 text-[#1A1F36] bg-[#F0F4FF] hover:bg-[#E8EEFF]'
                    }`}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: isHidden
                          ? '#D1D5DB'
                          : api.color,
                      }}
                    />
                    {api.apiName}
                  </button>
                );
              })}
            </div>

            {mode === 'cumulative' && visibleApis.length > 1 && (
              <p className="mt-2 text-xs text-[#9CA3AF]">
                Leave a single API visible to see its quota line.
              </p>
            )}

            {/* Chart */}
            <div className="mt-4 h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 12, right: 16, bottom: 4, left: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#F3F4F6"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: '#9CA3AF' }}
                    minTickGap={24}
                    axisLine={{ stroke: '#E8ECF0' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#9CA3AF' }}
                    axisLine={false}
                    tickLine={false}
                    width={52}
                    allowDecimals={false}
                    domain={
                      mode === 'percent' ? [0, percentMax] : undefined
                    }
                    tickFormatter={(value: number) =>
                      mode === 'percent'
                        ? `${value}%`
                        : value.toLocaleString()
                    }
                  />
                  <Tooltip
                    content={
                      <UsageTooltip
                        suffix={mode === 'percent' ? '%' : ''}
                      />
                    }
                  />
                  {mode === 'percent' && (
                    <ReferenceLine
                      y={100}
                      stroke="#EF4444"
                      strokeDasharray="4 4"
                      label={{
                        value: 'Quota',
                        position: 'insideTopRight',
                        fill: '#EF4444',
                        fontSize: 11,
                      }}
                    />
                  )}
                  {mode === 'cumulative' &&
                    visibleApis.length === 1 &&
                    visibleApis[0].limit > 0 && (
                      <ReferenceLine
                        y={visibleApis[0].limit}
                        stroke={visibleApis[0].color}
                        strokeDasharray="4 4"
                        label={{
                          value: `Quota ${fmt(visibleApis[0].limit)}`,
                          position: 'insideTopRight',
                          fill: visibleApis[0].color,
                          fontSize: 11,
                        }}
                      />
                    )}
                  {visibleApis.map((api) => (
                    <Line
                      key={api.apiId}
                      type="monotone"
                      dataKey={api.apiId}
                      name={api.apiName}
                      stroke={api.color}
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, strokeWidth: 2 }}
                      connectNulls={false}
                      isAnimationActive={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Per-API tables */}
          <div>
            <h2 className="mb-3 text-sm font-semibold text-[#1A1F36]">
              Per-API breakdown
            </h2>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {apis.map((api) => (
                <ApiUsageTable key={api.apiId} api={api} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UsageOverview;