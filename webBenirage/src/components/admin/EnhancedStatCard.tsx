import React from 'react';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

interface EnhancedStatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  chartData?: Array<{ value: number }>;
  color: 'blue' | 'green' | 'purple' | 'yellow' | 'red' | 'indigo';
  onClick?: () => void;
  className?: string;
}

const colorClasses = {
  blue: {
    bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
    lightBg: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    trendBg: 'bg-blue-500/10',
    trendText: 'text-blue-600'
  },
  green: {
    bg: 'bg-gradient-to-br from-green-500 to-green-600',
    lightBg: 'bg-green-50',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    trendBg: 'bg-green-500/10',
    trendText: 'text-green-600'
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-500 to-purple-600',
    lightBg: 'bg-purple-50',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    trendBg: 'bg-purple-500/10',
    trendText: 'text-purple-600'
  },
  yellow: {
    bg: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
    lightBg: 'bg-yellow-50',
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    trendBg: 'bg-yellow-500/10',
    trendText: 'text-yellow-600'
  },
  red: {
    bg: 'bg-gradient-to-br from-red-500 to-red-600',
    lightBg: 'bg-red-50',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    trendBg: 'bg-red-500/10',
    trendText: 'text-red-600'
  },
  indigo: {
    bg: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
    lightBg: 'bg-indigo-50',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    trendBg: 'bg-indigo-500/10',
    trendText: 'text-indigo-600'
  }
};

const EnhancedStatCard: React.FC<EnhancedStatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  chartData,
  color,
  onClick,
  className = ''
}) => {
  const colors = colorClasses[color];

  const renderTrendIcon = () => {
    if (!trend) return null;

    if (trend.value === 0) {
      return <Minus className="w-3 h-3" />;
    }

    return trend.isPositive ? (
      <TrendingUp className="w-3 h-3" />
    ) : (
      <TrendingDown className="w-3 h-3" />
    );
  };

  const formatValue = (val: number | string) => {
    if (typeof val === 'number') {
      if (title.toLowerCase().includes('revenue') || title.toLowerCase().includes('donation')) {
        return `$${val.toLocaleString()}`;
      }
      return val.toLocaleString();
    }
    return val;
  };

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl
        transition-all duration-300 transform hover:scale-[1.02] cursor-pointer
        border border-gray-100 group ${className}
      `}
      onClick={onClick}
    >
      {/* Background gradient overlay */}
      <div className={`absolute inset-0 ${colors.bg} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 ${colors.iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`w-6 h-6 ${colors.iconColor}`} />
          </div>

          {/* Trend indicator */}
          {trend && (
            <div className={`px-2 py-1 ${colors.trendBg} rounded-full flex items-center space-x-1`}>
              <span className={`text-xs font-medium ${colors.trendText}`}>
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </span>
              <div className={trend.isPositive ? 'text-green-600' : trend.value === 0 ? 'text-gray-600' : 'text-red-600'}>
                {renderTrendIcon()}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-2">
          <div className={`text-3xl font-bold ${colors.iconColor} group-hover:scale-105 transition-transform duration-300`}>
            {formatValue(value)}
          </div>

          <div className="text-gray-600 text-sm font-medium">
            {title}
          </div>

          {subtitle && (
            <div className="text-gray-500 text-xs">
              {subtitle}
            </div>
          )}
        </div>

        {/* Mini chart */}
        {chartData && chartData.length > 0 && (
          <div className="mt-4 h-12">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.iconColor} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={colors.iconColor} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={colors.iconColor}
                  strokeWidth={2}
                  fill={`url(#gradient-${color})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </div>
  );
};

export default EnhancedStatCard;