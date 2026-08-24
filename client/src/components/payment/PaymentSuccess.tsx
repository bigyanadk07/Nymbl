import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const Success: React.FC = () => {
  const [searchParams] = useSearchParams();

  const transactionCode =
    searchParams.get('transactionCode');

  const amount =
    searchParams.get('amount');

  const packageName =
    searchParams.get('packageName');

  return (
    <div className="min-h-screen bg-[#F4F5F2] flex items-center justify-center px-4 font-sans">

      <div className="w-full max-w-lg">

        <div className="bg-white border border-[#E2E4E0] rounded-lg overflow-hidden">

          {/* Success Header */}

          <div className="px-6 sm:px-8 pt-10 pb-8 text-center">

            {/* Success Icon */}

            <div className="mx-auto h-16 w-16 rounded-full bg-[#E9F5F4] flex items-center justify-center">

              <svg
                className="h-8 w-8 text-[#0E9594]"
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

            </div>


            {/* Title */}

            <h1 className="font-display mt-6 text-3xl font-semibold text-[#14161F] tracking-tight">
              Payment Successful
            </h1>


            <p className="mt-3 text-sm text-[#5B6270] leading-relaxed">
              Your payment has been successfully processed
              and your subscription is now active.
            </p>

          </div>


          {/* Payment Details */}

          {(transactionCode || amount || packageName) && (

            <div className="border-t border-[#E2E4E0] px-6 sm:px-8 py-6">

              <h2 className="font-display text-sm font-semibold text-[#14161F] mb-4">
                Payment details
              </h2>

              <div className="space-y-3">

                {packageName && (
                  <div className="flex justify-between gap-4 text-sm">

                    <span className="text-[#8B909C]">
                      Package
                    </span>

                    <span className="font-medium text-[#14161F] text-right">
                      {packageName}
                    </span>

                  </div>
                )}


                {amount && (
                  <div className="flex justify-between gap-4 text-sm">

                    <span className="text-[#8B909C]">
                      Amount
                    </span>

                    <span className="font-medium text-[#14161F]">
                      NPR {Number(amount).toFixed(2)}
                    </span>

                  </div>
                )}


                {transactionCode && (
                  <div className="flex justify-between gap-4 text-sm">

                    <span className="text-[#8B909C]">
                      Transaction
                    </span>

                    <span className="font-mono text-xs text-[#14161F]">
                      {transactionCode}
                    </span>

                  </div>
                )}

              </div>

            </div>

          )}


          {/* Actions */}

          <div className="border-t border-[#E2E4E0] px-6 sm:px-8 py-6 flex flex-col gap-3">

            <Link
              to="/dashboard"
              className="w-full text-center px-5 py-3 bg-[#14161F] hover:bg-[#272A36] text-white rounded-md font-semibold transition-colors"
            >
              Go to Dashboard
            </Link>

            <Link
              to="/packages"
              className="w-full text-center px-5 py-3 border border-[#D7D9D3] hover:bg-[#F4F5F2] text-[#14161F] rounded-md font-medium transition-colors"
            >
              View Packages
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Success;