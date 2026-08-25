import { useEffect, useState } from 'react';

import {
  ArrowUpRight,
  Check,
  CircleDot,
  Copy,
  KeyRound,
  MoreHorizontal,
  Server,
  XCircle,
} from 'lucide-react';

import { Link } from 'react-router-dom';

import {
  getApiKeys,
  type ApiKey,
} from '../../services/apiKey.service';

// ============================================================
// Dashboard
// ============================================================

const Dashboard = () => {
  // ==========================================================
  // State
  // ==========================================================

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // ==========================================================
  // Fetch API Keys
  // ==========================================================

  useEffect(() => {
    const loadApiKeys = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getApiKeys();

        setApiKeys(data);
      } catch (error) {
        console.error('Failed to load API keys:', error);

        setError(
          error instanceof Error
            ? error.message
            : 'Failed to load API keys'
        );
      } finally {
        setLoading(false);
      }
    };

    loadApiKeys();
  }, []);

  // ==========================================================
  // Copy API Key
  // ==========================================================

  const handleCopyKey = async (
    key: string,
    keyId: string
  ) => {
    try {
      await navigator.clipboard.writeText(key);

      setCopiedKeyId(keyId);

      setTimeout(() => {
        setCopiedKeyId(null);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy API key:', error);
    }
  };

  // ==========================================================
  // Render
  // ==========================================================

  return (
    <div className="min-h-screen bg-slate-50/80 px-4 py-6 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-7xl">

        {/* ==================================================
            Back Navigation
        ================================================== */}

        <div className="mb-10">

          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-700 transition-colors group"
          >

            <span className="group-hover:-translate-x-0.5 transition-transform">
              ←
            </span>

            Back Home

          </Link>

        </div>


        {/* ==================================================
            Header
        ================================================== */}

        <div className="mb-10">

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

            <div>

              <div className="flex items-center gap-3 mb-2">

                <div className="h-8 w-1 bg-gradient-to-b from-indigo-500 to-cyan-500 rounded-full" />

                <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                  Dashboard
                </p>

              </div>

              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
                API Overview
              </h1>

              <p className="mt-2 text-sm text-slate-500 max-w-2xl">
                Manage your API access and credentials across your active subscriptions.
              </p>

            </div>


            {/* System Status */}

            <div className="flex items-center gap-3">

              <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm">

                <CircleDot className="h-3 w-3 text-emerald-500 fill-emerald-500" />

                <span className="text-sm font-medium text-slate-700">
                  All systems operational
                </span>

              </div>

            </div>

          </div>

        </div>


        {/* ==================================================
            API Access Summary
        ================================================== */}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-6">

          {/* Active APIs */}

          <div className="bg-white border border-slate-200 rounded-xl p-6">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm font-medium text-slate-400">
                  Active APIs
                </p>

                <p className="mt-3 text-3xl font-bold text-slate-900 tracking-tight">
                  {apiKeys.length}
                </p>

              </div>

              <div className="p-3 bg-cyan-50 rounded-lg">

                <Server className="h-5 w-5 text-cyan-500" />

              </div>

            </div>

            <p className="mt-4 text-xs text-slate-400">
              APIs currently available through your subscriptions.
            </p>

          </div>


          {/* API Keys */}

          <div className="bg-white border border-slate-200 rounded-xl p-6">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm font-medium text-slate-400">
                  API Keys
                </p>

                <p className="mt-3 text-3xl font-bold text-slate-900 tracking-tight">
                  {apiKeys.length}
                </p>

              </div>

              <div className="p-3 bg-indigo-50 rounded-lg">

                <KeyRound className="h-5 w-5 text-indigo-500" />

              </div>

            </div>

            <p className="mt-4 text-xs text-slate-400">
              Active credentials assigned to your account.
            </p>

          </div>


          {/* API Access */}

          <div className="bg-white border border-slate-200 rounded-xl p-6">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm font-medium text-slate-400">
                  API Access
                </p>

                <p className="mt-3 text-3xl font-bold text-slate-900 tracking-tight">
                  {apiKeys.length > 0 ? 'Active' : 'None'}
                </p>

              </div>

              <div className="p-3 bg-emerald-50 rounded-lg">

                <CircleDot className="h-5 w-5 text-emerald-500 fill-emerald-500" />

              </div>

            </div>

            <p className="mt-4 text-xs text-slate-400">
              Current API access status.
            </p>

          </div>

        </div>


        {/* ==================================================
            Your APIs
        ================================================== */}

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">

          {/* Section Header */}

          <div className="border-b border-slate-100 px-7 py-6">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <h2 className="text-base font-semibold text-slate-900">
                  Your APIs
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  APIs available through your active subscriptions.
                </p>

              </div>

              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors group"
              >

                Manage API access

                <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />

              </button>

            </div>

          </div>


          {/* ==================================================
              API List
          ================================================== */}

          <div className="divide-y divide-slate-50">

            {/* Loading */}

            {loading && (

              <div className="px-7 py-12 text-center">

                <div className="inline-flex items-center gap-2 text-sm text-slate-500">

                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-500" />

                  Loading your APIs...

                </div>

              </div>

            )}


            {/* Error */}

            {!loading && error && (

              <div className="px-7 py-12 text-center">

                <XCircle className="mx-auto h-7 w-7 text-rose-500" />

                <p className="mt-3 text-sm font-medium text-slate-700">
                  Unable to load your APIs
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {error}
                </p>

              </div>

            )}


            {/* No APIs */}

            {!loading &&
              !error &&
              apiKeys.length === 0 && (

                <div className="px-7 py-12 text-center">

                  <Server className="mx-auto h-8 w-8 text-slate-300" />

                  <p className="mt-3 text-sm font-medium text-slate-700">
                    No API access yet
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Subscribe to a package to access APIs.
                  </p>

                </div>

              )}


            {/* Real APIs */}

            {!loading &&
              !error &&
              apiKeys.map((apiKey) => {

                const isCopied = copiedKeyId === apiKey.id;

                return (

                  <div
                    key={apiKey.id}
                    className="px-7 py-6 hover:bg-slate-50/50 transition-colors"
                  >

                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">


                      {/* ==================================================
                          API Information
                      ================================================== */}

                      <div className="flex items-start gap-4 min-w-0">

                        {/* Icon */}

                        <div className="flex-shrink-0 p-3 bg-gradient-to-br from-indigo-50 to-cyan-50 rounded-xl">

                          <Server className="h-5 w-5 text-indigo-500" />

                        </div>


                        {/* Details */}

                        <div className="min-w-0">

                          <div className="flex flex-wrap items-center gap-2.5">

                            <h3 className="font-semibold text-slate-900">
                              {apiKey.api.name}
                            </h3>


                            {/* Category */}

                            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded">

                              {apiKey.api.category}

                            </span>


                            {/* Status */}

                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded">

                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                              Active

                            </span>

                          </div>


                          {/* Endpoint + API Key */}

                          <div className="mt-3 flex flex-wrap items-center gap-3">


                            {/* Endpoint */}

                            <span className="font-mono text-xs bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200 text-slate-500">

                              {apiKey.api.endpoint}

                            </span>


                            {/* API Key */}

                            <div className="inline-flex items-center gap-2 text-xs font-mono bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200">

                              <KeyRound className="h-3 w-3 text-slate-400" />

                              <span>
                                {apiKey.key.substring(0, 8)}••••••••
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  handleCopyKey(
                                    apiKey.key,
                                    apiKey.id
                                  )
                                }
                                className="ml-1 inline-flex items-center gap-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                                title="Copy API key"
                              >

                                {isCopied ? (
                                  <>
                                    <Check className="h-3.5 w-3.5 text-emerald-500" />

                                    <span className="font-sans text-xs text-emerald-600">
                                      Copied
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3.5 w-3.5" />

                                    <span className="font-sans text-xs">
                                      Copy
                                    </span>
                                  </>
                                )}

                              </button>

                            </div>

                          </div>


                          {/* Created Date */}

                          <p className="mt-2 text-xs text-slate-400">

                            API key created{' '}

                            {new Date(
                              apiKey.createdAt
                            ).toLocaleDateString()}

                          </p>

                        </div>

                      </div>


                      {/* ==================================================
                          API Status
                      ================================================== */}

                      <div className="flex items-center gap-8 xl:gap-12">

                        <div>

                          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Status
                          </p>

                          <p className="mt-1 text-sm font-medium text-emerald-600">
                            Active
                          </p>

                        </div>


                        <button
                          type="button"
                          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                        >

                          <MoreHorizontal className="h-4 w-4 text-slate-400" />

                        </button>

                      </div>

                    </div>

                  </div>

                );
              })}

          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;