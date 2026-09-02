import React from 'react';

interface UsageOverviewProps {
  used: number;
  limit: number;
  periodStart?: string;
  periodEnd?: string;
}

const UsageOverview: React.FC<UsageOverviewProps> = ({
  used,
  limit,
  periodStart,
  periodEnd,
}) => {
  const safeLimit = Math.max(limit, 0);
  const safeUsed = Math.max(used, 0);

  const remaining = Math.max(
    safeLimit - safeUsed,
    0
  );

  const percentage =
    safeLimit > 0
      ? Math.min(
          (safeUsed / safeLimit) * 100,
          100
        )
      : 0;

  const formatDate = (date?: string) => {
    if (!date) return '—';

    return new Date(date).toLocaleDateString(
      undefined,
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }
    );
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">

      {/* Header */}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Usage Overview
          </h2>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            API consumption during the current subscription period
          </p>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          {formatDate(periodStart)}
          {' → '}
          {formatDate(periodEnd)}
        </div>

      </div>


      {/* Usage numbers */}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Used
          </p>

          <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
            {safeUsed.toLocaleString()}
          </p>
        </div>


        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Remaining
          </p>

          <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
            {remaining.toLocaleString()}
          </p>
        </div>


        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Limit
          </p>

          <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
            {safeLimit.toLocaleString()}
          </p>
        </div>

      </div>


      {/* Progress bar */}

      <div className="mt-6">

        <div className="mb-2 flex items-center justify-between text-sm">

          <span className="text-gray-500 dark:text-gray-400">
            Consumption
          </span>

          <span className="font-medium text-gray-900 dark:text-white">
            {percentage.toFixed(1)}%
          </span>

        </div>


        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">

          <div
            className="h-full rounded-full bg-gray-900 transition-all duration-500 dark:bg-white"
            style={{
              width: `${percentage}%`,
            }}
          />

        </div>

      </div>

    </div>
  );
};

export default UsageOverview;
