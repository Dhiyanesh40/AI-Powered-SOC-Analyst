import { TrendingUp, TrendingDown } from 'lucide-react';
import clsx from 'clsx';

const colorMap = {
  cyan: {
    iconBg: 'from-cyan-500/20 to-cyan-600/10',
    iconText: 'text-cyan-400',
    glow: 'shadow-cyan-500/10',
  },
  blue: {
    iconBg: 'from-blue-500/20 to-blue-600/10',
    iconText: 'text-blue-400',
    glow: 'shadow-blue-500/10',
  },
  red: {
    iconBg: 'from-red-500/20 to-red-600/10',
    iconText: 'text-red-400',
    glow: 'shadow-red-500/10',
  },
  orange: {
    iconBg: 'from-orange-500/20 to-orange-600/10',
    iconText: 'text-orange-400',
    glow: 'shadow-orange-500/10',
  },
  green: {
    iconBg: 'from-emerald-500/20 to-emerald-600/10',
    iconText: 'text-emerald-400',
    glow: 'shadow-emerald-500/10',
  },
  purple: {
    iconBg: 'from-purple-500/20 to-purple-600/10',
    iconText: 'text-purple-400',
    glow: 'shadow-purple-500/10',
  },
  yellow: {
    iconBg: 'from-yellow-500/20 to-yellow-600/10',
    iconText: 'text-yellow-400',
    glow: 'shadow-yellow-500/10',
  },
};

export default function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  color = 'cyan',
  className,
}) {
  const palette = colorMap[color] || colorMap.cyan;
  const isPositive = trend?.startsWith('+');
  const isNegative = trend?.startsWith('-');

  return (
    <div
      className={clsx(
        'bg-slate-800/50 backdrop-blur-sm rounded-xl p-5',
        'border border-slate-700/50',
        'hover:border-slate-600/50 hover:shadow-lg',
        palette.glow,
        'transition-all duration-300 group',
        className
      )}
    >
      <div className="flex items-start justify-between">
        {/* Icon */}
        {Icon && (
          <div
            className={clsx(
              'p-2.5 rounded-xl bg-gradient-to-br',
              palette.iconBg,
              'group-hover:scale-110 transition-transform duration-300'
            )}
          >
            <Icon className={clsx('w-5 h-5', palette.iconText)} />
          </div>
        )}

        {/* Trend */}
        {trend && (
          <div
            className={clsx(
              'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold',
              isPositive && 'bg-emerald-500/15 text-emerald-400',
              isNegative && 'bg-red-500/15 text-red-400',
              !isPositive && !isNegative && 'bg-slate-500/15 text-slate-400'
            )}
          >
            {isPositive && <TrendingUp className="w-3 h-3" />}
            {isNegative && <TrendingDown className="w-3 h-3" />}
            {trend}
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mt-4">
        <p className="text-3xl font-bold text-slate-100 tracking-tight">
          {value}
        </p>
        <p className="text-sm text-slate-400 mt-1">{label}</p>
      </div>
    </div>
  );
}
