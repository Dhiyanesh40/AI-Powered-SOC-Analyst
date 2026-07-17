import { Inbox } from 'lucide-react';
import clsx from 'clsx';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No data found',
  description = 'There are no items to display at this time.',
  actionLabel,
  onAction,
  className,
}) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center py-16 px-6 text-center',
        className
      )}
    >
      {/* Icon */}
      <div className="relative mb-5">
        <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
          <Icon className="w-10 h-10 text-slate-500" />
        </div>
        <div className="absolute inset-0 bg-slate-500/5 rounded-2xl blur-xl" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-slate-300 mb-2">{title}</h3>

      {/* Description */}
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>

      {/* Action */}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className={clsx(
            'px-5 py-2.5 rounded-lg text-sm font-medium',
            'bg-gradient-to-r from-cyan-500 to-blue-600',
            'text-white shadow-lg shadow-cyan-500/20',
            'hover:shadow-cyan-500/40 hover:scale-105',
            'active:scale-95 transition-all duration-200'
          )}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
