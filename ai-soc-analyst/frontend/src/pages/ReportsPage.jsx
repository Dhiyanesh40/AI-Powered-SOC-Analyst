import { FileText, ExternalLink } from "lucide-react";

/**
 * ReportsPage — Lists generated incident reports.
 *
 * Sprint 1: Shows placeholder report cards.
 * Sprint 2+: Will fetch from GET /api/reports.
 */

const placeholderReports = [
  {
    id: 1,
    title: "DDoS Hulk Attack — 192.168.10.5",
    severity: "Critical",
    date: "2026-07-16",
    summary:
      "High-volume HTTP flood detected targeting port 80 from a single source IP.",
  },
  {
    id: 2,
    title: "SSH Brute Force — 172.16.0.1",
    severity: "High",
    date: "2026-07-15",
    summary:
      "Repeated authentication failures on port 22 indicating credential stuffing.",
  },
  {
    id: 3,
    title: "Port Scan Detected — 10.0.0.12",
    severity: "Medium",
    date: "2026-07-14",
    summary:
      "SYN scan across 1024 ports detected from an internal subnet host.",
  },
];

const severityColor = {
  Critical: "bg-red-500/10 text-red-400 border-red-500/30",
  High: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  Medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  Low: "bg-blue-500/10 text-blue-400 border-blue-500/30",
};

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      {/* ── Page Header ── */}
      <div>
        <h2 className="text-2xl font-bold">Incident Reports</h2>
        <p className="text-sm text-slate-400 mt-1">
          AI-generated reports from multi-agent investigation.
        </p>
      </div>

      {/* ── Report Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {placeholderReports.map((report) => (
          <div
            key={report.id}
            className="bg-soc-surface border border-soc-border rounded-xl p-6 flex flex-col justify-between hover:border-slate-500 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                    severityColor[report.severity]
                  }`}
                >
                  {report.severity}
                </span>
                <span className="text-xs text-slate-500">{report.date}</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-100 mb-2">
                {report.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {report.summary}
              </p>
            </div>

            <button className="mt-5 flex items-center gap-2 text-xs font-semibold text-soc-accent hover:text-cyan-300 transition-colors">
              <FileText size={14} />
              <span>View Full Report</span>
              <ExternalLink size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
