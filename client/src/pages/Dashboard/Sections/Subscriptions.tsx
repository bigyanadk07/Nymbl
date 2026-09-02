// src/components/dashboard/Dashboard.tsx

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  getPackages,
  Package,
} from '../../../services/package.services';
import { getMySubscriptions } from '../../../services/subscription.service';

interface SubscriptionPackage {
  id: string;
  name: string;
  price: number;
  billingCycle: string;
}

interface UserSubscription {
  id: string;
  // The service can return subscriptions whose package has been
  // deleted/unavailable, so this must be nullable to match reality.
  package: SubscriptionPackage | null;
  status: 'active' | 'canceled' | 'expired' | 'past_due' | 'pending';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  createdAt: string;
}

// Small helper so status pills are consistent and easy to extend.
const STATUS_STYLES: Record<
  UserSubscription['status'],
  { label: string; dot: string; badge: string }
> = {
  active: {
    label: 'Active',
    dot: 'bg-[#0E9594]',
    badge: 'bg-[#E9F5F4] text-[#0B7A79]',
  },
  expired: {
    label: 'Expired',
    dot: 'bg-[#A9AEB9]',
    badge: 'bg-[#EEEFEC] text-[#5B6270]',
  },
  canceled: {
    label: 'Canceled',
    dot: 'bg-[#C2604B]',
    badge: 'bg-[#FBF2F0] text-[#B4442E]',
  },
  past_due: {
    label: 'Past due',
    dot: 'bg-[#F0A202]',
    badge: 'bg-[#FDF3DF] text-[#946012]',
  },
    pending: {
    label: 'Pending',
    dot: 'bg-[#F0A202]',
    badge: 'bg-[#FDF3DF] text-[#946012]',
  },
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const [packages, setPackages] = useState<Package[]>([]);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);

  const [loadingPackages, setLoadingPackages] = useState(true);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(true);

  const [packageError, setPackageError] = useState('');
  const [subscriptionError, setSubscriptionError] = useState('');

  /*
   * Load available packages.
   *
   * These are only displayed when the user has
   * no subscriptions at all (active or otherwise).
   */
  useEffect(() => {
    const loadPackages = async () => {
      try {
        const data = await getPackages();

        // Only show the first 3 recommended packages.
        setPackages(data.slice(0, 3));
      } catch (err) {
        console.error(err);
        setPackageError('Unable to load packages.');
      } finally {
        setLoadingPackages(false);
      }
    };

    loadPackages();
  }, []);

  /*
   * Load the user's subscriptions.
   *
   * The backend already returns package information
   * inside each subscription, so we do NOT need to
   * make another request to /packages/:id.
   *
   * We keep ALL subscriptions here (active, expired,
   * canceled, past_due) and split them into sections
   * further down instead of filtering anything out.
   */
  useEffect(() => {
    const loadSubscriptions = async () => {
      try {
        const data = await getMySubscriptions();
        setSubscriptions(data);
      } catch (err) {
        console.error(err);
        setSubscriptionError(
          'Unable to load your subscriptions.'
        );
      } finally {
        setLoadingSubscriptions(false);
      }
    };

    loadSubscriptions();
  }, []);

  /*
   * Calculate remaining days until subscription ends.
   */
  const getDaysRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);

    const difference = end.getTime() - now.getTime();

    const days = Math.ceil(
      difference / (1000 * 60 * 60 * 24)
    );

    return Math.max(days, 0);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const activeSubscriptions = subscriptions.filter(
    (subscription) => subscription.status === 'active'
  );

  const inactiveSubscriptions = subscriptions.filter(
    (subscription) => subscription.status !== 'active'
  );

  const hasActiveSubscriptions = activeSubscriptions.length > 0;
  const hasInactiveSubscriptions = inactiveSubscriptions.length > 0;
  const hasAnySubscriptions = subscriptions.length > 0;

  return (
    <div className="min-h-screen bg-[#F4F5F2] font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif; }
        .font-sans { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', ui-monospace, monospace; }
      `}</style>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">

        {/* ===================================================== */}
        {/* Welcome */}
        {/* ===================================================== */}

        <div className="mb-10">

          <span className="font-mono text-xs uppercase tracking-wide text-[#0E9594]">
            Your Subscriptions
          </span>

          <h1 className="font-display mt-2 text-3xl font-semibold text-[#14161F] tracking-tight">
            Welcome, {user?.name || 'User'}
          </h1>

          <p className="text-[#5B6270] text-sm mt-2">
            Manage your API subscriptions and explore available packages.
          </p>

        </div>


        {/* ===================================================== */}
        {/* NO SUBSCRIPTIONS AT ALL → AVAILABLE PACKAGES */}
        {/* ===================================================== */}

        {!loadingSubscriptions && !hasAnySubscriptions && (

          <div>

            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-[#E2E4E0]">

              <h2 className="font-display text-lg font-semibold text-[#14161F]">
                Available packages
              </h2>

            </div>


            {/* Loading */}

            {loadingPackages && (

              <div className="bg-white rounded-lg border border-[#E2E4E0] p-10 text-center">

                <div className="h-6 w-6 border-2 border-[#D7D9D3] border-t-[#0E9594] rounded-full animate-spin mx-auto mb-3" />

                <p className="text-sm text-[#8B909C] font-mono">
                  Loading packages…
                </p>

              </div>

            )}


            {/* Error */}

            {!loadingPackages && packageError && (

              <div className="bg-white rounded-lg border border-[#EED0C9] p-8 text-center">

                <p className="text-sm text-[#B4442E]">
                  {packageError}
                </p>

              </div>

            )}


            {/* Package Cards */}

            {!loadingPackages &&
              !packageError &&
              packages.length > 0 && (

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                  {packages.map((pkg) => (

                    <div
                      key={pkg.id}
                      className={`relative bg-white rounded-lg border transition-colors duration-150 ${
                        pkg.isPopular
                          ? 'border-[#0E9594]'
                          : 'border-[#E2E4E0] hover:border-[#C7CAC2]'
                      }`}
                    >

                      {/* Popular Badge */}

                      {pkg.isPopular && (

                        <div className="absolute -top-3 left-6">

                          <span className="px-3 py-1 bg-[#14161F] text-white text-[11px] font-mono uppercase tracking-wide rounded-sm">
                            Most popular
                          </span>

                        </div>

                      )}


                      <div className="p-6">

                        <h3 className="font-display text-xl font-semibold text-[#14161F]">
                          {pkg.name}
                        </h3>


                        <div className="mt-3 flex items-baseline">

                          <span className="font-display text-3xl font-semibold text-[#14161F]">
                            NPR {pkg.price}
                          </span>

                          <span className="text-sm text-[#8B909C] ml-1.5 font-mono">
                            / {pkg.billingCycle}
                          </span>

                        </div>


                        <p className="text-sm text-[#5B6270] mt-3 min-h-[40px]">
                          {pkg.description}
                        </p>


                        <div className="mt-5 flex items-center gap-2 text-sm text-[#3A3F4B] pt-4 border-t border-[#E2E4E0]">

                          <svg
                            className="h-4 w-4 text-[#0E9594]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>

                          <span>
                            {pkg.apis.length} APIs included
                          </span>

                        </div>


                        <div className="mt-3 space-y-1.5">

                          {pkg.apis.slice(0, 3).map((api) => (

                            <div
                              key={api._id}
                              className="text-xs text-[#8B909C] flex items-center gap-2 font-mono"
                            >

                              <span className="text-[#0E9594]">
                                ·
                              </span>

                              {api.name}

                            </div>

                          ))}

                        </div>


                        <Link
                          to={`/packages/${pkg.id}`}
                          className="mt-6 block w-full text-center px-4 py-2.5 bg-[#14161F] hover:bg-[#272A36] text-white font-medium rounded-md transition-colors duration-150"
                        >
                          View package
                        </Link>

                      </div>

                    </div>

                  ))}

                </div>

              )}


            {/* View All */}

            {!loadingPackages &&
              !packageError &&
              packages.length > 0 && (

                <div className="mt-8 text-center">

                  <Link
                    to="/packages"
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-white border border-[#D7D9D3] hover:border-[#14161F] text-[#3A3F4B] hover:text-[#14161F] font-medium rounded-md transition-colors"
                  >
                    View all packages

                    <span aria-hidden="true">
                      →
                    </span>

                  </Link>

                </div>

              )}

          </div>

        )}


        {/* ===================================================== */}
        {/* ACTIVE SUBSCRIPTIONS */}
        {/* ===================================================== */}

        <div className="mt-4">

          <h2 className="font-display text-lg font-semibold text-[#14161F] mb-4 pb-3 border-b border-[#E2E4E0]">
            Active subscriptions
          </h2>


          {/* Loading */}

          {loadingSubscriptions && (

            <div className="bg-white rounded-lg border border-[#E2E4E0] p-8 text-center">

              <div className="h-6 w-6 border-2 border-[#D7D9D3] border-t-[#0E9594] rounded-full animate-spin mx-auto mb-2" />

              <p className="text-sm text-[#8B909C] font-mono">
                Loading subscriptions…
              </p>

            </div>

          )}


          {/* Error */}

          {!loadingSubscriptions && subscriptionError && (

            <div className="bg-white rounded-lg border border-[#EED0C9] p-6 text-center">

              <p className="text-sm text-[#B4442E]">
                {subscriptionError}
              </p>

            </div>

          )}


          {/* No active subscriptions */}

          {!loadingSubscriptions &&
            !subscriptionError &&
            !hasActiveSubscriptions && (

              <div className="bg-white rounded-lg border border-[#E2E4E0] p-6 text-center text-[#5B6270]">

                <p className="text-sm font-medium text-[#14161F]">
                  No active subscriptions yet
                </p>

                <p className="text-xs mt-1 text-[#8B909C]">
                  {hasAnySubscriptions
                    ? 'Check your inactive subscriptions below, or browse packages to get started.'
                    : 'Browse packages above to get started.'}
                </p>

              </div>

            )}


          {/* Active Subscription List */}

          {!loadingSubscriptions &&
            !subscriptionError &&
            hasActiveSubscriptions && (

              <div className="bg-white rounded-lg border border-[#E2E4E0] overflow-hidden">

                {activeSubscriptions.map((subscription, index) => {

                  const daysRemaining = getDaysRemaining(
                    subscription.currentPeriodEnd
                  );

                  return (

                    <div
                      key={subscription.id}
                      className={`px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4 ${
                        index !== activeSubscriptions.length - 1
                          ? 'border-b border-[#E2E4E0]'
                          : ''
                      }`}
                    >

                      {/* Package Name */}

                      <div className="flex-1">

                        <h3 className="font-semibold text-[#14161F]">
                          {subscription.package?.name ??
                            'Package unavailable'}
                        </h3>

                      </div>


                      {/* Status */}

                      <div>

                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-[#E9F5F4] text-[#0B7A79] text-xs font-mono">

                          <span className="h-1.5 w-1.5 rounded-full bg-[#0E9594]" />

                          Active

                        </span>

                      </div>


                      {/* Days Remaining */}

                      <div className="text-sm text-[#5B6270] sm:w-40 font-mono">

                        <span className="font-medium text-[#14161F]">
                          {daysRemaining}
                        </span>{' '}

                        {daysRemaining === 1
                          ? 'day'
                          : 'days'}{' '}

                        remaining

                      </div>


                      {/* View Details */}

                      <div className="sm:w-32">

                        {subscription.package ? (

                          <Link
                            to={`/packages/${subscription.package.id}`}
                            className="inline-flex items-center justify-center w-full px-4 py-2 bg-[#F4F5F2] hover:bg-[#E9F5F4] hover:text-[#0B7A79] text-[#3A3F4B] text-sm font-medium rounded-md transition-colors"
                          >
                            View details
                          </Link>

                        ) : (

                          <span className="inline-flex items-center justify-center w-full px-4 py-2 bg-[#F4F5F2] text-[#A9AEB9] text-sm font-medium rounded-md cursor-not-allowed">
                            Unavailable
                          </span>

                        )}

                      </div>

                    </div>

                  );

                })}

              </div>

            )}

        </div>


        {/* ===================================================== */}
        {/* INACTIVE / EXPIRED SUBSCRIPTIONS */}
        {/* expired, canceled, past_due */}
        {/* ===================================================== */}

        {!loadingSubscriptions &&
          !subscriptionError &&
          hasInactiveSubscriptions && (

            <div className="mt-10">

              <h2 className="font-display text-lg font-semibold text-[#14161F] mb-4 pb-3 border-b border-[#E2E4E0]">
                Inactive &amp; expired subscriptions
              </h2>


              <div className="bg-white rounded-lg border border-[#E2E4E0] overflow-hidden">

                {inactiveSubscriptions.map((subscription, index) => {

                  const statusStyle = STATUS_STYLES[subscription.status];

                  return (

                    <div
                      key={subscription.id}
                      className={`px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4 ${
                        index !== inactiveSubscriptions.length - 1
                          ? 'border-b border-[#E2E4E0]'
                          : ''
                      }`}
                    >

                      {/* Package Name */}

                      <div className="flex-1">

                        <h3 className="font-semibold text-[#14161F]">
                          {subscription.package?.name ??
                            'Package unavailable'}
                        </h3>

                        <p className="text-xs text-[#8B909C] mt-0.5 font-mono">
                          Ended {formatDate(subscription.currentPeriodEnd)}
                        </p>

                      </div>


                      {/* Status */}

                      <div>

                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-mono ${statusStyle.badge}`}
                        >

                          <span
                            className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
                          />

                          {statusStyle.label}

                        </span>

                      </div>


                      {/* View Details */}

                      <div className="sm:w-32">

                        {subscription.package ? (

                          <Link
                            to={`/packages/${subscription.package.id}`}
                            className="inline-flex items-center justify-center w-full px-4 py-2 bg-[#F4F5F2] hover:bg-[#E9F5F4] hover:text-[#0B7A79] text-[#3A3F4B] text-sm font-medium rounded-md transition-colors"
                          >
                            View details
                          </Link>

                        ) : (

                          <span className="inline-flex items-center justify-center w-full px-4 py-2 bg-[#F4F5F2] text-[#A9AEB9] text-sm font-medium rounded-md cursor-not-allowed">
                            Unavailable
                          </span>

                        )}

                      </div>

                    </div>

                  );

                })}

              </div>

            </div>

          )}


        {/* ===================================================== */}
        {/* VIEW OTHER PACKAGES */}
        {/* Only when user already has at least one subscription */}
        {/* ===================================================== */}

        {!loadingSubscriptions && hasAnySubscriptions && (

          <div className="mt-8 text-center">

            <Link
              to="/packages"
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-white border border-[#D7D9D3] hover:border-[#14161F] text-[#3A3F4B] hover:text-[#14161F] font-medium rounded-md transition-colors"
            >
              View other packages

              <span aria-hidden="true">
                →
              </span>

            </Link>

          </div>

        )}

      </div>

    </div>
  );
};

export default Dashboard;