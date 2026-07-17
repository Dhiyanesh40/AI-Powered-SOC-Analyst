export const SEVERITY_COLORS = {
  critical: 'bg-red-500/10 text-red-400 border border-red-500/30',
  high: 'bg-orange-500/10 text-orange-400 border border-orange-500/30',
  medium: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30',
  low: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
  info: 'bg-slate-500/10 text-slate-400 border border-slate-500/30'
};

export const STATUS_COLORS = {
  open: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30',
  investigating: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
  mitigated: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  resolved: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  false_positive: 'bg-slate-500/15 text-slate-400 border border-slate-500/30',
  closed: 'bg-slate-500/15 text-slate-400 border border-slate-500/30'
};

export const PROTOCOL_MAP = {
  6: 'TCP',
  17: 'UDP',
  1: 'ICMP'
};
