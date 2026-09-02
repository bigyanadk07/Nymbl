import React from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  trendValue?: string | number;
  progress?: number;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendUp = true,
  trendValue,
  progress,
  variant = 'default',
  size = 'md',
  className = '',
  onClick,
}) => {
  
  // Variant configurations
  const variantConfig = {
    default: {
      border: 'border-[#E5E7EB] hover:border-[#0E9594]/30',
      bg: 'bg-white',
      iconBg: 'bg-[#F0F9F9]',
      iconColor: 'text-[#0E9594]',
      valueColor: 'text-[#1A1A2E]',
      badgeBg: 'bg-[#F0F9F9]',
      badgeText: 'text-[#0E9594]',
      progressBar: 'from-[#0E9594] to-[#0B7A7A]',
    },
    primary: {
      border: 'border-[#0E9594]/20 hover:border-[#0E9594]/50',
      bg: 'bg-gradient-to-br from-white to-[#F0F9F9]',
      iconBg: 'bg-[#0E9594]',
      iconColor: 'text-white',
      valueColor: 'text-[#0E9594]',
      badgeBg: 'bg-[#0E9594]',
      badgeText: 'text-white',
      progressBar: 'from-[#0E9594] to-[#0B7A7A]',
    },
    success: {
      border: 'border-[#10B981]/20 hover:border-[#10B981]/50',
      bg: 'bg-gradient-to-br from-white to-[#F0FDF4]',
      iconBg: 'bg-[#10B981]',
      iconColor: 'text-white',
      valueColor: 'text-[#10B981]',
      badgeBg: 'bg-[#10B981]',
      badgeText: 'text-white',
      progressBar: 'from-[#10B981] to-[#059669]',
    },
    warning: {
      border: 'border-[#F59E0B]/20 hover:border-[#F59E0B]/50',
      bg: 'bg-gradient-to-br from-white to-[#FEF3C7]',
      iconBg: 'bg-[#F59E0B]',
      iconColor: 'text-white',
      valueColor: 'text-[#F59E0B]',
      badgeBg: 'bg-[#F59E0B]',
      badgeText: 'text-white',
      progressBar: 'from-[#F59E0B] to-[#D97706]',
    },
    danger: {
      border: 'border-[#EF4444]/20 hover:border-[#EF4444]/50',
      bg: 'bg-gradient-to-br from-white to-[#FEF2F2]',
      iconBg: 'bg-[#EF4444]',
      iconColor: 'text-white',
      valueColor: 'text-[#EF4444]',
      badgeBg: 'bg-[#EF4444]',
      badgeText: 'text-white',
      progressBar: 'from-[#EF4444] to-[#DC2626]',
    },
    info: {
      border: 'border-[#3B82F6]/20 hover:border-[#3B82F6]/50',
      bg: 'bg-gradient-to-br from-white to-[#EFF6FF]',
      iconBg: 'bg-[#3B82F6]',
      iconColor: 'text-white',
      valueColor: 'text-[#3B82F6]',
      badgeBg: 'bg-[#3B82F6]',
      badgeText: 'text-white',
      progressBar: 'from-[#3B82F6] to-[#2563EB]',
    },
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      padding: 'p-4',
      titleSize: 'text-xs',
      valueSize: 'text-xl',
      iconSize: 'p-2',
      gap: 'gap-2',
    },
    md: {
      padding: 'p-6',
      titleSize: 'text-xs',
      valueSize: 'text-2xl',
      iconSize: 'p-2.5',
      gap: 'gap-3',
    },
    lg: {
      padding: 'p-8',
      titleSize: 'text-sm',
      valueSize: 'text-3xl',
      iconSize: 'p-3',
      gap: 'gap-4',
    },
  };

  const config = variantConfig[variant];
  const sizes = sizeConfig[size];

  // Trend indicator
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trendUp) return <ArrowUpRight size={14} className="text-[#10B981]" />;
    if (trendUp === false) return <ArrowDownRight size={14} className="text-[#EF4444]" />;
    return <Minus size={14} className="text-[#6B7280]" />;
  };

  const getTrendColor = () => {
    if (!trend) return '';
    if (trendUp) return 'bg-[#F0FDF4] text-[#10B981]';
    if (trendUp === false) return 'bg-[#FEF2F2] text-[#EF4444]';
    return 'bg-[#F3F4F6] text-[#6B7280]';
  };

  // Format large numbers
  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      if (val >= 1e9) return (val / 1e9).toFixed(1) + 'B';
      if (val >= 1e6) return (val / 1e6).toFixed(1) + 'M';
      if (val >= 1e3) return (val / 1e3).toFixed(1) + 'K';
      return val.toString();
    }
    return val;
  };

  // Progress color based on percentage
  const getProgressColor = (percent: number) => {
    if (percent >= 80) return 'from-[#EF4444] to-[#DC2626]';
    if (percent >= 60) return 'from-[#F59E0B] to-[#D97706]';
    return config.progressBar;
  };

  const displayValue = typeof value === 'number' ? formatValue(value) : value;

  return (
    <div
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300
        ${config.border}
        ${config.bg}
        ${sizes.padding}
        ${onClick ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1' : 'hover:shadow-md hover:-translate-y-0.5'}
        ${className}
      `}
    >
      {/* Decorative background elements */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-[#0E9594]/5 to-transparent opacity-50"></div>
      <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-gradient-to-tr from-[#0E9594]/5 to-transparent opacity-30"></div>
      
      {/* Glow effect on hover */}
      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-[#0E9594]/10 via-transparent to-[#0E9594]/10 blur-sm"></div>
      </div>

      <div className="relative">
        {/* Header section */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className={`font-medium uppercase tracking-wider text-[#6B7280] ${sizes.titleSize}`}>
                {title}
              </p>
              {trendValue && (
                <span className={`
                  flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium
                  ${getTrendColor()}
                `}>
                  {getTrendIcon()}
                  {trendValue}
                </span>
              )}
            </div>
            
            <h3 className={`mt-1.5 font-bold tracking-tight ${config.valueColor} ${sizes.valueSize}`}>
              {displayValue}
            </h3>
          </div>

          {icon && (
            <div className={`rounded-xl ${config.iconBg} ${sizes.iconSize} shadow-sm transition-transform duration-300 hover:scale-110`}>
              <div className={config.iconColor}>
                {icon}
              </div>
            </div>
          )}
        </div>

        {/* Footer section */}
        {(subtitle || trend || progress !== undefined) && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#F3F4F6] pt-4">
            <div className="flex items-center gap-2">
              {trend && (
                <span className={`
                  flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium
                  ${getTrendColor()}
                `}>
                  {getTrendIcon()}
                  {trend}
                </span>
              )}
              
              {subtitle && (
                <span className="text-xs text-[#6B7280]">
                  {subtitle}
                </span>
              )}
            </div>

            {/* Progress bar */}
            {progress !== undefined && progress >= 0 && progress <= 100 && (
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[#F3F4F6]">
                  <div 
                    className={`h-full rounded-full bg-gradient-to-r transition-all duration-1000 ease-out ${getProgressColor(progress)}`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-[#1A1A2E]">
                  {Math.round(progress)}%
                </span>
              </div>
            )}
          </div>
        )}

        {/* Mini sparkline indicator (visual only) */}
        {variant !== 'default' && (
          <div className="absolute bottom-0 right-0 opacity-10">
            <svg width="80" height="40" viewBox="0 0 80 40" fill="none">
              <path
                d="M0 30 L10 25 L20 35 L30 15 L40 28 L50 10 L60 20 L70 8 L80 18"
                stroke={config.valueColor}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;