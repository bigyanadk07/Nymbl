// src/components/Navbar.tsx

import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Use Navigate to use Dashboard button in the dropdown
  const handleDashboardRoute = (event: React.MouseEvent<HTMLButtonElement>): void => {
    navigate('/dashboard')
  }

  // Use Navigate to use Subscription button in the dropdown
  const handleSubscriptionsRoute = (event: React.MouseEvent<HTMLButtonElement>): void => {
    navigate('/subscriptions')
  }
  
  const handleLogout = () => {
    logout();
    navigate('/');
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <header className="bg-[#F4F5F2]/90 backdrop-blur-md border-b border-[#E2E4E0] sticky top-0 z-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600&display=swap');
        .nav-display { font-family: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif; }
        .nav-sans { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
      `}</style>
      <div className="mx-auto max-w-7xl px-6 lg:px-8 nav-sans">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link className="flex items-center gap-2.5" to="/">
            <span className="nav-display text-lg font-semibold tracking-tight text-[#14161F]">
              Nymbl
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              // Logged in - Avatar with dropdown
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 rounded-md hover:bg-white transition-colors duration-150 px-2 py-1.5 -mx-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0E9594] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F4F5F2]"
                >
                  <div className="h-8 w-8 rounded-md bg-[#14161F] flex items-center justify-center text-[#0E9594] font-semibold text-xs nav-display">
                    {getUserInitials()}
                  </div>
                  <svg
                    className={`h-4 w-4 text-[#8B909C] transition-transform duration-150 ${isDropdownOpen ? 'rotate-180' : ''
                      }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-md bg-white border border-[#E2E4E0] shadow-[0_12px_30px_-10px_rgba(20,22,31,0.2)] overflow-hidden z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-[#E2E4E0]">
                      <p className="text-sm font-semibold text-[#14161F] truncate">
                        {user?.name || 'User'}
                      </p>
                      <p className="text-xs text-[#8B909C] truncate font-mono">
                        {user?.email || 'No email'}
                      </p>
                    </div>

                    {/* Logout */}
                    <button
                      onClick={handleDashboardRoute}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-black hover:bg-[#cfcfcf] transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      Dashboard
                    </button>
                    <button
                      onClick={handleSubscriptionsRoute}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-black hover:bg-[#cfcfcf] transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      Subscriptions
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#B4442E] hover:bg-[#FBF2F0] transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Log out
                    </button>

                  </div>
                )}
              </div>
            ) : (
              // Logged out - Auth buttons
              <div className="flex items-center gap-2">
                <Link
                  to="/auth"
                  state={{ mode: 'login' }}
                  className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-[#3A3F4B] hover:text-[#14161F] rounded-md transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/auth"
                  state={{ mode: 'register' }}
                  className="inline-flex px-4 py-2 text-sm font-medium text-white bg-[#14161F] rounded-md hover:bg-[#272A36] transition-colors"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;