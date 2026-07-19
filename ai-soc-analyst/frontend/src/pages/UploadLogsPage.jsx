import { useState, useEffect } from "react";
import {
  UploadCloud,
  FileUp,
  AlertCircle,
  CheckCircle,
  Database,
  Shield,
  Activity,
  Zap,
  TrendingUp,
  AlertTriangle,
  FileText,
  Clock,
  Cpu
} from "lucide-react";
import { uploadLogs, analyzeLogs, getLatestUpload } from "../services/api";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/**
 * UploadLogsPage — Upload + Analyze CICIDS2017 CSV files.
 *
 * Sprint 2: File upload, preview.
 * Sprint 3: ML analysis with Recharts visualizations.
 */

const CHART_COLORS = [
  "#06b6d4", "#8b5cf6", "#f43f5e", "#f59e0b", "#10b981",
  "#3b82f6", "#ec4899", "#14b8a6", "#f97316", "#6366f1",
];

const SEVERITY_COLORS = {
  Critical: "text-red-400 bg-red-500/10 border-red-500/30",
  High: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  Medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  Low: "text-green-400 bg-green-500/10 border-green-500/30",
};

const THREAT_EMOJIS = {
  Critical: "🔴 CRITICAL",
  High: "🔴 HIGH",
  Medium: "🟡 MEDIUM",
  Low: "🟢 LOW",
};

// Attack type badge mapping
const ATTACK_BADGES = {
  "BENIGN": "🟢 BENIGN",
  "DDOS": "🚨 DDoS",
  "PORTSCAN": "🟠 PORTSCAN",
  "BOT": "🟣 BOT",
  "BRUTE FORCE": "🔴 BRUTE FORCE",
};

// Specific colors for attacks
const ATTACK_COLORS = {
  "BENIGN": "#22c55e",
  "DDOS": "#ef4444",
  "PORTSCAN": "#f97316",
  "BOT": "#a855f7",
  "BRUTE FORCE": "#e11d48",
};

const getAttackBadge = (name) => {
  const upper = name?.toUpperCase() || "";
  // Return matched badge, or default with red dot for unknown threats
  return ATTACK_BADGES[upper] || `🔴 ${name}`;
};

const getAttackColor = (name, index) => {
  const upper = name?.toUpperCase() || "";
  return ATTACK_COLORS[upper] || CHART_COLORS[index % CHART_COLORS.length];
};

export default function UploadLogsPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadResult, setUploadResult] = useState(null);
  const [analysisStatus, setAnalysisStatus] = useState("idle");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoadingLatest, setIsLoadingLatest] = useState(true);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const data = await getLatestUpload();
        if (data && data.uploadResult) {
          setUploadResult(data.uploadResult);
          setSelectedFile({ name: data.uploadResult.filename.split("_").slice(1).join("_"), size: 0 }); // Mock file object for UI display
          setStatus("done");
          
          if (data.analysisResult) {
            setAnalysisResult(data.analysisResult);
            setAnalysisStatus("done");
          }
        }
      } catch (err) {
        console.error("Failed to fetch latest upload", err);
      } finally {
        setIsLoadingLatest(false);
      }
    };
    fetchLatest();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".csv")) {
        setErrorMessage("Only CSV files are allowed.");
        setStatus("error");
        return;
      }
      setSelectedFile(file);
      setStatus("selected");
      setErrorMessage("");
      setUploadResult(null);
      setAnalysisStatus("idle");
      setAnalysisResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setStatus("uploading");
    setErrorMessage("");

    try {
      const data = await uploadLogs(selectedFile);
      setUploadResult(data);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err.response?.data?.detail || "An unexpected error occurred during upload."
      );
    }
  };

  const handleAnalyze = async () => {
    if (!uploadResult?.filename) return;
    setAnalysisStatus("analyzing");
    setErrorMessage("");

    try {
      const data = await analyzeLogs(uploadResult.filename);
      setAnalysisResult(data);
      setAnalysisStatus("done");
    } catch (error) {
      setAnalysisStatus("error");
      setErrorMessage(
        error.response?.data?.detail || "Analysis failed. Ensure the ML model is trained."
      );
    }
  };

  // ── Build chart data ──
  const pieData = analysisResult?.attack_distribution
    ? Object.entries(analysisResult.attack_distribution).map(([name, value]) => ({
      name,
      value,
    }))
    : [];

  const barData = analysisResult?.attack_distribution
    ? Object.entries(analysisResult.attack_distribution)
      .filter(([name]) => name.toUpperCase() !== "BENIGN")
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, count: value }))
    : [];

  return (
    <div className="space-y-8 pb-10 w-full min-w-0">
      {/* ── Page Header ── */}
      <div>
        <h2 className="text-2xl font-bold">Upload Network Logs</h2>
        <p className="text-sm text-slate-400 mt-1">
          Upload a CICIDS2017 CSV file for analysis.
        </p>
      </div>

      {isLoadingLatest ? (
        <div className="flex justify-center items-center h-40">
          <svg className="animate-spin h-8 w-8 text-soc-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        <>
          {/* ── Upload Zone ── */}
          <div className="bg-soc-surface border border-soc-border rounded-xl p-8">
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center border border-dashed border-slate-600/50 bg-slate-800/10 rounded-xl p-12 cursor-pointer hover:border-soc-accent hover:bg-soc-accent/5 transition-all duration-200"
        >
          <UploadCloud size={40} className="text-slate-500 mb-4" />
          <p className="text-sm font-medium text-slate-300">
            Click to select a CSV file
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Supports CICIDS2017 format (.csv)
          </p>
          <input
            id="file-upload"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>

        {/* ── Error Message ── */}
        {(status === "error" || analysisStatus === "error") && errorMessage && (
          <div className="mt-6 flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
            <AlertCircle size={18} />
            <p className="text-sm font-medium">{errorMessage}</p>
          </div>
        )}

        {/* ── Selected File Info & Action ── */}
        {(status === "selected" || status === "uploading" || status === "done") &&
          selectedFile && (
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between bg-slate-800 rounded-lg px-5 py-4 gap-4">
              <div className="flex items-center gap-3">
                <FileUp size={18} className="text-soc-accent" />
                <div>
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-slate-400">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleUpload}
                  disabled={status === "uploading" || status === "done"}
                  className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-soc-primary hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-soc-primary focus:ring-offset-2 focus:ring-offset-slate-900 shadow-md hover:shadow-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all min-w-[140px] flex justify-center items-center gap-2"
                >
                  {status === "uploading" ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Uploading...
                    </>
                  ) : status === "done" ? (
                    <>
                      <CheckCircle size={16} />
                      Uploaded
                    </>
                  ) : (
                    "Upload & Parse"
                  )}
                </button>

                {/* ── Analyze Button ── */}
                {status === "done" && (
                  <button
                    onClick={handleAnalyze}
                    disabled={analysisStatus === "analyzing" || analysisStatus === "done"}
                    className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-soc-accent hover:bg-cyan-600 text-white disabled:opacity-50 transition-colors min-w-[160px] flex justify-center items-center gap-2"
                  >
                    {analysisStatus === "analyzing" ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Analyzing...
                      </>
                    ) : analysisStatus === "done" ? (
                      <>
                        <Shield size={16} />
                        Complete
                      </>
                    ) : (
                      <>
                        <Zap size={16} />
                        Analyze Dataset
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
      </div>

      {/* ── Dataset Preview Table ── */}
      {status === "done" && uploadResult && analysisStatus === "idle" && (
        <div className="bg-soc-surface border border-soc-border rounded-xl overflow-hidden flex flex-col shadow-lg">
          <div className="p-5 border-b border-soc-border flex items-center justify-between bg-slate-800/50">
            <div className="flex items-center gap-2">
              <Database size={18} className="text-soc-accent" />
              <h3 className="text-lg font-semibold">Dataset Preview</h3>
            </div>
            <div className="flex gap-4 text-xs font-medium text-slate-400">
              <span className="bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
                {uploadResult.total_records.toLocaleString()} Rows
              </span>
              <span className="bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
                {uploadResult.num_columns} Columns
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-soc-surface sticky top-0 text-xs text-slate-400 uppercase font-medium border-b border-soc-border">
                <tr>
                  {uploadResult.columns.slice(0, 15).map((col) => (
                    <th key={col} className="px-4 py-3 border-b border-slate-700">
                      {col}
                    </th>
                  ))}
                  {uploadResult.columns.length > 15 && (
                    <th className="px-4 py-3 border-b border-slate-700 text-slate-500 italic">
                      + {uploadResult.columns.length - 15} more
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {uploadResult.preview.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    {uploadResult.columns.slice(0, 15).map((col) => (
                      <td key={col} className="px-4 py-2.5 max-w-[200px] truncate">
                        {row[col] !== null ? String(row[col]) : <span className="text-slate-500">null</span>}
                      </td>
                    ))}
                    {uploadResult.columns.length > 15 && (
                      <td className="px-4 py-2.5 text-slate-500">...</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-slate-800/50 text-xs text-slate-400 text-center border-t border-soc-border font-medium">
            Showing first 10 rows. Click "Analyze Dataset" to run ML predictions on the entire file.
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          SPRINT 3 — Analysis Results
          ══════════════════════════════════════════════════════════════════ */}
      {analysisStatus === "done" && analysisResult && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* ── Professional Info Mini-Cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <InfoCard icon={<FileText size={14} />} label="Dataset File" value={analysisResult.filename.split('_').slice(1).join('_') || analysisResult.filename} />
            <InfoCard icon={<Database size={14} />} label="Dataset" value="CICIDS2017" />
            <InfoCard icon={<Clock size={14} />} label="Analysis Time" value={`${analysisResult.analysis_duration} sec`} />
            <InfoCard icon={<Cpu size={14} />} label="ML Model" value="XGBoost Classifier" />
          </div>

          {/* ── Summary & SOC Assessment ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Assessment Card */}
            <div className={`col-span-1 lg:col-span-2 rounded-2xl border p-6 flex flex-col justify-center bg-slate-800/40 shadow-sm relative overflow-hidden ${SEVERITY_COLORS[analysisResult.threat_level] || SEVERITY_COLORS.Low}`}>
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="bg-slate-900/50 p-2.5 rounded-xl border border-white/10">
                  <Shield size={24} className="text-current" />
                </div>
                <h3 className="text-xl font-bold tracking-tight">🛡 SOC Assessment</h3>
              </div>
              
              <div className="space-y-3 relative z-10">
                <p className="font-medium text-slate-300 flex items-center gap-2">
                  <span className="text-slate-100 font-bold text-lg">{analysisResult.total_records?.toLocaleString()}</span> flows analyzed
                </p>
                <p className="font-medium text-slate-300 flex items-center gap-2">
                  <span className="text-slate-100 font-bold text-lg">{analysisResult.threats_detected?.toLocaleString()}</span> malicious flows detected
                </p>
                
                <div className="h-px w-full bg-white/10 my-4"></div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-400 block text-xs uppercase font-bold tracking-wider mb-1.5">Threat Level</span>
                    <span className="font-bold text-lg">{THREAT_EMOJIS[analysisResult.threat_level] || analysisResult.threat_level}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs uppercase font-bold tracking-wider mb-1.5">Recommendation</span>
                    <span className="text-slate-200 font-medium">
                      {analysisResult.threat_level === "Low" ? "Continue monitoring." : 
                       analysisResult.threat_level === "Medium" ? "Investigate flagged endpoints." : 
                       "Immediate incident response required."}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Threat Card */}
            <div className="col-span-1 rounded-2xl border border-soc-border bg-soc-surface p-6 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs text-slate-400 uppercase font-bold tracking-wider">Top Threat</h3>
                <AlertTriangle size={16} className="text-slate-500" />
              </div>
              
              <div className="flex-1 flex flex-col justify-center">
                {analysisResult.most_common_attack && analysisResult.most_common_attack !== "None" ? (
                  <>
                    <p className="text-2xl font-bold text-slate-100 mb-2 truncate">
                      {getAttackBadge(analysisResult.most_common_attack)}
                    </p>
                    <p className="text-sm font-medium text-slate-400">
                      <span className="text-fuchsia-400 font-bold">
                        {analysisResult.attack_distribution?.[analysisResult.most_common_attack]?.toLocaleString()}
                      </span> detections
                    </p>
                  </>
                ) : (
                  <p className="text-2xl font-bold text-slate-400">
                    🟢 None
                  </p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-soc-border">
                 <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Model Confidence</p>
                 <p className="text-lg font-bold text-violet-400">
                   {analysisResult.average_confidence
                      ? `${(analysisResult.average_confidence * 100).toFixed(2)}%`
                      : "N/A"}
                 </p>
              </div>
            </div>
          </div>

          {/* ── Charts ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart — Attack Distribution */}
            {pieData.length > 0 && (
              <div className="bg-soc-surface border border-soc-border rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">
                  Threat Distribution
                </h3>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={115}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => {
                        const p = percent * 100;
                        const formatted = p > 0 && p < 0.1 ? p.toFixed(3) : p > 99.9 && p < 100 ? p.toFixed(3) : p.toFixed(1);
                        return `${getAttackBadge(name)} ${formatted}%`;
                      }}
                      labelLine={true}
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={getAttackColor(entry.name, index)}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [value.toLocaleString(), getAttackBadge(name)]}
                      contentStyle={{
                        backgroundColor: "#172033",
                        border: "1px solid rgba(255,255,255,0.05)",
                        borderRadius: "8px",
                        color: "#F8FAFC",
                        fontWeight: "500"
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Bar Chart — Top Threats */}
            {barData.length > 0 && (
              <div className="bg-soc-surface border border-soc-border rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">
                  Top Detected Threats
                </h3>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={barData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
                    <XAxis type="number" stroke="#94a3b8" fontSize={12} tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(0)}k` : val} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="#94a3b8"
                      fontSize={11}
                      width={120}
                      tickFormatter={(name) => getAttackBadge(name)}
                      tick={{ fill: "#e2e8f0", fontWeight: 500 }}
                    />
                    <Tooltip
                      formatter={(value, name) => [value.toLocaleString(), getAttackBadge(name)]}
                      contentStyle={{
                        backgroundColor: "#172033",
                        border: "1px solid rgba(255,255,255,0.05)",
                        borderRadius: "8px",
                        color: "#F8FAFC",
                        fontWeight: "500"
                      }}
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                      {barData.map((entry, index) => (
                        <Cell
                          key={`bar-${index}`}
                          fill={getAttackColor(entry.name, index)}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
}

/* ── Reusable Info Card Component (Small) ── */
function InfoCard({ icon, label, value }) {
  return (
    <div className="bg-soc-surface border border-soc-border rounded-xl p-4 flex items-center gap-3 hover:bg-slate-800/60 transition-colors shadow-sm">
      <div className="text-slate-400 bg-slate-900/50 p-2.5 rounded-lg border border-white/5">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider truncate">{label}</p>
        <p className="text-sm font-semibold text-slate-100 truncate" title={value}>{value}</p>
      </div>
    </div>
  );
}
