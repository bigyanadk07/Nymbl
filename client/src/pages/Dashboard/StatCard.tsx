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
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'dark';
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
      bg: 'bg-white',
      border: 'border-[#E8ECF0]',
      hoverBorder: 'hover:border-[#2D5BFF]/20',
      shadow: 'shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(45,91,255,0.08)]',
      iconBg: 'bg-[#F0F4FF]',
      iconColor: 'text-[#2D5BFF]',
      valueColor: 'text-[#1A1F36]',
      badgeBg: 'bg-[#F0F4FF]',
      badgeText: 'text-[#2D5BFF]',
      progressBar: 'from-[#2D5BFF] to-[#1A3FB5]',
    },
    primary: {
      bg: 'bg-gradient-to-br from-[#2D5BFF] to-[#1A3FB5]',
      border: 'border-[#2D5BFF]/30',
      hoverBorder: 'hover:border-[#2D5BFF]/50',
      shadow: 'shadow-[0_4px_12px_rgba(45,91,255,0.25)] hover:shadow-[0_8px_28px_rgba(45,91,255,0.35)]',
      iconBg: 'bg-white/20 backdrop-blur-sm',
      iconColor: 'text-white',
      valueColor: 'text-white',
      badgeBg: 'bg-white/20 backdrop-blur-sm',
      badgeText: 'text-white',
      progressBar: 'from-white/40 to-white/20',
    },
    success: {
      bg: 'bg-white',
      border: 'border-[#E8ECF0]',
      hoverBorder: 'hover:border-[#22C55E]/20',
      shadow: 'shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(34,197,94,0.08)]',
      iconBg: 'bg-[#ECFDF5]',
      iconColor: 'text-[#22C55E]',
      valueColor: 'text-[#1A1F36]',
      badgeBg: 'bg-[#ECFDF5]',
      badgeText: 'text-[#22C55E]',
      progressBar: 'from-[#22C55E] to-[#16A34A]',
    },
    warning: {
      bg: 'bg-white',
      border: 'border-[#E8ECF0]',
      hoverBorder: 'hover:border-[#F59E0B]/20',
      shadow: 'shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(245,158,11,0.08)]',
      iconBg: 'bg-[#FFFBEB]',
      iconColor: 'text-[#F59E0B]',
      valueColor: 'text-[#1A1F36]',
      badgeBg: 'bg-[#FFFBEB]',
      badgeText: 'text-[#F59E0B]',
      progressBar: 'from-[#F59E0B] to-[#D97706]',
    },
    danger: {
      bg: 'bg-white',
      border: 'border-[#E8ECF0]',
      hoverBorder: 'hover:border-[#EF4444]/20',
      shadow: 'shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(239,68,68,0.08)]',
      iconBg: 'bg-[#FEF2F2]',
      iconColor: 'text-[#EF4444]',
      valueColor: 'text-[#1A1F36]',
      badgeBg: 'bg-[#FEF2F2]',
      badgeText: 'text-[#EF4444]',
      progressBar: 'from-[#EF4444] to-[#DC2626]',
    },
    info: {
      bg: 'bg-white',
      border: 'border-[#E8ECF0]',
      hoverBorder: 'hover:border-[#0EA5E9]/20',
      shadow: 'shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(14,165,233,0.08)]',
      iconBg: 'bg-[#F0F9FF]',
      iconColor: 'text-[#0EA5E9]',
      valueColor: 'text-[#1A1F36]',
      badgeBg: 'bg-[#F0F9FF]',
      badgeText: 'text-[#0EA5E9]',
      progressBar: 'from-[#0EA5E9] to-[#0284C7]',
    },
    dark: {
      bg: 'bg-[#1A1F36]',
      border: 'border-[#2D3349]',
      hoverBorder: 'hover:border-[#2D5BFF]/30',
      shadow: 'shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)]',
      iconBg: 'bg-[#2D3349]',
      iconColor: 'text-[#8B93B6]',
      valueColor: 'text-white',
      badgeBg: 'bg-[#2D3349]',
      badgeText: 'text-[#8B93B6]',
      progressBar: 'from-[#2D5BFF] to-[#1A3FB5]',
    },
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      padding: 'p-4',
      titleSize: 'text-[10px]',
      valueSize: 'text-xl',
      iconSize: 'p-1.5',
      gap: 'gap-2',
      iconContainerSize: 'w-8 h-8',
    },
    md: {
      padding: 'p-5',
      titleSize: 'text-[11px]',
      valueSize: 'text-2xl',
      iconSize: 'p-2',
      gap: 'gap-3',
      iconContainerSize: 'w-10 h-10',
    },
    lg: {
      padding: 'p-6',
      titleSize: 'text-xs',
      valueSize: 'text-3xl',
      iconSize: 'p-2.5',
      gap: 'gap-4',
      iconContainerSize: 'w-12 h-12',
    },
  };

  const config = variantConfig[variant];
  const sizes = sizeConfig[size];

  // Trend indicator
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trendUp) return <ArrowUpRight size={12} className="text-[#22C55E]" strokeWidth={2.5} />;
    if (trendUp === false) return <ArrowDownRight size={12} className="text-[#EF4444]" strokeWidth={2.5} />;
    return <Minus size={12} className="text-[#8B93B6]" strokeWidth={2.5} />;
  };

  const getTrendColor = () => {
    if (!trend) return '';
    if (trendUp) return 'bg-[#ECFDF5] text-[#16A34A]';
    if (trendUp === false) return 'bg-[#FEF2F2] text-[#DC2626]';
    return 'bg-[#F3F4F6] text-[#6B7280]';
  };

  // Format large numbers
  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      if (val >= 1e9) return (val / 1e9).toFixed(1) + 'B';
      if (val >= 1e6) return (val / 1e6).toFixed(1) + 'M';
      if (val >= 1e3) return (val / 1e3).toFixed(1) + 'K';
      return val.toLocaleString();
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

  const isDarkVariant = variant === 'dark';

  return (
    <div
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-xl border transition-all duration-300
        ${config.bg}
        ${config.border}
        ${config.shadow}
        ${sizes.padding}
        ${config.hoverBorder}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {/* Decorative gradient accent */}
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-[#2D5BFF]/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative flex flex-col gap-3">
        {/* Header section */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className={`
                font-medium uppercase tracking-wider 
                ${sizes.titleSize}
                ${isDarkVariant ? 'text-[#8B93B6]' : 'text-[#6B7280]'}
              `}>
                {title}
              </p>
            </div>
            
            <h3 className={`
              mt-1 font-semibold tracking-tight
              ${config.valueColor}
              ${sizes.valueSize}
            `}>
              {displayValue}
            </h3>
          </div>

          {icon && (
            <div className={`
              flex items-center justify-center rounded-lg
              ${config.iconBg}
              ${sizes.iconContainerSize}
              transition-all duration-200
              ${onClick ? 'group-hover:scale-105' : ''}
            `}>
              <div className={`
                ${config.iconColor}
                ${sizes.iconSize}
              `}>
                {icon}
              </div>
            </div>
          )}
        </div>

        {/* Footer section */}
        {(subtitle || trend || trendValue || progress !== undefined) && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#E8ECF0]">
            <div className="flex items-center gap-2">
              {(trend || trendValue) && (
                <span className={`
                  flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium
                  ${getTrendColor()}
                `}>
                  {getTrendIcon()}
                  {trend}
                  {trendValue && (
                    <span className="font-semibold">
                      {trendValue}
                    </span>
                  )}
                </span>
              )}
              
              {subtitle && (
                <span className={`
                  text-xs font-medium
                  ${isDarkVariant ? 'text-[#8B93B6]' : 'text-[#6B7280]'}
                `}>
                  {subtitle}
                </span>
              )}
            </div>

            {/* Progress bar */}
            {progress !== undefined && progress >= 0 && progress <= 100 && (
              <div className="flex items-center gap-2">
                <div className="h-1 w-16 overflow-hidden rounded-full bg-[#F3F4F6]">
                  <div 
                    className={`
                      h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out
                      ${getProgressColor(progress)}
                    `}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <span className={`
                  text-xs font-medium
                  ${isDarkVariant ? 'text-[#E8ECF0]' : 'text-[#1A1F36]'}
                `}>
                  {Math.round(progress)}%
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;