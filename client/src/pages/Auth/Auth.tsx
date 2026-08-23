// src/pages/auth/Auth.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();

  // Get mode from navigation state
  const initialMode = location.state?.mode === 'register' ? false : true;

  // Form state
  const [isLogin, setIsLogin] = useState(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Update mode if location state changes
  useEffect(() => {
    if (location.state?.mode === 'register') {
      setIsLogin(false);
    } else if (location.state?.mode === 'login') {
      setIsLogin(true);
    }
  }, [location.state]);

  // Format phone for display (optional)
  const formatPhoneDisplay = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) return '';
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    if (digits.length <= 10) {
      setPhone(digits);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        if (!email || !password) {
          setError('Please fill in all fields');
          setLoading(false);
          return;
        }
        await login(email, password);
        navigate('/');
      } else {
        // Register
        if (!name || !email || !password || !phone) {
          setError('Please fill in all fields');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        if (phone.length < 10) {
          setError('Please enter a valid 10-digit phone number');
          setLoading(false);
          return;
        }

        // Format phone to E.164 for backend
        const formattedPhone = `+977${phone}`;
        await register(name, email, password, formattedPhone);
        navigate('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F5F2] px-4 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif; }
        .font-sans { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', ui-monospace, monospace; }
      `}</style>

      <div className="w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="text-sm text-[#5B6270] hover:text-[#14161F] mb-6 flex items-center gap-1.5 transition-colors"
        >
          <span aria-hidden="true">←</span> Back
        </button>

        <div className="bg-white border border-[#E2E4E0] rounded-lg p-8">
          {/* Header */}
          <span className="font-mono text-xs uppercase tracking-wide text-[#0E9594]">
            {isLogin ? 'Sign in' : 'Create account'}
          </span>
          <h1 className="font-display mt-2 text-3xl font-semibold text-[#14161F] tracking-tight">
            {isLogin ? 'Welcome back' : 'Start shipping'}
          </h1>
          <p className="text-[#5B6270] text-sm mt-2 mb-7">
            {isLogin ? 'Sign in to your account to continue.' : 'Create an account to get instant API access.'}
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-5 px-4 py-3 bg-[#FBF2F0] border border-[#EED0C9] rounded-md text-[#B4442E] text-sm">
              {error}
            </div>
          )}

          {/* Toggle Tabs */}
          <div className="flex border-b border-[#E2E4E0] mb-7">
            <button
              onClick={() => {
                setIsLogin(true);
                setError('');
              }}
              className={`flex-1 pb-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                isLogin
                  ? 'text-[#14161F] border-[#14161F]'
                  : 'text-[#8B909C] border-transparent hover:text-[#5B6270]'
              }`}
            >
              Log in
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError('');
              }}
              className={`flex-1 pb-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                !isLogin
                  ? 'text-[#14161F] border-[#14161F]'
                  : 'text-[#8B909C] border-transparent hover:text-[#5B6270]'
              }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name field - Register only */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-[#3A3F4B] mb-1.5">
                  Full name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#D7D9D3] bg-white focus:outline-none focus:ring-1 focus:ring-[#0E9594] focus:border-[#0E9594] transition-colors text-[#14161F] placeholder:text-[#A9AEB9]"
                  required={!isLogin}
                  disabled={loading}
                  autoFocus={!isLogin}
                />
              </div>
            )}

            {/* Email field */}
            <div>
              <label className="block text-sm font-medium text-[#3A3F4B] mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 rounded-md border border-[#D7D9D3] bg-white focus:outline-none focus:ring-1 focus:ring-[#0E9594] focus:border-[#0E9594] transition-colors text-[#14161F] placeholder:text-[#A9AEB9]"
                required
                disabled={loading}
                autoFocus={isLogin}
              />
            </div>

            {/* Password field */}
            <div>
              <label className="block text-sm font-medium text-[#3A3F4B] mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-md border border-[#D7D9D3] bg-white focus:outline-none focus:ring-1 focus:ring-[#0E9594] focus:border-[#0E9594] transition-colors text-[#14161F] placeholder:text-[#A9AEB9]"
                required
                disabled={loading}
                minLength={6}
              />
              {!isLogin && (
                <p className="text-xs text-[#8B909C] mt-1.5 font-mono">Minimum 6 characters</p>
              )}
            </div>

            {/* Phone field - Register only */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-[#3A3F4B] mb-1.5">
                  Phone number <span className="text-xs text-[#8B909C] font-normal">(for future OTP)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B6270] font-mono text-sm">
                    +977
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="9841234567"
                    className="w-full pl-14 pr-3.5 py-2.5 rounded-md border border-[#D7D9D3] bg-white focus:outline-none focus:ring-1 focus:ring-[#0E9594] focus:border-[#0E9594] transition-colors text-[#14161F] placeholder:text-[#A9AEB9] font-mono"
                    required={!isLogin}
                    disabled={loading}
                    maxLength={10}
                  />
                </div>
                <p className="text-xs text-[#8B909C] mt-1.5 font-mono">10-digit number (e.g., 9841234567)</p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 bg-[#14161F] hover:bg-[#272A36] text-white font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading…' : (isLogin ? 'Sign in' : 'Create account')}
            </button>
          </form>

          {/* Toggle between login/register */}
          <p className="text-sm text-[#5B6270] text-center mt-6">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setPassword('');
              }}
              className="ml-2 text-[#0E9594] hover:text-[#0B7A79] font-medium hover:underline underline-offset-2"
            >
              {isLogin ? 'Register' : 'Log in'}
            </button>
          </p>

          {/* Forgot password - optional */}
          {isLogin && (
            <div className="text-center mt-3">
              <button
                type="button"
                onClick={() => {/* Add forgot password logic */}}
                className="text-xs text-[#8B909C] hover:text-[#5B6270] hover:underline underline-offset-2"
              >
                Forgot password?
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;