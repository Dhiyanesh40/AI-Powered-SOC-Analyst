import { useState } from "react";
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
} from "lucide-react";
import { uploadLogs, analyzeLogs } from "../services/api";
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
  Legend,
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
  "#84cc16", "#e11d48", "#0ea5e9", "#a855f7", "#22c55e",
];

const SEVERITY_COLORS = {
  Critical: "text-red-400 bg-red-500/10 border-red-500/30",
  High: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  Medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  Low: "text-green-400 bg-green-500/10 border-green-500/30",
};

export default function UploadLogsPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadResult, setUploadResult] = useState(null);
  const [analysisStatus, setAnalysisStatus] = useState("idle");
  const [analysisResult, setAnalysisResult] = useState(null);

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

      console.log("UPLOAD RESPONSE:");
      console.log(data);

      setUploadResult(data);

      setStatus("done");
    } catch (err) {
      console.error(err);
      setStatus("error");
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
    <div className="space-y-8">
      {/* ── Page Header ── */}
      <div>
        <h2 className="text-2xl font-bold">Upload Network Logs</h2>
        <p className="text-sm text-slate-400 mt-1">
          Upload a CICIDS2017 CSV file for analysis.
        </p>
      </div>

      {/* ── Upload Zone ── */}
      <div className="bg-soc-surface border border-soc-border rounded-xl p-8">
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center border-2 border-dashed border-slate-600 rounded-xl p-12 cursor-pointer hover:border-soc-accent transition-colors"
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
                  className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white disabled:opacity-50 transition-opacity min-w-[140px] flex justify-center items-center gap-2"
                >
                  {status === "uploading" ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
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
                    className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white disabled:opacity-50 transition-opacity min-w-[160px] flex justify-center items-center gap-2"
                  >
                    {analysisStatus === "analyzing" ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
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
      {status === "done" && uploadResult && (
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
              <thead className="bg-slate-800/80 text-xs text-slate-300 uppercase font-semibold">
                <tr>
                  {uploadResult.columns.slice(0, 15).map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 border-b border-slate-700"
                    >
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
                  <tr
                    key={idx}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    {uploadResult.columns.slice(0, 15).map((col) => (
                      <td
                        key={col}
                        className="px-4 py-2.5 max-w-[200px] truncate"
                      >
                        {row[col] !== null ? (
                          String(row[col])
                        ) : (
                          <span className="text-slate-500">null</span>
                        )}
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
        <div className="space-y-6">
          {/* ── Summary Cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              icon={<Database size={20} />}
              label="Total Records"
              value={analysisResult.total_records?.toLocaleString()}
              accent="text-cyan-400"
            />
            <SummaryCard
              icon={<AlertTriangle size={20} />}
              label="Threats Detected"
              value={analysisResult.threats_detected?.toLocaleString()}
              accent="text-red-400"
            />
            <SummaryCard
              icon={<Activity size={20} />}
              label="Avg. Confidence"
              value={
                analysisResult.average_confidence
                  ? `${(analysisResult.average_confidence * 100).toFixed(1)}%`
                  : "N/A"
              }
              accent="text-violet-400"
            />
            <SummaryCard
              icon={<Shield size={20} />}
              label="Threat Level"
              value={analysisResult.threat_level}
              accent={
                analysisResult.threat_level === "Critical"
                  ? "text-red-400"
                  : analysisResult.threat_level === "High"
                    ? "text-orange-400"
                    : analysisResult.threat_level === "Medium"
                      ? "text-yellow-400"
                      : "text-green-400"
              }
            />
          </div>

          {/* ── Most Common Attack + Duration ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-soc-surface border border-soc-border rounded-xl p-5">
              <p className="text-xs text-slate-400 uppercase font-semibold mb-1">
                Most Common Attack
              </p>
              <p className="text-lg font-bold text-fuchsia-400">
                {analysisResult.most_common_attack || "None"}
              </p>
            </div>
            <div className="bg-soc-surface border border-soc-border rounded-xl p-5">
              <p className="text-xs text-slate-400 uppercase font-semibold mb-1">
                Analysis Duration
              </p>
              <p className="text-lg font-bold text-cyan-400">
                {analysisResult.analysis_duration}s
              </p>
            </div>
          </div>

          {/* ── Threat Level Badge ── */}
          {analysisResult.threat_level && (
            <div
              className={`flex items-center gap-3 rounded-xl border p-4 ${SEVERITY_COLORS[analysisResult.threat_level] || SEVERITY_COLORS.Low
                }`}
            >
              <Shield size={22} />
              <div>
                <p className="text-sm font-bold">
                  Overall Threat Level: {analysisResult.threat_level}
                </p>
                <p className="text-xs opacity-80 mt-0.5">
                  {analysisResult.summary}
                </p>
              </div>
            </div>
          )}

          {/* ── Charts ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart — Attack Distribution */}
            {pieData.length > 0 && (
              <div className="bg-soc-surface border border-soc-border rounded-xl p-6">
                <h3 className="text-sm font-semibold text-slate-300 uppercase mb-4">
                  Attack Distribution
                </h3>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={110}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} (${(percent * 100).toFixed(1)}%)`
                      }
                      labelLine={true}
                    >
                      {pieData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                        color: "#e2e8f0",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Bar Chart — Top Threats */}
            {barData.length > 0 && (
              <div className="bg-soc-surface border border-soc-border rounded-xl p-6">
                <h3 className="text-sm font-semibold text-slate-300 uppercase mb-4">
                  Top Detected Threats
                </h3>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={barData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="#94a3b8"
                      fontSize={11}
                      width={140}
                      tick={{ fill: "#cbd5e1" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                        color: "#e2e8f0",
                      }}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {barData.map((_, index) => (
                        <Cell
                          key={`bar-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
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
    </div>
  );
}

/* ── Reusable Summary Card Component ── */
function SummaryCard({ icon, label, value, accent }) {
  return (
    <div className="bg-soc-surface border border-soc-border rounded-xl p-5 flex items-center gap-4">
      <div className={`${accent} p-2.5 bg-slate-800 rounded-lg`}>{icon}</div>
      <div>
        <p className="text-xs text-slate-400 uppercase font-semibold">{label}</p>
        <p className={`text-xl font-bold ${accent}`}>{value}</p>
      </div>
    </div>
  );
}
