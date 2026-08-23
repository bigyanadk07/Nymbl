import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import {
  getPackageById,
  Package,
} from '../../services/package.services';

import {
  getMySubscriptions,
} from '../../services/subscription.service';

import {
  initiateEsewaPayment,
} from '../../services/payment.service';


const PackageDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [pkg, setPkg] = useState<Package | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  const [subscribing, setSubscribing] = useState(false);
  const [subscriptionMessage, setSubscriptionMessage] = useState('');


  /*
   * Load package information and check whether
   * the current user already has an ACTIVE subscription.
   *
   * Pending subscriptions do not count as active.
   */
  useEffect(() => {
    const loadPackageAndSubscription = async () => {
      if (!id) {
        setError('Package ID not found.');
        setLoading(false);
        setSubscriptionLoading(false);
        return;
      }

      try {
        const [packageData, subscriptions] = await Promise.all([
          getPackageById(id),
          getMySubscriptions(),
        ]);

        setPkg(packageData);

        const alreadySubscribed = subscriptions.some(
          (subscription) =>
            subscription.status === 'active' &&
            subscription.package?.id === packageData.id
        );

        setIsSubscribed(alreadySubscribed);

      } catch (err) {
        console.error('Failed to load package:', err);

        setError('Failed to load package.');
      } finally {
        setLoading(false);
        setSubscriptionLoading(false);
      }
    };

    loadPackageAndSubscription();
  }, [id]);


  /*
   * Initiate eSewa payment.
   *
   * Flow:
   *
   * 1. Frontend calls our backend.
   * 2. Backend creates:
   *      Subscription -> pending
   *      Payment      -> pending
   *
   * 3. Backend generates the signed eSewa payload.
   * 4. Frontend creates an HTML form.
   * 5. Form is POSTed directly to eSewa.
   * 6. User completes payment on eSewa.
   * 7. eSewa redirects to our backend success/failure URL.
   * 8. Backend verifies payment.
   * 9. Backend changes:
   *      Payment      -> success
   *      Subscription -> active
   */
  const handleSubscribe = async () => {
    if (!pkg || isSubscribed || subscribing) {
      return;
    }

    try {
      setSubscribing(true);
      setSubscriptionMessage('');

      /*
       * Ask our backend to create the payment.
       */
      const response = await initiateEsewaPayment(pkg.id);

      console.log(
        'eSewa initiation response:',
        response
      );


      /*
       * Make sure the backend returned
       * everything required for eSewa.
       */
      if (
        !response.success ||
        !response.esewa ||
        !response.esewa.paymentUrl
      ) {
        throw new Error(
          response.message ||
          'Failed to initialize eSewa payment.'
        );
      }


      /*
       * Create a temporary HTML form.
       *
       * eSewa's v2 API expects the payment data
       * to be submitted as form fields using POST.
       */
      const form = document.createElement('form');

      form.method = 'POST';
      form.action = response.esewa.paymentUrl;
      form.style.display = 'none';


      /*
       * Add the eSewa payment fields.
       *
       * paymentUrl is NOT a form field.
       * It is only the destination URL.
       */
      Object.entries(response.esewa).forEach(
        ([key, value]) => {

          if (key === 'paymentUrl') {
            return;
          }

          if (
            value === undefined ||
            value === null
          ) {
            return;
          }

          const input =
            document.createElement('input');

          input.type = 'hidden';
          input.name = key;
          input.value = String(value);

          form.appendChild(input);
        }
      );


      /*
       * Add the form to the DOM.
       */
      document.body.appendChild(form);


      /*
       * Submit the form.
       *
       * The browser now leaves our application
       * and goes to the eSewa payment page.
       */
console.log('eSewa payment URL:', form.action);
console.log(
  'eSewa payment fields:',
  Object.fromEntries(
    Array.from(form.elements).map((element) => [
      element.name,
      element.value
    ])
  )
);

form.submit();

    } catch (err: any) {
      console.error(
        'eSewa payment initiation error:',
        err
      );

      /*
       * Handle errors returned by our payment service.
       */
      setSubscriptionMessage(
        err?.message ||
        'Failed to start eSewa payment.'
      );

      setSubscribing(false);
    }
  };


  /*
   * Font styles.
   */
  const fontStyles = (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

      .font-display {
        font-family: 'Space Grotesk',
        ui-sans-serif,
        system-ui,
        sans-serif;
      }

      .font-sans {
        font-family: 'Inter',
        ui-sans-serif,
        system-ui,
        sans-serif;
      }

      .font-mono {
        font-family: 'JetBrains Mono',
        ui-monospace,
        monospace;
      }
    `}</style>
  );


  /*
   * Loading state.
   */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F5F2] flex items-center justify-center font-sans">

        {fontStyles}

        <div className="text-center">

          <div className="h-6 w-6 border-2 border-[#D7D9D3] border-t-[#0E9594] rounded-full animate-spin mx-auto mb-3" />

          <p className="text-sm text-[#8B909C] font-mono">
            Loading package…
          </p>

        </div>

      </div>
    );
  }


  /*
   * Package not found / loading error.
   */
  if (error || !pkg) {
    return (
      <div className="min-h-screen bg-[#F4F5F2] flex items-center justify-center px-4 font-sans">

        {fontStyles}

        <div className="bg-white border border-[#E2E4E0] rounded-lg p-8 text-center max-w-md">

          <span className="font-mono text-xs uppercase tracking-wide text-[#B4442E]">
            Not found
          </span>

          <h2 className="font-display mt-2 text-xl font-semibold text-[#14161F]">
            Package not found
          </h2>

          <p className="text-sm text-[#5B6270] mt-2">
            {error ||
              'The package you are looking for does not exist.'}
          </p>

          <Link
            to="/packages"
            className="inline-block mt-6 px-5 py-2.5 bg-[#14161F] hover:bg-[#272A36] text-white rounded-md font-medium transition-colors"
          >
            Back to packages
          </Link>

        </div>

      </div>
    );
  }


  /*
   * Main page.
   */
  return (
    <div className="min-h-screen bg-[#F4F5F2] font-sans">

      {fontStyles}

      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12">


        {/* Back */}

        <div className="mb-8">

          <Link
            to="/packages"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5B6270] hover:text-[#14161F] transition-colors"
          >

            <span aria-hidden="true">
              ←
            </span>

            Back to packages

          </Link>

        </div>


        {/* Main Card */}

        <div className="bg-white rounded-lg border border-[#E2E4E0] overflow-hidden">


          {/* Popular Banner */}

          {pkg.isPopular && (

            <div className="bg-[#14161F] text-white text-center text-[11px] font-mono uppercase tracking-wide py-2">

              Most popular package

            </div>

          )}


          <div className="p-6 sm:p-10">


            {/* Header */}

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">

              <div>

                <span className="font-mono text-xs uppercase tracking-wide text-[#0E9594]">
                  API package
                </span>

                <h1 className="font-display mt-3 text-4xl font-semibold text-[#14161F] tracking-tight">
                  {pkg.name}
                </h1>

                <p className="mt-3 text-[#5B6270] max-w-2xl leading-relaxed">
                  {pkg.description}
                </p>

              </div>


              {/* Price */}

              <div className="md:text-right shrink-0">

                <div className="flex items-baseline md:justify-end">

                  <span className="font-display text-4xl font-semibold text-[#14161F]">
                    NPR {pkg.price}
                  </span>

                  <span className="ml-1.5 text-sm text-[#8B909C] font-mono">
                    / {pkg.billingCycle}
                  </span>

                </div>

              </div>

            </div>


            {/* Divider */}

            <div className="my-10 border-t border-[#E2E4E0]" />


            {/* Content */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">


              {/* APIs */}

              <div>

                <h2 className="font-display text-xl font-semibold text-[#14161F]">
                  Included APIs
                </h2>

                <p className="text-sm text-[#8B909C] mt-1">
                  APIs available with this package.
                </p>


                <div className="mt-5 divide-y divide-[#E2E4E0] border-t border-b border-[#E2E4E0]">

                  {pkg.apis.map((api) => (

                    <div
                      key={api._id}
                      className="flex items-center gap-3 py-3.5"
                    >

                      <svg
                        className="h-4 w-4 text-[#0E9594] shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />

                      </svg>

                      <div>

                        <h3 className="font-medium text-[#14161F] text-sm">
                          {api.name}
                        </h3>

                        <p className="text-xs text-[#8B909C] mt-0.5 font-mono">
                          {api.category}
                        </p>

                      </div>

                    </div>

                  ))}

                </div>

              </div>


              {/* Features */}

              <div>

                <h2 className="font-display text-xl font-semibold text-[#14161F]">
                  Package features
                </h2>

                <p className="text-sm text-[#8B909C] mt-1">
                  Everything included with this package.
                </p>


                <div className="mt-5 space-y-3">

                  {pkg.features.map(
                    (feature, index) => (

                      <div
                        key={index}
                        className="flex items-start gap-3"
                      >

                        <svg
                          className="h-4 w-4 text-[#0E9594] shrink-0 mt-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >

                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M5 13l4 4L19 7"
                          />

                        </svg>

                        <span className="text-sm text-[#3A3F4B]">
                          {feature}
                        </span>

                      </div>

                    )
                  )}

                </div>

              </div>

            </div>


            {/* Payment Section */}

            <div className="mt-10 p-6 rounded-lg bg-[#F4F5F2] border border-[#E2E4E0]">

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">


                <div>

                  <h2 className="font-display text-lg font-semibold text-[#14161F]">

                    {isSubscribed
                      ? 'You are subscribed'
                      : 'Ready to get started?'}

                  </h2>


                  <p className="text-sm text-[#5B6270] mt-1">

                    {isSubscribed
                      ? `You currently have an active ${pkg.name} subscription.`
                      : `Subscribe to ${pkg.name} and get access to the included APIs.`}

                  </p>

                </div>


                {/* eSewa Payment Button */}

                <button
                  type="button"
                  onClick={handleSubscribe}
                  disabled={
                    subscriptionLoading ||
                    isSubscribed ||
                    subscribing
                  }
                  className={`px-7 py-3 font-semibold rounded-md transition-colors ${
                    isSubscribed
                      ? 'bg-[#E9F5F4] text-[#0B7A79] cursor-default'
                      : subscribing
                        ? 'bg-[#5FBFBD] text-white cursor-wait'
                        : 'bg-[#14161F] hover:bg-[#272A36] text-white'
                  }`}
                >

                  {subscriptionLoading
                    ? 'Checking…'
                    : isSubscribed
                      ? 'Subscribed'
                      : subscribing
                        ? 'Redirecting…'
                        : 'Pay with eSewa'}

                </button>

              </div>


              {/* Payment Message */}

              {subscriptionMessage && (

                <div
                  className={`mt-4 text-sm font-medium ${
                    subscriptionMessage
                      .toLowerCase()
                      .includes('success')
                      ? 'text-[#0B7A79]'
                      : 'text-[#B4442E]'
                  }`}
                >

                  {subscriptionMessage}

                </div>

              )}

            </div>


          </div>

        </div>

      </div>

    </div>
  );
};


export default PackageDetails;