import React, { useState } from 'react';
import {
  ApiKey,
  revokeApiKey,
  updateApiKeyStatus,
} from '../../services/apiKey.service';
import {
  Key,
  Eye,
  EyeOff,
  Copy,
  Check,
  Clock,
  Calendar,
  MoreVertical,
  Power,
  Trash2,
  AlertCircle,
  Shield,
  Lock,
  Globe,
} from 'lucide-react';

interface ApiTokenCardProps {
  apiKey: ApiKey;
  apiName?: string;
  onUpdated: () => void;
}

const ApiTokenCard: React.FC<ApiTokenCardProps> = ({
  apiKey,
  apiName,
  onUpdated,
}) => {
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  const formatDate = (
    dateString?: string | null
  ) => {
    if (!dateString) {
      return 'Never';
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ==========================================================
  // FORMAT RELATIVE TIME
  // ==========================================================

  const getRelativeTime = (dateString?: string | null) => {
    if (!dateString) return 'Never';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  // ==========================================================
  // CHECK IF EXPIRING SOON
  // ==========================================================

  const isExpiringSoon = () => {
    if (!apiKey.expiresAt) return false;
    const expDate = new Date(apiKey.expiresAt);
    const now = new Date();
    const diffDays = (expDate.getTime() - now.getTime()) / 86400000;
    return diffDays > 0 && diffDays < 7;
  };

  const isExpired = () => {
    if (!apiKey.expiresAt) return false;
    return new Date(apiKey.expiresAt) < new Date();
  };

  // ==========================================================
  // COPY API KEY
  // ==========================================================

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        apiKey.key
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error(
        'Failed to copy API key:',
        err
      );

      setError(
        'Unable to copy API key.'
      );
    }
  };

  // ==========================================================
  // ACTIVATE / DEACTIVATE
  // ==========================================================

  const handleToggleStatus = async () => {
    try {
      setLoading(true);
      setError('');

      await updateApiKeyStatus(
        apiKey.id,
        !apiKey.isActive
      );

      onUpdated();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to update API key status.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // REVOKE
  // ==========================================================

  const handleRevoke = async () => {
    const confirmed = window.confirm(
      '⚠️ Are you sure you want to revoke this API key?\n\nThis action cannot be undone and will immediately invalidate all requests using this key.'
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      await revokeApiKey(
        apiKey.id
      );

      onUpdated();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to revoke API key.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // DISPLAYED KEY
  // ==========================================================

  const displayedKey = showKey
    ? apiKey.key
    : `${apiKey.key.substring(
        0,
        8
      )}••••••••••••••••`;

  // ==========================================================
  // RENDER
  // ==========================================================

  const isExpiring = isExpiringSoon();
  const expired = isExpired();

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
      
      {/* Background accent */}
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br from-[#0E9594]/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
      
      {/* Status indicator bar */}
      <div className={`absolute left-0 top-0 h-1 w-full transition-all duration-500 ${
        apiKey.isActive 
          ? 'bg-gradient-to-r from-[#10B981] to-emerald-400' 
          : 'bg-gradient-to-r from-[#6B7280] to-gray-400'
      }`} />

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="relative flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <div className={`rounded-xl p-2.5 transition-all duration-300 ${
              apiKey.isActive 
                ? 'bg-[#F0FDF4] group-hover:bg-[#D1FAE5]' 
                : 'bg-[#F3F4F6] group-hover:bg-[#E5E7EB]'
            }`}>
              <Key size={18} className={`${
                apiKey.isActive ? 'text-[#10B981]' : 'text-[#6B7280]'
              }`} />
            </div>
            
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-[#1A1A2E]">
                {apiName || apiKey.api?.name || 'API Token'}
              </h3>
              <p className="text-xs text-[#6B7280]">
                ID: {apiKey.apiId}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Badge */}
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium transition-all duration-300 ${
              apiKey.isActive
                ? 'bg-[#F0FDF4] text-[#10B981] ring-1 ring-[#10B981]/20'
                : 'bg-[#F3F4F6] text-[#6B7280] ring-1 ring-[#6B7280]/10'
            }`}
          >
            <span
              className={`relative flex h-2 w-2 ${
                apiKey.isActive ? 'animate-pulse' : ''
              }`}
            >
              <span
                className={`absolute inline-flex h-full w-full rounded-full ${
                  apiKey.isActive
                    ? 'bg-[#10B981] opacity-75'
                    : 'bg-[#6B7280]'
                }`}
              />
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${
                  apiKey.isActive ? 'bg-[#10B981]' : 'bg-[#6B7280]'
                }`}
              />
            </span>
            {apiKey.isActive ? 'Active' : 'Inactive'}
          </span>

          {/* More menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="rounded-lg p-1.5 text-[#6B7280] transition-all hover:bg-[#F3F4F6] hover:text-[#1A1A2E]"
            >
              <MoreVertical size={18} />
            </button>

            {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 z-20 mt-1 w-48 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white py-1 shadow-lg">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      handleToggleStatus();
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[#1A1A2E] transition-colors hover:bg-[#F3F4F6]"
                  >
                    <Power size={14} className={apiKey.isActive ? 'text-[#F59E0B]' : 'text-[#10B981]'} />
                    {apiKey.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      handleRevoke();
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[#EF4444] transition-colors hover:bg-[#FEF2F2]"
                  >
                    <Trash2 size={14} />
                    Revoke
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

      </div>

      {/* ======================================================
          API KEY
      ====================================================== */}

      <div className="relative mt-6">
        <label className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#6B7280]">
          <Lock size={12} />
          API Key
        </label>

        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1 overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#FAFBFB] transition-all hover:border-[#0E9594]/30">
            <div className="flex items-center px-4 py-2.5">
              <span className="font-mono text-sm text-[#1A1A2E] break-all">
                {displayedKey}
              </span>
            </div>
            
            {/* Key visibility indicator */}
            {!showKey && (
              <div className="absolute inset-y-0 right-0 flex items-center bg-gradient-to-l from-[#FAFBFB] via-[#FAFBFB]/80 to-transparent pl-8 pr-3">
                <span className="text-[10px] font-medium text-[#6B7280]">••••</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-medium text-[#1A1A2E] transition-all hover:border-[#0E9594] hover:bg-[#F0F9F9] hover:text-[#0E9594]"
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              <span className="hidden sm:inline">{showKey ? 'Hide' : 'Show'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-all ${
                copied
                  ? 'bg-[#10B981] hover:bg-[#059669]'
                  : 'bg-gradient-to-r from-[#0E9594] to-[#0B7A7A] hover:shadow-lg hover:shadow-[#0E9594]/25'
              }`}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================
          METADATA
      ====================================================== */}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        
        <div className="rounded-xl bg-[#FAFBFB] p-3">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-[#6B7280]" />
            <p className="text-xs font-medium text-[#6B7280]">Created</p>
          </div>
          <p className="mt-1 text-sm text-[#1A1A2E]">
            {formatDate(apiKey.createdAt)}
          </p>
          <p className="text-xs text-[#6B7280]">
            {getRelativeTime(apiKey.createdAt)}
          </p>
        </div>

        <div className="rounded-xl bg-[#FAFBFB] p-3">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-[#6B7280}" />
            <p className="text-xs font-medium text-[#6B7280]">Expires</p>
          </div>
          <p className={`mt-1 text-sm ${
            expired 
              ? 'text-[#EF4444]' 
              : isExpiring 
                ? 'text-[#F59E0B]' 
                : 'text-[#1A1A2E]'
          }`}>
            {formatDate(apiKey.expiresAt)}
          </p>
          {apiKey.expiresAt && (
            <p className={`text-xs ${
              expired 
                ? 'text-[#EF4444]' 
                : isExpiring 
                  ? 'text-[#F59E0B]' 
                  : 'text-[#6B7280]'
            }`}>
              {expired ? '⚠️ Expired' : isExpiring ? '⚠️ Expiring soon' : getRelativeTime(apiKey.expiresAt)}
            </p>
          )}
        </div>

        <div className="rounded-xl bg-[#FAFBFB] p-3">
          <div className="flex items-center gap-2">
            <Globe size={14} className="text-[#6B7280}" />
            <p className="text-xs font-medium text-[#6B7280]">Last Used</p>
          </div>
          <p className="mt-1 text-sm text-[#1A1A2E]">
            {formatDate(apiKey.lastUsedAt)}
          </p>
          <p className="text-xs text-[#6B7280]">
            {apiKey.lastUsedAt ? getRelativeTime(apiKey.lastUsedAt) : 'Never used'}
          </p>
        </div>

      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-[#FEE2E2] bg-[#FEF2F2] p-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-[#EF4444]" />
          <p className="text-sm text-[#EF4444]">
            {error}
          </p>
          <button
            onClick={() => setError('')}
            className="ml-auto text-[#EF4444] hover:text-[#DC2626]"
          >
            ×
          </button>
        </div>
      )}

      {/* ======================================================
          QUICK ACTIONS (Mobile friendly)
      ====================================================== */}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#F3F4F6] pt-5">
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <Shield size={14} className="text-[#0E9594]" />
          <span>Last rotated: {getRelativeTime(apiKey.updatedAt)}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={handleToggleStatus}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
              apiKey.isActive
                ? 'border-[#F59E0B]/30 bg-[#FEF3C7] text-[#F59E0B] hover:bg-[#FDE68A]'
                : 'border-[#10B981]/30 bg-[#F0FDF4] text-[#10B981] hover:bg-[#D1FAE5]'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Power size={14} />
            {loading ? 'Processing...' : apiKey.isActive ? 'Deactivate' : 'Activate'}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleRevoke}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#EF4444] to-[#DC2626] px-4 py-2 text-sm font-medium text-white shadow-sm shadow-[#EF4444]/20 transition-all hover:shadow-lg hover:shadow-[#EF4444]/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 size={14} />
            Revoke
          </button>
        </div>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/80 backdrop-blur-sm transition-all">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E5E7EB] border-t-[#0E9594]" />
            <p className="text-sm font-medium text-[#0E9594]">Processing...</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default ApiTokenCard;