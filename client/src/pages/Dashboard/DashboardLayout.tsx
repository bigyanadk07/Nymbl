import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';

import DashboardSidebar from './DashboardSidebar';

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F4F5F2]">

      <DashboardSidebar
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main area */}

      <div className="lg:pl-64">

        {/* Mobile header */}

        <header className="sticky top-0 z-20 flex h-16 items-center border-b border-[#E2E4E0] bg-white px-4 lg:hidden">

          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="inline-flex items-center justify-center rounded-md p-2 text-[#5B6270] hover:bg-[#F4F5F2]"
            aria-label="Open dashboard navigation"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <span className="ml-3 font-display text-lg font-semibold text-[#14161F]">
            Nymbl
          </span>

        </header>

        {/* Page content */}

        <main className="min-h-screen">
          <Outlet />
        </main>

      </div>

    </div>
  );
};

export default DashboardLayout;