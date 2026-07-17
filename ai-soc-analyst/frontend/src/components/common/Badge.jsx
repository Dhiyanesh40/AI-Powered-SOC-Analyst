import React from 'react';
import { SEVERITY_COLORS, STATUS_COLORS } from '../../utils/constants';

export const Badge = ({ type = 'severity', value }) => {
  const normalized = String(value).toLowerCase();
  
  const styling = type === 'status' 
    ? STATUS_COLORS[normalized] || 'bg-slate-800 text-slate-400 border border-slate-700'
    : SEVERITY_COLORS[normalized] || 'bg-slate-800 text-slate-400 border border-slate-700';

  const isCritical = normalized === 'critical' || normalized === 'active';

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider ${styling}`}>
      {isCritical && (
        <span className="relative flex h-2 w-2 mr-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
      )}
      {value}
    </span>
  );
};
