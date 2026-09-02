import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Activity,
  Gauge,
  TrendingUp,
  XCircle,
  Zap,
  Layers,
} from 'lucide-react';

import StatCard from './StatCard';

import {
  getUsageStats,
} from '../../services/usage.service';

import type {
  UsageStats,
} from '../../types/usage.types';


// ============================================================
// HELPERS
// ============================================================

const getPeriodDates = () => {

  const now = new Date();

  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  );

  const end = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  );

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };

};


// ============================================================
// DASHBOARD
// ============================================================

const Dashboard: React.FC = () => {

  const [usage, setUsage] =
    useState<UsageStats | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);


  // ==========================================================
  // FETCH DASHBOARD DATA
  // ==========================================================

  useEffect(() => {

    const loadDashboard = async () => {

      try {

        setLoading(true);
        setError(null);

        const {
          start,
          end,
        } = getPeriodDates();

        const response =
          await getUsageStats(
            start,
            end
          );

        setUsage(response);

      } catch (err) {

        console.error(
          'Dashboard usage error:',
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load dashboard data'
        );

      } finally {

        setLoading(false);

      }

    };

    loadDashboard();

  }, []);


  // ==========================================================
  // CALCULATED METRICS
  // ==========================================================

  const metrics = useMemo(() => {

    if (!usage) {

      return {
        total: 0,
        limit: 0,
        remaining: 0,
        usagePercentage: 0,
        activeDays: 0,
      };

    }


    const total =
      usage.total || 0;

    const limit =
      usage.limit || 0;

    const remaining =
      Math.max(
        usage.remaining ??
        limit - total,
        0
      );


    // --------------------------------------------------------
    // USAGE PERCENTAGE
    // --------------------------------------------------------

    const usagePercentage =
      limit > 0
        ? Math.min(
            Math.round(
              (total / limit) * 100
            ),
            100
          )
        : 0;


    // --------------------------------------------------------
    // ACTIVE DAYS
    // --------------------------------------------------------

    const activeDays =
      usage.breakdown?.filter(
        item =>
          item.count > 0
      ).length || 0;


    return {

      total,

      limit,

      remaining,

      usagePercentage,

      activeDays,

    };

  }, [usage]);


  // ==========================================================
  // LOADING STATE
  // ==========================================================

  if (loading) {

    return (

      <div className="min-h-screen bg-[#FAFBFB] px-6 py-8 lg:px-10 lg:py-10">

        <div className="mx-auto max-w-7xl">

          {/* Header */}

          <div className="mb-12">

            <div className="h-8 w-64 animate-pulse rounded-lg bg-[#E8EAED]" />

            <div className="mt-3 h-4 w-96 animate-pulse rounded-lg bg-[#E8EAED]" />

          </div>


          {/* Stats */}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">

            {Array.from({
              length: 3,
            }).map((_, index) => (

              <div
                key={index}
                className="h-40 animate-pulse rounded-2xl border border-[#E8EAED] bg-white shadow-sm"
              />

            ))}

          </div>


          {/* Main content */}

          <div className="mt-8 grid grid-cols-1 gap-6">

            <div className="h-[400px] animate-pulse rounded-2xl border border-[#E8EAED] bg-white shadow-sm" />

          </div>

        </div>

      </div>

    );

  }


  // ==========================================================
  // ERROR STATE
  // ==========================================================

  if (error) {

    return (

      <div className="min-h-screen bg-[#FAFBFB] px-6 py-8 lg:px-10 lg:py-10">

        <div className="mx-auto max-w-7xl">

          <div className="rounded-2xl border border-[#FDE8E8] bg-[#FEF6F6] p-8 shadow-sm">

            <div className="flex items-start gap-4">

              <div className="rounded-full bg-[#FEE2E2] p-2">

                <XCircle
                  size={24}
                  className="text-[#DC2626]"
                />

              </div>

              <div>

                <h3 className="text-lg font-semibold text-[#1A1A2E]">
                  Unable to load dashboard
                </h3>

                <p className="mt-1 text-[#DC2626]">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    window.location.reload()
                  }
                  className="mt-4 rounded-lg bg-[#1A1A2E] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#2A2A4E]"
                >
                  Try again
                </button>

              </div>

            </div>

          </div>

        </div>

      </div>

    );

  }


  // ==========================================================
  // MAIN DASHBOARD
  // ==========================================================

  return (

    <div className="min-h-screen bg-[#FAFBFB] px-6 py-8 lg:px-10 lg:py-10">

      <div className="mx-auto max-w-7xl">


        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">

          <div>

            <div className="flex items-center gap-3">

              <div className="rounded-lg bg-[#0E9594] p-1.5">

                <Zap
                  size={18}
                  className="text-white"
                />

              </div>

              <span className="text-xs font-medium uppercase tracking-wider text-[#0E9594]">
                Dashboard Overview
              </span>

              <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-medium text-emerald-700">

                <span className="relative flex h-1.5 w-1.5">

                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />

                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />

                </span>

                Active

              </span>

            </div>


            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#1A1A2E] sm:text-4xl">
              Dashboard
            </h1>


            <p className="mt-1.5 text-sm text-[#6B7280]">
              Monitor your API usage, consumption,
              and subscription resources.
            </p>

          </div>

        </div>


        {/* ==================================================
            KEY METRICS
        ================================================== */}

        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">


          {/* TOTAL API CALLS */}

          <StatCard
            title="Total API Calls"
            value={metrics.total.toLocaleString()}
            subtitle="Current period"
            icon={
              <Activity
                size={20}
                className="text-[#0E9594]"
              />
            }
          />


          {/* REMAINING CALLS */}

          <StatCard
            title="Remaining Calls"
            value={metrics.remaining.toLocaleString()}
            subtitle={`of ${metrics.limit.toLocaleString()}`}
            icon={
              <Gauge
                size={20}
                className="text-[#0E9594]"
              />
            }
            progress={
              metrics.usagePercentage
            }
          />


          {/* TOTAL LIMIT */}

          <StatCard
            title="Total Limit"
            value={metrics.limit.toLocaleString()}
            subtitle="Requests available per subscription"
            icon={
              <Gauge
                size={20}
                className="text-[#0E9594]"
              />
            }
          />

        </div>


        {/* ==================================================
            USAGE SUMMARY
        ================================================== */}

        <div className="grid grid-cols-1 gap-6">

          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">

            <div className="mb-5 flex items-center justify-between">

              <div>

                <h3 className="text-sm font-semibold text-[#1A1A2E]">
                  Usage Summary
                </h3>

                <p className="mt-1 text-xs text-[#6B7280]">
                  Current billing period
                </p>

              </div>

              <Layers
                size={18}
                className="text-[#0E9594]"
              />

            </div>


            <div className="space-y-5">


              {/* USED */}

              <div>

                <div className="flex items-center justify-between">

                  <span className="text-sm text-[#6B7280]">
                    Used
                  </span>

                  <span className="text-sm font-semibold text-[#1A1A2E]">
                    {metrics.total.toLocaleString()}
                  </span>

                </div>

              </div>


              {/* LIMIT */}

              <div>

                <div className="flex items-center justify-between">

                  <span className="text-sm text-[#6B7280]">
                    Limit
                  </span>

                  <span className="text-sm font-semibold text-[#1A1A2E]">
                    {metrics.limit.toLocaleString()}
                  </span>

                </div>

              </div>


              {/* REMAINING */}

              <div>

                <div className="flex items-center justify-between">

                  <span className="text-sm text-[#6B7280]">
                    Remaining
                  </span>

                  <span className="text-sm font-semibold text-[#0E9594]">
                    {metrics.remaining.toLocaleString()}
                  </span>

                </div>

              </div>


              {/* ACTIVE DAYS */}

              <div className="border-t border-[#E5E7EB] pt-5">

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-2">

                    <TrendingUp
                      size={15}
                      className="text-[#0E9594]"
                    />

                    <span className="text-sm text-[#6B7280]">
                      Active days
                    </span>

                  </div>

                  <span className="text-sm font-semibold text-[#1A1A2E]">
                    {metrics.activeDays}
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

};

export default Dashboard;