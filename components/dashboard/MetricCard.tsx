import React from 'react';

interface MetricCardProps {
  icon: string;
  label: string;
  value: string | number;
  unit?: string;
  color?: 'primary' | 'secondary' | 'tertiary' | 'warning' | 'error';
  description?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
}

const colorMap = {
  primary:   {
    icon: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    glow: 'shadow-primary/10',
    dot: 'bg-primary',
  },
  secondary: {
    icon: 'text-secondary',
    bg: 'bg-secondary/10',
    border: 'border-secondary/20',
    glow: 'shadow-secondary/10',
    dot: 'bg-secondary',
  },
  tertiary:  {
    icon: 'text-tertiary',
    bg: 'bg-tertiary/10',
    border: 'border-tertiary/20',
    glow: 'shadow-tertiary/10',
    dot: 'bg-tertiary',
  },
  warning:   {
    icon: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/20',
    glow: 'shadow-warning/10',
    dot: 'bg-warning',
  },
  error:     {
    icon: 'text-error',
    bg: 'bg-error/10',
    border: 'border-error/20',
    glow: 'shadow-error/10',
    dot: 'bg-error',
  },
};

const trendIcon = {
  up: { icon: 'trending_up', color: 'text-tertiary' },
  down: { icon: 'trending_down', color: 'text-error' },
  stable: { icon: 'trending_flat', color: 'text-on-surface-variant' },
};

export default function MetricCard({
  icon,
  label,
  value,
  unit,
  color = 'primary',
  description,
  trend,
  trendValue,
}: MetricCardProps) {
  const c = colorMap[color];

  return (
    <div
      className={`
        relative flex-1 min-w-0 rounded-2xl p-5
        bg-surface-container border ${c.border}
        shadow-lg ${c.glow}
        hover:border-opacity-40 hover:shadow-xl
        transition-all duration-300 group overflow-hidden
      `}
    >
      {/* Background accent */}
      <div className={`absolute -top-6 -right-6 w-24 h-24 ${c.bg} rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity`} />

      {/* Header */}
      <div className="flex items-start justify-between mb-4 relative">
        <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
          <span
            className={`material-symbols-outlined ${c.icon} text-[22px]`}
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          >
            {icon}
          </span>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${c.dot} animate-pulse`} />
          <span className="text-[10px] font-semibold text-on-surface-variant/50 uppercase tracking-widest">
            Live
          </span>
        </div>
      </div>

      {/* Value */}
      <div className="relative">
        <div className="flex items-baseline gap-1 mb-0.5">
          <span className="text-3xl font-bold text-on-surface headline-font tabular-nums leading-none">
            {value}
          </span>
          {unit && (
            <span className="text-base font-medium text-on-surface-variant">{unit}</span>
          )}
        </div>

        <p className="text-sm font-medium text-on-surface-variant">{label}</p>

        {description && (
          <p className="text-xs text-on-surface-variant/50 mt-1">{description}</p>
        )}

        {/* Trend */}
        {trend && trendValue && (
          <div className={`flex items-center gap-1 mt-2 ${trendIcon[trend].color}`}>
            <span className="material-symbols-outlined text-[14px]">{trendIcon[trend].icon}</span>
            <span className="text-xs font-medium">{trendValue}</span>
          </div>
        )}
      </div>
    </div>
  );
}
