import { Clock, Search } from "lucide-react";

/**
 * HistoryPage — Chronological log of all past analyses.
 *
 * Sprint 1: Static timeline entries.
 * Sprint 2+: Will fetch from GET /api/history.
 */

const placeholderHistory = [
  {
    id: 1,
    action: "CSV Uploaded",
    detail: "Friday-WorkingHours-Afternoon-DDos.pcap_ISCX.csv",
    timestamp: "2026-07-16 16:21:40",
  },
  {
    id: 2,
    action: "ML Analysis Completed",
    detail: "318 anomalies detected out of 842,912 flow records.",
    timestamp: "2026-07-16 16:22:05",
  },
  {
    id: 3,
    action: "Agent Investigation Started",
    detail: "Orchestrator dispatched Log Analysis Agent for Alert #47.",
    timestamp: "2026-07-16 16:22:12",
  },
  {
    id: 4,
    action: "Report Generated",
    detail: "Incident report created for DDoS Hulk attack on 192.168.10.5.",
    timestamp: "2026-07-16 16:23:30",
  },
];

export default function HistoryPage() {
  return (
    <div className="space-y-8">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Activity History</h2>
          <p className="text-sm text-slate-400 mt-1">
            Chronological log of uploads, analyses, and reports.
          </p>
        </div>

        {/* Search bar (placeholder) */}
        <div className="flex items-center gap-2 bg-soc-surface border border-soc-border rounded-lg px-3 py-2">
          <Search size={16} className="text-slate-500" />
          <input
            type="text"
            placeholder="Search history..."
            className="bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none w-48"
          />
        </div>
      </div>

      {/* ── Timeline ── */}
      <div className="relative border-l-2 border-soc-border ml-4">
        {placeholderHistory.map((entry) => (
          <div key={entry.id} className="ml-6 mb-8 relative">
            {/* Dot on the timeline */}
            <span className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-soc-bg border-2 border-soc-accent flex items-center justify-center">
              <span className="h-1.5 w-1.5 rounded-full bg-soc-accent" />
            </span>

            {/* Entry card */}
            <div className="bg-soc-surface border border-soc-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-100">
                  {entry.action}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock size={12} />
                  <span>{entry.timestamp}</span>
                </div>
              </div>
              <p className="text-xs text-slate-400">{entry.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
