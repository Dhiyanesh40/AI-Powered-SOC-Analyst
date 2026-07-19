import { useState, useEffect } from "react";
import { Clock, Search, ChevronDown, ChevronUp, FileText, Activity, CheckCircle, Database } from "lucide-react";
import api from "../services/api";
import { formatDate } from "../utils/formatters";

export default function HistoryPage() {
  const [historyJobs, setHistoryJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedJobs, setExpandedJobs] = useState({});

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get("/api/history");
        // Expecting an array of jobs, each containing multiple events
        // e.g. { jobId, dataset, events: [{ timestamp, type, stage, status, duration, details }] }
        setHistoryJobs(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        // Endpoint doesn't exist yet, graceful fallback
        setHistoryJobs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const toggleJob = (jobId) => {
    setExpandedJobs(prev => ({
      ...prev,
      [jobId]: !prev[jobId]
    }));
  };

  const filteredJobs = historyJobs.filter((job) => {
    if (job.dataset.toLowerCase().includes(searchTerm.toLowerCase())) return true;
    if (job.events?.some((e) => e.type.toLowerCase().includes(searchTerm.toLowerCase()) || e.stage.toLowerCase().includes(searchTerm.toLowerCase()) || e.details?.toLowerCase().includes(searchTerm.toLowerCase()))) return true;
    return false;
  });

  return (
    <div className="space-y-8 pb-10">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-50">Audit Log</h2>
          <p className="text-sm text-slate-400 mt-1">
            Dataset-centric lifecycle history of all analysis jobs.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search dataset or event..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-soc-surface border border-soc-border text-sm text-slate-200 placeholder-slate-500 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-soc-primary focus:ring-1 focus:ring-soc-primary transition-colors"
          />
        </div>
      </div>

      {/* ── Audit Log Content ── */}
      <div className="bg-soc-surface border border-soc-border rounded-xl shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
            <svg
              className="animate-spin h-6 w-6 text-soc-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-sm font-medium">Loading audit logs...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px]">
            <div className="bg-slate-800/30 p-4 rounded-full mb-4 border border-slate-700/50">
              <Database size={32} className="text-slate-500" />
            </div>
            <p className="text-lg font-semibold text-slate-300">{searchTerm ? "No Matching Results" : "No Analysis History Available"}</p>
            <p className="text-sm text-slate-500 mt-2 text-center max-w-sm">
              {searchTerm ? "Try adjusting your search term." : "When you upload and analyze network traffic logs, the complete lifecycle will be recorded here."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-soc-border">
            {filteredJobs.map((job) => (
              <div key={job.id || job.dataset} className="flex flex-col">
                {/* Job Header (Expandable) */}
                <button 
                  onClick={() => toggleJob(job.id || job.dataset)}
                  className="flex items-center justify-between p-5 hover:bg-slate-800/30 transition-colors w-full text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-soc-primary/10 p-2.5 rounded-lg border border-soc-primary/20">
                      <FileText size={20} className="text-soc-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">{job.dataset}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 font-medium">
                        <span className="flex items-center gap-1"><Clock size={12}/> {job.events?.[0]?.timestamp ? formatDate(job.events[0].timestamp) : "Unknown"}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Activity size={12}/> {job.events?.length || 0} Events</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-slate-500">
                    {expandedJobs[job.id || job.dataset] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </button>

                {/* Job Events (Timeline) */}
                {expandedJobs[job.id || job.dataset] && (
                  <div className="p-6 bg-slate-800/20 border-t border-soc-border">
                    <div className="relative border-l border-slate-700 ml-4 space-y-8">
                      {job.events?.map((event, idx) => (
                        <div key={idx} className="relative pl-6">
                          {/* Timeline Node */}
                          <span className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-[#172033] border-2 border-soc-accent" />
                          
                          {/* Event Details */}
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-3">
                                <h4 className="text-sm font-semibold text-slate-200">{event.stage}</h4>
                                <span className="bg-soc-success/10 text-soc-success border border-soc-success/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                  {event.status}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 font-medium">{event.type}</p>
                              <p className="text-sm text-slate-300 mt-2 leading-relaxed max-w-2xl">
                                {event.details}
                              </p>
                            </div>
                            
                            <div className="flex sm:flex-col items-center sm:items-end gap-3 text-xs text-slate-500 font-medium">
                              <span className="flex items-center gap-1.5"><Clock size={14}/> {formatDate(event.timestamp)}</span>
                              {event.duration && (
                                <span className="text-slate-400 bg-slate-800 px-2 py-1 rounded border border-slate-700">
                                  {event.duration}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
