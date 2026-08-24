import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const Failure: React.FC = () => {
  const [searchParams] = useSearchParams();

  const transactionUuid =
    searchParams.get('transactionUuid');

  return (
    <div className="min-h-screen bg-[#F4F5F2] flex items-center justify-center px-4 font-sans">

      <div className="w-full max-w-lg">

        <div className="bg-white border border-[#E2E4E0] rounded-lg overflow-hidden">

          {/* Failure Header */}

          <div className="px-6 sm:px-8 pt-10 pb-8 text-center">

            {/* Failure Icon */}

            <div className="mx-auto h-16 w-16 rounded-full bg-[#FBECEA] flex items-center justify-center">

              <svg
                className="h-8 w-8 text-[#B4442E]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>

            </div>


            {/* Title */}

            <h1 className="font-display mt-6 text-3xl font-semibold text-[#14161F] tracking-tight">
              Payment Failed
            </h1>


            <p className="mt-3 text-sm text-[#5B6270] leading-relaxed">
              Your payment could not be completed or was
              cancelled.
            </p>

          </div>


          {/* Information */}

          <div className="border-t border-[#E2E4E0] px-6 sm:px-8 py-6">

            <div className="bg-[#F4F5F2] border border-[#E2E4E0] rounded-md p-4">

              <p className="text-sm text-[#5B6270] leading-relaxed">
                No subscription has been activated for
                this payment.
              </p>

              <p className="text-sm text-[#5B6270] leading-relaxed mt-2">
                If you believe you were charged, please
                contact support and provide your payment
                transaction details.
              </p>

            </div>


            {transactionUuid && (

              <div className="mt-5 flex justify-between gap-4 text-sm">

                <span className="text-[#8B909C]">
                  Transaction
                </span>

                <span className="font-mono text-xs text-[#14161F] break-all text-right">
                  {transactionUuid}
                </span>

              </div>

            )}

          </div>


          {/* Actions */}

          <div className="border-t border-[#E2E4E0] px-6 sm:px-8 py-6 flex flex-col gap-3">

            <Link
              to="/packages"
              className="w-full text-center px-5 py-3 bg-[#14161F] hover:bg-[#272A36] text-white rounded-md font-semibold transition-colors"
            >
              Try Again
            </Link>

            <Link
              to="/dashboard"
              className="w-full text-center px-5 py-3 border border-[#D7D9D3] hover:bg-[#F4F5F2] text-[#14161F] rounded-md font-medium transition-colors"
            >
              Go to Dashboard
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Failure;