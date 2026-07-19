import { useState, useEffect } from "react";
import {
  ShieldAlert,
  Activity,
  Percent,
  AlertTriangle,
  Target,
  Clock,
  PieChart as PieChartIcon,
  List,
} from "lucide-react";
import api from "../services/api";
import { formatDate } from "../utils/formatters";

const SEVERITY_COLORS = {
  Critical: "bg-soc-critical/20 text-soc-critical",
  High: "bg-soc-warning/20 text-soc-warning",
  Medium: "bg-soc-accent/20 text-soc-accent",
  Low: "bg-soc-success/20 text-soc-success",
};

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/api/dashboard");
        setData(response.data);
      } catch (err) {
        // Endpoint likely doesn't exist yet, gracefully handle
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const metrics = [
    {
      label: "Logs Processed",
      value: data?.total_logs_processed?.toLocaleString() || "—",
      icon: Activity,
      color: "text-soc-primary",
      bg: "bg-soc-primary/10",
    },
    {
      label: "Threats Detected",
      value: data?.total_threats_detected?.toLocaleString() || "—",
      icon: ShieldAlert,
      color: "text-soc-critical",
      bg: "bg-soc-critical/10",
    },
    {
      label: "Threat Rate (%)",
      value: data?.threat_rate !== undefined ? `${(data.threat_rate * 100).toFixed(2)}%` : "—",
      icon: Percent,
      color: "text-soc-warning",
      bg: "bg-soc-warning/10",
    },
    {
      label: "Overall Risk Level",
      value: data?.latest_analysis?.severity || "—",
      icon: AlertTriangle,
      color: "text-soc-accent",
      bg: "bg-soc-accent/10",
    },
    {
      label: "Average Confidence",
      value: data?.average_confidence ? `${(data.average_confidence * 100).toFixed(1)}%` : "—",
      icon: Target,
      color: "text-soc-success",
      bg: "bg-soc-success/10",
    },
    {
      label: "Avg Processing Time",
      value: data?.average_processing_time ? `${data.average_processing_time.toFixed(2)}s` : "—",
      icon: Clock,
      color: "text-slate-400",
      bg: "bg-slate-800",
    },
  ];

  return (
    <div className="space-y-8">
      {/* ── Page Header ── */}
      <div>
        <h2 className="text-2xl font-bold text-slate-50">Security Overview</h2>
        <p className="text-sm text-slate-400 mt-1">
          High-level metrics and recent analysis jobs.
        </p>
      </div>

      {/* ── Metrics Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="bg-soc-surface border border-soc-border rounded-xl p-6 flex items-center justify-between shadow-sm transition-shadow hover:shadow-md"
          >
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{label}</p>
              <p className="text-2xl font-semibold mt-2 text-slate-50">
                {loading ? "..." : value}
              </p>
            </div>
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${bg}`}>
              <Icon size={24} className={color} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Content Sections ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Analysis */}
        <div className="col-span-1 lg:col-span-2 bg-soc-surface border border-soc-border rounded-xl flex flex-col overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-soc-border flex items-center gap-3">
            <Activity size={18} className="text-soc-primary" />
            <h3 className="text-base font-semibold text-slate-50">Latest Analysis</h3>
          </div>
          <div className="p-6 flex-1 flex flex-col items-center justify-center min-h-[250px]">
            {data?.latest_analysis ? (
              <div className="w-full text-slate-200">
                <p className="text-sm font-medium text-slate-400 mb-1">Dataset Filename</p>
                <p className="text-lg font-bold mb-4 truncate">{data.latest_analysis.filename}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Processed</p>
                    <p className="text-lg font-semibold">{data.latest_analysis.total_records}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Threats</p>
                    <p className="text-lg font-semibold text-soc-critical">{data.latest_analysis.threats_detected}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Time</p>
                    <p className="text-lg font-semibold">{data.latest_analysis.processing_time}s</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Severity</p>
                    <p className="text-lg font-semibold text-soc-warning">{data.latest_analysis.severity}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-slate-400">No Data Available</p>
              </div>
            )}
          </div>
        </div>

        {/* Attack Distribution */}
        <div className="col-span-1 bg-soc-surface border border-soc-border rounded-xl flex flex-col overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-soc-border flex items-center gap-3">
            <PieChartIcon size={18} className="text-soc-accent" />
            <h3 className="text-base font-semibold text-slate-50">Attack Distribution</h3>
          </div>
          <div className="p-6 flex-1 flex flex-col items-center justify-center min-h-[250px]">
            {data?.attack_distribution && Object.keys(data.attack_distribution).length > 0 ? (
              <div className="w-full space-y-3">
                {Object.entries(data.attack_distribution)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([attack, count]) => (
                    <div key={attack} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-300 truncate max-w-[150px]" title={attack}>{attack}</span>
                      <span className="text-sm font-bold text-soc-accent bg-soc-accent/10 px-2 py-0.5 rounded">{count}</span>
                    </div>
                ))}
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-slate-400">No Data Available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Recent Analyses ── */}
      <div className="bg-soc-surface border border-soc-border rounded-xl flex flex-col overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-soc-border flex items-center gap-3">
          <List size={18} className="text-slate-400" />
          <h3 className="text-base font-semibold text-slate-50">Recent Analyses</h3>
        </div>
        <div className="p-0 overflow-x-auto">
          {data?.recent_analyses && data.recent_analyses.length > 0 ? (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase font-medium">
                <tr>
                  <th className="px-6 py-4">Filename</th>
                  <th className="px-6 py-4">Threats</th>
                  <th className="px-6 py-4">Severity</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-soc-border text-slate-200">
                {data.recent_analyses.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-200">{job.filename}</td>
                    <td className="px-6 py-4">{job.threats_detected.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${SEVERITY_COLORS[job.severity] || SEVERITY_COLORS.Low}`}>
                        {job.severity || "Low"}
                      </span>
                    </td>
                    <td className="px-6 py-4">{formatDate(job.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 flex items-center justify-center">
              <p className="text-sm text-slate-400">No Data Available</p>
            </div>
          )}
        </div>
      </div>
      
      {/* ── Future Placeholder Scaffolding ── */}
      {/* 
        This space is reserved for Sprint 4 Agents. 
        Agent Activity Panel, Live Investigation Timeline, Incident Workflow 
      */}
    </div>
  );
}
