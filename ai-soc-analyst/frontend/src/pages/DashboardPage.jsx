import {
  ShieldAlert,
  Activity,
  FileText,
  Clock,
} from "lucide-react";

/**
 * DashboardPage — Landing page showing high-level SOC metrics.
 *
 * All data is static placeholder content for Sprint 1.
 * In Sprint 2+, these cards will be wired to GET /api/dashboard/stats.
 */

const stats = [
  {
    label: "Total Logs Ingested",
    value: "0",
    icon: Activity,
    color: "from-blue-500 to-indigo-600",
  },
  {
    label: "Threats Detected",
    value: "0",
    icon: ShieldAlert,
    color: "from-orange-500 to-red-600",
  },
  {
    label: "Reports Generated",
    value: "0",
    icon: FileText,
    color: "from-emerald-500 to-teal-600",
  },
  {
    label: "Avg Response Time",
    value: "—",
    icon: Clock,
    color: "from-purple-500 to-pink-600",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* ── Page Header ── */}
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-sm text-slate-400 mt-1">
          Overview of your Security Operations Center.
        </p>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-soc-surface border border-soc-border rounded-xl p-6 flex items-center justify-between"
          >
            <div>
              <p className="text-xs text-slate-400 font-medium">{label}</p>
              <p className="text-2xl font-extrabold mt-1">{value}</p>
            </div>
            <div
              className={`h-11 w-11 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}
            >
              <Icon size={20} className="text-white" />
            </div>
          </div>
        ))}
      </div>

      {/* ── Placeholder Panels ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-soc-surface border border-soc-border rounded-xl p-6 h-64 flex items-center justify-center">
          <p className="text-sm text-slate-500">
            Traffic chart will appear here after Sprint 2.
          </p>
        </div>
        <div className="bg-soc-surface border border-soc-border rounded-xl p-6 h-64 flex items-center justify-center">
          <p className="text-sm text-slate-500">
            Severity breakdown will appear here after Sprint 2.
          </p>
        </div>
      </div>
    </div>
  );
}
