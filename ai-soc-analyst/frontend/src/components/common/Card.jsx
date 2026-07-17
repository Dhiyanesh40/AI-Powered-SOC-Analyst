import React from 'react';

export const Card = ({ title, subtitle, icon, children, footer, className = '' }) => {
  return (
    <div className={`bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 shadow-lg transition-all duration-300 hover:border-cyan-500/30 ${className}`}>
      {(title || icon) && (
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700/30">
          <div>
            {title && <h3 className="text-lg font-bold text-slate-100">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {icon && <div className="text-cyan-400">{icon}</div>}
        </div>
      )}
      <div className="text-slate-200">{children}</div>
      {footer && (
        <div className="mt-4 pt-3 border-t border-slate-700/30 flex items-center justify-between text-xs text-slate-400">
          {footer}
        </div>
      )}
    </div>
  );
};
