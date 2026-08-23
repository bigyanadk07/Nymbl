import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPackages, Package } from '../../services/package.services';

const Packages: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPackages = async () => {
      try {
        const data = await getPackages();
        setPackages(data);
      } catch (err) {
        setError('Failed to load packages.');
      } finally {
        setLoading(false);
      }
    };

    loadPackages();
  }, []);

  const fontStyles = (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
      .font-display { font-family: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif; }
      .font-sans { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
      .font-mono { font-family: 'JetBrains Mono', ui-monospace, monospace; }
    `}</style>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F5F2] flex items-center justify-center font-sans">
        {fontStyles}
        <div className="text-center">
          <div className="h-6 w-6 border-2 border-[#D7D9D3] border-t-[#0E9594] rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-[#8B909C] font-mono">Loading packages…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F4F5F2] flex items-center justify-center font-sans px-4">
        {fontStyles}
        <div className="bg-white border border-[#EED0C9] rounded-lg p-8 text-center max-w-sm">
          <p className="text-[#B4442E] font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F5F2] font-sans">
      {fontStyles}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">

        {/* Top Navigation */}
        <div className="mb-10">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5B6270] hover:text-[#14161F] transition-colors"
          >
            <span aria-hidden="true">←</span>
            Back to dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="max-w-2xl mb-14">
          <span className="font-mono text-xs uppercase tracking-wide text-[#0E9594]">
            Catalog
          </span>

          <h1 className="font-display mt-3 text-4xl sm:text-5xl font-semibold text-[#14161F] tracking-tight">
            Choose your package
          </h1>

          <p className="mt-4 text-[#5B6270] leading-relaxed">
            Get access to powerful APIs with a package that fits your project.
            Upgrade or change your plan whenever you need.
          </p>
        </div>

        {/* Packages */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative flex flex-col bg-white rounded-lg border overflow-hidden transition-colors duration-150 ${
                pkg.isPopular
                  ? 'border-[#0E9594]'
                  : 'border-[#E2E4E0] hover:border-[#C7CAC2]'
              }`}
            >

              {/* Popular Badge */}
              {pkg.isPopular && (
                <div className="bg-[#14161F] text-white text-center text-[11px] font-mono uppercase tracking-wide py-2">
                  Most popular
                </div>
              )}

              <div className="p-7 flex flex-col flex-1">

                {/* Package Name */}
                <div>
                  <h2 className="font-display text-2xl font-semibold text-[#14161F]">
                    {pkg.name}
                  </h2>

                  <p className="mt-2 text-sm text-[#5B6270] min-h-[40px]">
                    {pkg.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mt-6 pb-6 border-b border-[#E2E4E0]">
                  <span className="font-display text-4xl font-semibold text-[#14161F]">
                    NPR {pkg.price}
                  </span>

                  <span className="text-sm text-[#8B909C] ml-1.5 font-mono">
                    / {pkg.billingCycle}
                  </span>
                </div>

                {/* APIs */}
                <div className="mt-6">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#8B909C] mb-3">
                    Included APIs
                  </h3>

                  <div className="space-y-2.5">
                    {pkg.apis.map((api) => (
                      <div
                        key={api._id}
                        className="flex items-center gap-2.5 text-sm text-[#3A3F4B]"
                      >
                        <svg className="h-3.5 w-3.5 text-[#0E9594] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>

                        <span>{api.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div className="mt-7">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#8B909C] mb-3">
                    Features
                  </h3>

                  <div className="space-y-2.5">
                    {pkg.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2.5 text-sm text-[#3A3F4B]"
                      >
                        <svg className="h-3.5 w-3.5 text-[#0E9594] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>

                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Button */}
                <div className="mt-auto pt-8">
                  <Link
                    to={`/packages/${pkg.id}`}
                    className={`block w-full text-center font-medium py-3 rounded-md transition-colors ${
                      pkg.isPopular
                        ? 'bg-[#14161F] hover:bg-[#272A36] text-white'
                        : 'bg-[#F4F5F2] hover:bg-[#E9EAE6] text-[#3A3F4B]'
                    }`}
                  >
                    View package
                  </Link>
                </div>

              </div>
            </div>
          ))}

        </div>

        {/* Bottom Navigation */}
        <div className="mt-12 text-center">
          <Link
            to="/dashboard"
            className="text-sm text-[#5B6270] hover:text-[#14161F] transition-colors"
          >
            ← Return to dashboard
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Packages;