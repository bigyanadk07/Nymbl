import React, {
  useEffect,
  useState,
} from 'react';

import {
  Check,
  Copy,
  KeyRound,
  Loader2,
  Server,
  XCircle,
} from 'lucide-react';

import ApiTokenCard from '../ApiTokenCard';

import {
  getApiKeys,
  generateApiKey,
  type ApiKey,
} from '../../../services/apiKey.service';

import {
  getAccessibleApis,
  type AccessibleApi,
} from '../../../services/api.service';


// ============================================================
// API TOKENS
// ============================================================

const ApiTokens: React.FC = () => {

  // ==========================================================
  // STATE
  // ==========================================================

  // APIs available through active subscriptions.
  //
  // This is the primary list displayed on this page.
  const [accessibleApis, setAccessibleApis] =
    useState<AccessibleApi[]>([]);


  // Actual generated API keys.
  //
  // Keyed by API ID so we can easily determine whether
  // a particular accessible API already has a key.
  const [keysByApiId, setKeysByApiId] =
    useState<Record<string, ApiKey>>({});


  const [loading, setLoading] =
    useState(true);


  const [error, setError] =
    useState<string | null>(null);


  const [generateError, setGenerateError] =
    useState<string | null>(null);


  const [generatingApiId, setGeneratingApiId] =
    useState<string | null>(null);


  const [copiedKeyId, setCopiedKeyId] =
    useState<string | null>(null);


  // ==========================================================
  // LOAD DATA
  // ==========================================================

  const loadData = async () => {

    try {

      setLoading(true);

      setError(null);

      setGenerateError(null);


      // ------------------------------------------------------
      // Fetch both:
      //
      // 1. APIs accessible through subscriptions
      // 2. API keys that have actually been generated
      //
      // ------------------------------------------------------

      const [
        accessibleResponse,
        apiKeysResponse,
      ] = await Promise.all([

        getAccessibleApis(),

        getApiKeys(),

      ]);


      // ------------------------------------------------------
      // Accessible APIs
      // ------------------------------------------------------

      setAccessibleApis(
        accessibleResponse.apis || []
      );


      // ------------------------------------------------------
      // Convert API keys into:
      //
      // {
      //   apiId: ApiKey
      // }
      //
      // This makes lookup very easy while rendering.
      // ------------------------------------------------------

      const keyMap: Record<string, ApiKey> = {};


      (
        apiKeysResponse.data || []
      ).forEach((apiKey) => {

        keyMap[apiKey.apiId] =
          apiKey;

      });


      setKeysByApiId(keyMap);


    } catch (err) {

      console.error(
        'Failed to load API tokens:',
        err
      );


      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load API tokens.'
      );


    } finally {

      setLoading(false);

    }

  };


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {

    loadData();

  }, []);


  // ==========================================================
  // GENERATE API KEY
  // ==========================================================

  const handleGenerateKey = async (
    apiId: string
  ) => {

    try {

      setGeneratingApiId(apiId);

      setGenerateError(null);


      const response =
        await generateApiKey(apiId);


      // ------------------------------------------------------
      // Backend returns:
      //
      // {
      //   success: true,
      //   apiKey: {...}
      // }
      //
      // ------------------------------------------------------

      if (!response.apiKey) {

        throw new Error(
          'API key was not returned by the server'
        );

      }


      const newKey =
        response.apiKey;


      // ------------------------------------------------------
      // Store generated key
      // ------------------------------------------------------

      setKeysByApiId((previous) => ({

        ...previous,

        [apiId]:
          newKey,

      }));


    } catch (err) {

      console.error(
        'Failed to generate API key:',
        err
      );


      setGenerateError(

        err instanceof Error
          ? err.message
          : 'Failed to generate API key'

      );


    } finally {

      setGeneratingApiId(null);

    }

  };


  // ==========================================================
  // COPY API KEY
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


    } catch (err) {

      console.error(
        'Failed to copy API key:',
        err
      );

    }

  };


  // ==========================================================
  // DERIVED COUNTS
  // ==========================================================

  const activeApisCount =
    accessibleApis.length;


  const generatedKeysCount =
    accessibleApis.filter(
      (api) =>
        Boolean(
          keysByApiId[api.id]
        )
    ).length;


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {

    return (

      <div className="min-h-screen bg-gray-50">

        <div className="mx-auto max-w-7xl px-6 py-10">

          <div className="mb-8">

            <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />

            <div className="mt-3 h-9 w-56 animate-pulse rounded bg-gray-200" />

            <div className="mt-3 h-4 w-96 animate-pulse rounded bg-gray-200" />

          </div>


          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {Array.from({ length: 3 }).map(
              (_, index) => (

                <div
                  key={index}
                  className="h-32 animate-pulse rounded-xl border border-gray-200 bg-white"
                />

              )
            )}

          </div>


          <div className="mt-6 h-64 animate-pulse rounded-xl border border-gray-200 bg-white" />

        </div>

      </div>

    );

  }


  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {

    return (

      <div className="min-h-screen bg-gray-50">

        <div className="mx-auto max-w-7xl px-6 py-10">

          <div className="rounded-xl border border-red-200 bg-red-50 p-6">

            <div className="flex items-start gap-3">

              <XCircle
                className="mt-0.5 text-red-500"
                size={22}
              />

              <div>

                <h2 className="font-semibold text-red-800">
                  Unable to load API tokens
                </h2>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>


                <button
                  type="button"
                  onClick={loadData}
                  className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
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
  // MAIN RENDER
  // ==========================================================

  return (

    <div className="min-h-screen bg-gray-50">

      <div className="mx-auto max-w-7xl px-6 py-10">


        {/* ====================================================
            PAGE HEADER
        ==================================================== */}

        <div className="mb-8">

          <p className="text-sm text-gray-500">
            Developer Resources
          </p>


          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            API Tokens
          </h1>


          <p className="mt-2 max-w-2xl text-gray-600">
            Manage the API tokens associated with
            your subscribed APIs.
          </p>

        </div>


        {/* ====================================================
            SUMMARY
        ==================================================== */}

        <div className="mb-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">


          {/* Active APIs */}

          <div className="rounded-xl border border-gray-200 bg-white p-6">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm font-medium text-gray-500">
                  Active APIs
                </p>

                <p className="mt-3 text-3xl font-bold text-gray-900">
                  {activeApisCount}
                </p>

              </div>


              <div className="rounded-lg bg-cyan-50 p-3">

                <Server
                  size={20}
                  className="text-cyan-600"
                />

              </div>

            </div>


            <p className="mt-4 text-xs text-gray-500">
              APIs available through your active subscriptions.
            </p>

          </div>


          {/* Generated Keys */}

          <div className="rounded-xl border border-gray-200 bg-white p-6">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm font-medium text-gray-500">
                  API Keys
                </p>

                <p className="mt-3 text-3xl font-bold text-gray-900">
                  {generatedKeysCount}
                </p>

              </div>


              <div className="rounded-lg bg-indigo-50 p-3">

                <KeyRound
                  size={20}
                  className="text-indigo-600"
                />

              </div>

            </div>


            <p className="mt-4 text-xs text-gray-500">
              API credentials currently generated.
            </p>

          </div>


          {/* Access Status */}

          <div className="rounded-xl border border-gray-200 bg-white p-6">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm font-medium text-gray-500">
                  API Access
                </p>


                <p className="mt-3 text-3xl font-bold text-gray-900">

                  {activeApisCount > 0
                    ? 'Active'
                    : 'None'}

                </p>

              </div>


              <div className="rounded-lg bg-emerald-50 p-3">

                <span className="block h-5 w-5 rounded-full bg-emerald-500" />

              </div>

            </div>


            <p className="mt-4 text-xs text-gray-500">
              Current API access status.
            </p>

          </div>

        </div>


        {/* ====================================================
            GENERATE ERROR
        ==================================================== */}

        {generateError && (

          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">

            <p className="text-sm font-medium text-red-700">
              {generateError}
            </p>

          </div>

        )}


        {/* ====================================================
            API LIST
        ==================================================== */}

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">


          {/* Section Header */}

          <div className="border-b border-gray-100 px-7 py-6">

            <h2 className="text-base font-semibold text-gray-900">
              Your APIs
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              APIs available through your active subscriptions.
            </p>

          </div>


          {/* ==================================================
              EMPTY STATE
          ================================================== */}

          {accessibleApis.length === 0 && (

            <div className="px-7 py-14 text-center">

              <Server
                size={32}
                className="mx-auto text-gray-300"
              />


              <h3 className="mt-4 text-sm font-semibold text-gray-800">
                No API access yet
              </h3>


              <p className="mt-1 text-sm text-gray-500">
                Subscribe to a package to access APIs.
              </p>

            </div>

          )}


          {/* ==================================================
              API LIST
          ================================================== */}

          {accessibleApis.length > 0 && (

            <div className="divide-y divide-gray-100">

              {accessibleApis.map((api) => {

                const generatedKey =
                  keysByApiId[api.id];


                const isGenerating =
                  generatingApiId === api.id;


                const isCopied =
                  copiedKeyId === generatedKey?.id;


                return (

                  <div
                    key={api.id}
                    className="px-7 py-6 transition-colors hover:bg-gray-50"
                  >

                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">


                      {/* ==================================================
                          API INFORMATION
                      ================================================== */}

                      <div className="flex min-w-0 items-start gap-4">


                        {/* Icon */}

                        <div className="flex-shrink-0 rounded-xl bg-gradient-to-br from-indigo-50 to-cyan-50 p-3">

                          <Server
                            size={20}
                            className="text-indigo-500"
                          />

                        </div>


                        {/* Details */}

                        <div className="min-w-0">

                          <div className="flex flex-wrap items-center gap-2.5">

                            <h3 className="font-semibold text-gray-900">
                              {api.name}
                            </h3>


                            {api.category && (

                              <span className="rounded bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                                {api.category}
                              </span>

                            )}


                            <span className="inline-flex items-center gap-1.5 rounded bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">

                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                              Active

                            </span>

                          </div>


                          {/* Description */}

                          {api.description && (

                            <p className="mt-2 max-w-2xl text-sm text-gray-500">
                              {api.description}
                            </p>

                          )}


                          {/* Endpoint + Key */}

                          <div className="mt-3 flex flex-wrap items-center gap-3">


                            {/* Endpoint */}

                            <span className="rounded border border-gray-200 bg-gray-50 px-2.5 py-1.5 font-mono text-xs text-gray-500">

                              {api.endpoint}

                            </span>


                            {/* ==================================================
                                GENERATED KEY
                            ================================================== */}

                            {generatedKey ? (

                              <div className="inline-flex items-center gap-2 rounded border border-gray-200 bg-gray-50 px-2.5 py-1.5 font-mono text-xs">

                                <KeyRound
                                  size={13}
                                  className="text-gray-400"
                                />


                                <span>

                                  {generatedKey.key.substring(
                                    0,
                                    8
                                  )}

                                  ••••••••

                                </span>


                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCopyKey(
                                      generatedKey.key,
                                      generatedKey.id
                                    )
                                  }
                                  className="ml-1 inline-flex items-center gap-1.5 text-gray-400 transition-colors hover:text-indigo-600"
                                  title="Copy API key"
                                >

                                  {isCopied ? (

                                    <>

                                      <Check
                                        size={14}
                                        className="text-emerald-500"
                                      />

                                      <span className="font-sans text-xs text-emerald-600">
                                        Copied
                                      </span>

                                    </>

                                  ) : (

                                    <>

                                      <Copy
                                        size={14}
                                      />

                                      <span className="font-sans text-xs">
                                        Copy
                                      </span>

                                    </>

                                  )}

                                </button>

                              </div>

                            ) : (

                              /* ==================================================
                                  NO KEY YET
                              ================================================== */

                              <button
                                type="button"
                                onClick={() =>
                                  handleGenerateKey(
                                    api.id
                                  )
                                }
                                disabled={isGenerating}
                                className="inline-flex items-center gap-1.5 rounded border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                              >

                                {isGenerating ? (

                                  <>

                                    <Loader2
                                      size={14}
                                      className="animate-spin"
                                    />

                                    Generating...

                                  </>

                                ) : (

                                  <>

                                    <KeyRound
                                      size={14}
                                    />

                                    Generate API Key

                                  </>

                                )}

                              </button>

                            )}

                          </div>


                          {/* Created Date */}

                          {generatedKey && (

                            <p className="mt-2 text-xs text-gray-400">

                              API key created{' '}

                              {new Date(
                                generatedKey.createdAt
                              ).toLocaleDateString()}

                            </p>

                          )}

                        </div>

                      </div>


                      {/* ==================================================
                          KEY STATUS
                      ================================================== */}

                      <div className="flex-shrink-0">

                        <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                          Key Status
                        </p>


                        <p
                          className={`mt-1 text-sm font-medium ${
                            generatedKey
                              ? 'text-emerald-600'
                              : 'text-gray-400'
                          }`}
                        >

                          {generatedKey
                            ? 'Generated'
                            : 'Not generated'}

                        </p>

                      </div>

                    </div>

                  </div>

                );

              })}

            </div>

          )}

        </div>

      </div>

    </div>

  );

};

export default ApiTokens;