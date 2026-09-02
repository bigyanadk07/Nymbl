
import React, {
  useState,
} from 'react';

import {
  User,
  Mail,
  Shield,
  KeyRound,
  Bell,
  Save,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';


const PersonalSettings: React.FC = () => {

  const [showPassword, setShowPassword] =
    useState(false);

  const [saved, setSaved] =
    useState(false);


  const handleSave = (
    event: React.FormEvent
  ) => {

    event.preventDefault();

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);

  };


  return (

    <div className="min-h-screen bg-[#FAFBFB] px-6 py-8 lg:px-10 lg:py-10">

      <div className="mx-auto max-w-5xl">


        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-8">

          <div className="flex items-center gap-3">

            <div className="rounded-lg bg-[#0E9594] p-1.5">

              <User
                size={18}
                className="text-white"
              />

            </div>

            <span className="text-xs font-medium uppercase tracking-wider text-[#0E9594]">
              Account Settings
            </span>

          </div>


          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#1A1A2E] sm:text-4xl">
            Personal Settings
          </h1>


          <p className="mt-1.5 text-sm text-[#6B7280]">
            Manage your personal information, security,
            and account preferences.
          </p>

        </div>


        {/* ==================================================
            SUCCESS MESSAGE
        ================================================== */}

        {saved && (

          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">

            <CheckCircle2
              size={18}
              className="text-emerald-600"
            />

            <p className="text-sm font-medium text-emerald-700">
              Your settings have been saved successfully.
            </p>

          </div>

        )}


        <form onSubmit={handleSave}>


          {/* ==================================================
              PERSONAL INFORMATION
          ================================================== */}

          <div className="mb-6 rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">

            <div className="border-b border-[#E5E7EB] px-6 py-5">

              <div className="flex items-center gap-3">

                <div className="rounded-lg bg-[#F0F9F9] p-2">

                  <User
                    size={18}
                    className="text-[#0E9594]"
                  />

                </div>

                <div>

                  <h2 className="text-sm font-semibold text-[#1A1A2E]">
                    Personal Information
                  </h2>

                  <p className="mt-0.5 text-xs text-[#6B7280]">
                    Update your basic account information.
                  </p>

                </div>

              </div>

            </div>


            <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">


              {/* FIRST NAME */}

              <div>

                <label
                  htmlFor="firstName"
                  className="mb-2 block text-sm font-medium text-[#374151]"
                >
                  First Name
                </label>

                <div className="relative">

                  <User
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                  />

                  <input
                    id="firstName"
                    type="text"
                    placeholder="Enter your first name"
                    className="w-full rounded-lg border border-[#D1D5DB] bg-white py-2.5 pl-10 pr-4 text-sm text-[#1A1A2E] outline-none transition-all placeholder:text-[#9CA3AF] focus:border-[#0E9594] focus:ring-2 focus:ring-[#0E9594]/10"
                  />

                </div>

              </div>


              {/* LAST NAME */}

              <div>

                <label
                  htmlFor="lastName"
                  className="mb-2 block text-sm font-medium text-[#374151]"
                >
                  Last Name
                </label>

                <div className="relative">

                  <User
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                  />

                  <input
                    id="lastName"
                    type="text"
                    placeholder="Enter your last name"
                    className="w-full rounded-lg border border-[#D1D5DB] bg-white py-2.5 pl-10 pr-4 text-sm text-[#1A1A2E] outline-none transition-all placeholder:text-[#9CA3AF] focus:border-[#0E9594] focus:ring-2 focus:ring-[#0E9594]/10"
                  />

                </div>

              </div>


              {/* EMAIL */}

              <div className="sm:col-span-2">

                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-[#374151]"
                >
                  Email Address
                </label>

                <div className="relative">

                  <Mail
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                  />

                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    className="w-full rounded-lg border border-[#D1D5DB] bg-white py-2.5 pl-10 pr-4 text-sm text-[#1A1A2E] outline-none transition-all placeholder:text-[#9CA3AF] focus:border-[#0E9594] focus:ring-2 focus:ring-[#0E9594]/10"
                  />

                </div>

              </div>

            </div>

          </div>


          {/* ==================================================
              SECURITY
          ================================================== */}

          <div className="mb-6 rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">

            <div className="border-b border-[#E5E7EB] px-6 py-5">

              <div className="flex items-center gap-3">

                <div className="rounded-lg bg-[#F0F9F9] p-2">

                  <Shield
                    size={18}
                    className="text-[#0E9594]"
                  />

                </div>

                <div>

                  <h2 className="text-sm font-semibold text-[#1A1A2E]">
                    Security
                  </h2>

                  <p className="mt-0.5 text-xs text-[#6B7280]">
                    Manage your password and account security.
                  </p>

                </div>

              </div>

            </div>


            <div className="space-y-5 p-6">


              {/* CURRENT PASSWORD */}

              <div>

                <label
                  htmlFor="currentPassword"
                  className="mb-2 block text-sm font-medium text-[#374151]"
                >
                  Current Password
                </label>

                <div className="relative">

                  <Lock
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                  />

                  <input
                    id="currentPassword"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    placeholder="Enter current password"
                    className="w-full rounded-lg border border-[#D1D5DB] bg-white py-2.5 pl-10 pr-11 text-sm text-[#1A1A2E] outline-none transition-all placeholder:text-[#9CA3AF] focus:border-[#0E9594] focus:ring-2 focus:ring-[#0E9594]/10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] transition-colors hover:text-[#0E9594]"
                  >

                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}

                  </button>

                </div>

              </div>


              {/* NEW PASSWORD */}

              <div>

                <label
                  htmlFor="newPassword"
                  className="mb-2 block text-sm font-medium text-[#374151]"
                >
                  New Password
                </label>

                <div className="relative">

                  <KeyRound
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                  />

                  <input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    className="w-full rounded-lg border border-[#D1D5DB] bg-white py-2.5 pl-10 pr-4 text-sm text-[#1A1A2E] outline-none transition-all placeholder:text-[#9CA3AF] focus:border-[#0E9594] focus:ring-2 focus:ring-[#0E9594]/10"
                  />

                </div>

              </div>


              {/* CONFIRM PASSWORD */}

              <div>

                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-[#374151]"
                >
                  Confirm New Password
                </label>

                <div className="relative">

                  <KeyRound
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                  />

                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    className="w-full rounded-lg border border-[#D1D5DB] bg-white py-2.5 pl-10 pr-4 text-sm text-[#1A1A2E] outline-none transition-all placeholder:text-[#9CA3AF] focus:border-[#0E9594] focus:ring-2 focus:ring-[#0E9594]/10"
                  />

                </div>

              </div>

            </div>

          </div>


          {/* ==================================================
              NOTIFICATIONS
          ================================================== */}

          <div className="mb-6 rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">

            <div className="border-b border-[#E5E7EB] px-6 py-5">

              <div className="flex items-center gap-3">

                <div className="rounded-lg bg-[#F0F9F9] p-2">

                  <Bell
                    size={18}
                    className="text-[#0E9594]"
                  />

                </div>

                <div>

                  <h2 className="text-sm font-semibold text-[#1A1A2E]">
                    Notifications
                  </h2>

                  <p className="mt-0.5 text-xs text-[#6B7280]">
                    Choose which account notifications you receive.
                  </p>

                </div>

              </div>

            </div>


            <div className="divide-y divide-[#E5E7EB]">


              {/* USAGE ALERTS */}

              <label className="flex cursor-pointer items-center justify-between gap-5 px-6 py-5">

                <div>

                  <p className="text-sm font-medium text-[#1A1A2E]">
                    Usage alerts
                  </p>

                  <p className="mt-1 text-xs text-[#6B7280]">
                    Receive notifications when you are approaching your API usage limit.
                  </p>

                </div>

                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 cursor-pointer accent-[#0E9594]"
                />

              </label>


              {/* SUBSCRIPTION ALERTS */}

              <label className="flex cursor-pointer items-center justify-between gap-5 px-6 py-5">

                <div>

                  <p className="text-sm font-medium text-[#1A1A2E]">
                    Subscription notifications
                  </p>

                  <p className="mt-1 text-xs text-[#6B7280]">
                    Receive notifications about your subscription status and renewal.
                  </p>

                </div>

                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 cursor-pointer accent-[#0E9594]"
                />

              </label>


              {/* PRODUCT UPDATES */}

              <label className="flex cursor-pointer items-center justify-between gap-5 px-6 py-5">

                <div>

                  <p className="text-sm font-medium text-[#1A1A2E]">
                    Product updates
                  </p>

                  <p className="mt-1 text-xs text-[#6B7280]">
                    Receive important updates about the API Store.
                  </p>

                </div>

                <input
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer accent-[#0E9594]"
                />

              </label>

            </div>

          </div>


          {/* ==================================================
              SAVE
          ================================================== */}

          <div className="flex items-center justify-end">

            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-[#0E9594] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#0B7F7E] focus:outline-none focus:ring-2 focus:ring-[#0E9594]/20"
            >

              <Save size={17} />

              Save Changes

            </button>

          </div>


        </form>

      </div>

    </div>

  );

};

export default PersonalSettings;