import { useState, useEffect } from "react";
import { FileText, Search, Filter, Download, Trash2, Eye, X, AlertTriangle } from "lucide-react";
import api from "../services/api";
import { formatDate } from "../utils/formatters";

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportToDelete, setReportToDelete] = useState(null);
  
  const [severityFilter, setSeverityFilter] = useState("All");
  const [threatTypeFilter, setThreatTypeFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/reports");
      setReports(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDownload = (report) => {
    const text = `Incident Report #${report.id}
Dataset: ${report.filename}
Date: ${formatDate(report.date)}
Severity: ${report.threat_level}
Threats Detected: ${report.detected_threats}
Confidence: ${report.confidence}
Attack Types: ${report.attack_types || "N/A"}

--- EXECUTIVE SUMMARY ---
${report.executive_summary || "N/A"}

--- TECHNICAL DETAILS ---
${report.technical_details || "N/A"}

--- REMEDIATION STEPS ---
${report.remediation_steps || "N/A"}
`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // Extract base filename if it has UUID prefix
    const safeName = report.filename.split('_').slice(1).join('_') || report.filename;
    a.download = `Report_${report.id}_${safeName}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async () => {
    if (!reportToDelete) return;
    try {
      await api.delete(`/api/reports/${reportToDelete.id}`);
      setReports(reports.filter(r => r.id !== reportToDelete.id));
      setReportToDelete(null);
    } catch (err) {
      console.error("Failed to delete report", err);
    }
  };

  const filteredReports = reports.filter((report) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = report.id.toString().includes(term) ||
      (report.filename && report.filename.toLowerCase().includes(term)) ||
      (report.threat_level && report.threat_level.toLowerCase().includes(term)) ||
      (report.attack_types && report.attack_types.toLowerCase().includes(term));
      
    const matchesSeverity = severityFilter === "All" || report.threat_level === severityFilter;
    
    // threatTypeFilter might be a specific attack string
    const matchesThreat = threatTypeFilter === "All" || (report.attack_types && report.attack_types.includes(threatTypeFilter));
    
    let matchesDate = true;
    if (dateFilter !== "All" && report.date) {
        const reportDate = new Date(report.date);
        const now = new Date();
        const diffHours = (now - reportDate) / (1000 * 60 * 60);
        if (dateFilter === "Last 24 Hours" && diffHours > 24) matchesDate = false;
        if (dateFilter === "Last 7 Days" && diffHours > 168) matchesDate = false;
        if (dateFilter === "Last 30 Days" && diffHours > 720) matchesDate = false;
    }
    
    return matchesSearch && matchesSeverity && matchesThreat && matchesDate;
  });

  // Extract unique threat types for dropdown
  const uniqueThreats = Array.from(new Set(reports.map(r => r.attack_types).filter(Boolean)));

  return (
    <div className="space-y-8">
      {/* ── Page Header ── */}
      <div>
        <h2 className="text-2xl font-bold text-slate-50">Incident Reports</h2>
        <p className="text-sm text-slate-400 mt-1">
          Review and manage generated AI incident reports.
        </p>
      </div>

      {/* ── Controls (Search & Filter) ── */}
      <div className="flex flex-col xl:flex-row gap-4 justify-between xl:items-center bg-soc-surface p-4 rounded-xl border border-soc-border shadow-sm">
        <div className="relative w-full xl:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search by ID, Filename, or Threat..."
            className="w-full bg-slate-800/50 border border-slate-700 text-sm text-slate-200 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-soc-primary focus:ring-1 focus:ring-soc-primary transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-3 w-full xl:w-auto items-center text-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Severity:</span>
            <select 
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-300 focus:outline-none focus:border-soc-primary"
            >
              <option value="All">All</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Threat:</span>
            <select 
              value={threatTypeFilter}
              onChange={(e) => setThreatTypeFilter(e.target.value)}
              className="bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-300 focus:outline-none focus:border-soc-primary max-w-[150px] truncate"
            >
              <option value="All">All</option>
              {uniqueThreats.map((threat) => (
                <option key={threat} value={threat}>{threat}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Date:</span>
            <select 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-300 focus:outline-none focus:border-soc-primary"
            >
              <option value="All">All Time</option>
              <option value="Last 24 Hours">Last 24 Hours</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Reports Table ── */}
      <div className="bg-soc-surface border border-soc-border rounded-xl flex flex-col overflow-hidden shadow-sm">
        <div className="overflow-x-auto min-w-0">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#172033] sticky top-0 text-xs text-slate-400 uppercase font-medium border-b border-soc-border">
              <tr>
                <th className="px-6 py-4">Report ID</th>
                <th className="px-6 py-4">Dataset Filename</th>
                <th className="px-6 py-4">Threat Type</th>
                <th className="px-6 py-4">Threat Level</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soc-border text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    <div className="flex justify-center items-center gap-3">
                      <svg className="animate-spin h-5 w-5 text-soc-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Loading reports...
                    </div>
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FileText size={48} className="text-slate-600 mb-4" />
                      <p className="text-base font-medium text-slate-300">{searchTerm || severityFilter !== "All" || dateFilter !== "All" || threatTypeFilter !== "All" ? "No Matching Reports" : "No Reports Available"}</p>
                      <p className="text-sm text-slate-500 mt-1">{searchTerm || severityFilter !== "All" || dateFilter !== "All" || threatTypeFilter !== "All" ? "Try adjusting your filters." : "Upload and analyze a dataset to generate reports."}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-200">{report.id}</td>
                    <td className="px-6 py-4 text-slate-400 truncate max-w-xs" title={report.filename}>{report.filename}</td>
                    <td className="px-6 py-4 font-semibold text-soc-accent truncate max-w-xs">{report.attack_types || "N/A"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                        report.threat_level === 'Critical' ? 'bg-soc-critical/20 text-soc-critical border border-soc-critical/30' :
                        report.threat_level === 'High' ? 'bg-soc-warning/20 text-soc-warning border border-soc-warning/30' :
                        report.threat_level === 'Medium' ? 'bg-soc-accent/20 text-soc-accent border border-soc-accent/30' :
                        'bg-soc-success/20 text-soc-success border border-soc-success/30'
                      }`}>
                        {report.threat_level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{formatDate(report.date)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setSelectedReport(report)}
                          className="p-1.5 text-slate-400 hover:text-soc-primary transition-colors rounded hover:bg-slate-800" 
                          title="View Report"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleDownload(report)}
                          className="p-1.5 text-slate-400 hover:text-soc-accent transition-colors rounded hover:bg-slate-800" 
                          title="Download TXT"
                        >
                          <Download size={16} />
                        </button>
                        <button 
                          onClick={() => setReportToDelete(report)}
                          className="p-1.5 text-slate-400 hover:text-soc-critical transition-colors rounded hover:bg-slate-800" 
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        {!loading && filteredReports.length > 0 && (
          <div className="px-6 py-4 border-t border-soc-border flex items-center justify-between text-sm text-slate-400 bg-slate-800/20">
            <span>Showing 1 to {filteredReports.length} of {filteredReports.length} results</span>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors disabled:opacity-50" disabled>Previous</button>
              <button className="px-3 py-1.5 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors disabled:opacity-50" disabled>Next</button>
            </div>
          </div>
        )}
      </div>

      {/* ── View Report Modal ── */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-soc-surface border border-soc-border rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-soc-border flex items-center justify-between bg-[#172033]">
              <h3 className="text-lg font-bold text-slate-50 flex items-center gap-2">
                <FileText size={18} className="text-soc-primary" />
                Incident Report #{selectedReport.id}
              </h3>
              <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-8 flex-1">
              <div>
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Executive Summary</h4>
                <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50 text-slate-200">
                  <p>{selectedReport.executive_summary || "No executive summary provided."}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Technical Details</h4>
                <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50 text-slate-200 font-mono text-sm whitespace-pre-wrap">
                  {selectedReport.technical_details || "No technical details provided."}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Remediation Steps</h4>
                <div className="bg-soc-primary/5 p-4 rounded-lg border border-soc-primary/20 text-slate-200">
                  <p>{selectedReport.remediation_steps || "No remediation steps provided."}</p>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-soc-border bg-[#172033] flex justify-between items-center">
              <button 
                onClick={() => handleDownload(selectedReport)}
                className="px-4 py-2 bg-soc-primary hover:bg-blue-600 text-white rounded-lg transition-colors font-medium text-sm flex items-center gap-2"
              >
                <Download size={16} /> Download TXT
              </button>
              <button 
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors font-medium text-sm border border-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {reportToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-soc-surface border border-soc-border rounded-xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden scale-in-center">
            <div className="p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
                <AlertTriangle size={24} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-50 mb-2">Delete Report</h3>
              <p className="text-slate-400 text-sm mb-6">
                Are you sure you want to delete Incident Report #{reportToDelete.id}? This action cannot be undone and will be permanently removed from the system.
              </p>
              
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setReportToDelete(null)}
                  className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors font-medium text-sm border border-slate-700"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium text-sm shadow-md hover:shadow-lg"
                >
                  Delete Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
