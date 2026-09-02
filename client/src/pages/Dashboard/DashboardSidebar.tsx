import React from 'react';
import { NavLink } from 'react-router-dom';

interface DashboardSidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  mobileOpen = true,
  onClose,
}) => {
  const navigation = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M3 12l9-9 9 9"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10"
          />
        </svg>
      ),
    },
    {
      label: 'API Tokens',
      path: '/dashboard/api-tokens',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M15 7a4 4 0 10-5.66 5.66L12 15.33V18h2v-2h2v-2h2.67l1.33-1.33A4 4 0 0015 7z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M7 17h.01"
          />
        </svg>
      ),
    },
    {
      label: 'Usage Log',
      path: '/dashboard/usage',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M4 19V5"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M4 18l5-5 4 3 7-9"
          />
        </svg>
      ),
    },
    {
      label: 'Subscriptions',
      path: '/dashboard/subscriptions',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M4 7h16M4 12h16M4 17h16"
          />
        </svg>
      ),
    },
    {
      label: 'Invoices',
      path: '/dashboard/invoices',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M6 3h12a1 1 0 011 1v17l-3-2-3 2-3-2-3 2V4a1 1 0 011-1z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M9 8h6M9 12h6M9 16h3"
          />
        </svg>
      ),
    },
  ];

  const accountNavigation = [
    {
      label: 'Personal Settings',
      path: '/dashboard/settings',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M19.4 15a1.7 1.7 0 00.34 1.88l.06.06-1.42 1.42-.06-.06a1.7 1.7 0 00-1.88-.34 1.7 1.7 0 00-1.03 1.56V20h-2v-.08a1.7 1.7 0 00-1.03-1.56 1.7 1.7 0 00-1.88.34l-.06.06-1.42-1.42.06-.06A1.7 1.7 0 008.4 15a1.7 1.7 0 00-1.56-1.03H6v-2h.84A1.7 1.7 0 008.4 10.94a1.7 1.7 0 00-.34-1.88L8 9l1.42-1.42.06.06a1.7 1.7 0 001.88.34A1.7 1.7 0 0012.39 6.4V6h2v.4a1.7 1.7 0 001.03 1.56 1.7 1.7 0 001.88-.34l.06-.06L18.78 9l-.06.06a1.7 1.7 0 00-.34 1.88A1.7 1.7 0 0019.94 12H20v2h-.6A1.7 1.7 0 0019.4 15z"
          />
        </svg>
      ),
    },
  ];

  return (
    <>
      {mobileOpen && onClose && (
        <div
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed
          left-0
          top-0
          z-40
          h-screen
          w-64
          border-r
          border-[#E2E4E0]
          bg-white
          transition-transform
          duration-200
          lg:translate-x-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex h-full flex-col">

          {/* Logo / Brand */}

          <div className="flex h-16 items-center border-b border-[#E2E4E0] px-6">
            <NavLink
              to="/"
              className="font-display text-xl font-bold text-[#14161F]"
              onClick={onClose}
            >
              Nymbl
            </NavLink>
          </div>

          {/* Main Navigation */}

          <nav className="flex-1 overflow-y-auto px-3 py-6">

            <p className="px-3 mb-3 text-[11px] font-mono uppercase tracking-wider text-[#8B909C]">
              Workspace
            </p>

            <div className="space-y-1">

              {navigation.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `
                    flex
                    items-center
                    gap-3
                    rounded-md
                    px-3
                    py-2.5
                    text-sm
                    font-medium
                    transition-colors
                    ${
                      isActive
                        ? 'bg-[#E9F5F4] text-[#0B7A79]'
                        : 'text-[#5B6270] hover:bg-[#F4F5F2] hover:text-[#14161F]'
                    }
                    `
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}

            </div>

            <div className="my-7 border-t border-[#E2E4E0]" />

            <p className="px-3 mb-3 text-[11px] font-mono uppercase tracking-wider text-[#8B909C]">
              Account
            </p>

            <div className="space-y-1">

              {accountNavigation.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `
                    flex
                    items-center
                    gap-3
                    rounded-md
                    px-3
                    py-2.5
                    text-sm
                    font-medium
                    transition-colors
                    ${
                      isActive
                        ? 'bg-[#E9F5F4] text-[#0B7A79]'
                        : 'text-[#5B6270] hover:bg-[#F4F5F2] hover:text-[#14161F]'
                    }
                    `
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}

            </div>

          </nav>

          {/* Bottom */}

          <div className="border-t border-[#E2E4E0] p-4">
            <p className="text-xs text-[#8B909C]">
              API Marketplace
            </p>

            <p className="mt-1 text-xs font-mono text-[#5B6270]">
              Dashboard
            </p>
          </div>

        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;