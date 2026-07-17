import { useState } from "react";
import { UploadCloud, FileUp, AlertCircle, CheckCircle, Database } from "lucide-react";
import axios from "axios";

/**
 * UploadLogsPage — Allows the analyst to upload a CICIDS2017 CSV file.
 *
 * Sprint 2: 
 * - POSTs the file to /api/upload.
 * - Handles loading, success, and error states.
 * - Displays a preview table of the parsed dataset.
 */
export default function UploadLogsPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | selected | uploading | done | error
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadResult, setUploadResult] = useState(null);

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
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setStatus("uploading");
    setErrorMessage("");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      setUploadResult(response.data);
      setStatus("done");
    } catch (error) {
      console.error("Upload failed:", error);
      setStatus("error");
      setErrorMessage(
        error.response?.data?.detail || "An unexpected error occurred during upload."
      );
    }
  };

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
        {status === "error" && errorMessage && (
          <div className="mt-6 flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
            <AlertCircle size={18} />
            <p className="text-sm font-medium">{errorMessage}</p>
          </div>
        )}

        {/* ── Selected File Info & Action ── */}
        {(status === "selected" || status === "uploading" || status === "done") && selectedFile && (
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

            <button
              onClick={handleUpload}
              disabled={status === "uploading" || status === "done"}
              className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white disabled:opacity-50 transition-opacity min-w-[140px] flex justify-center items-center gap-2"
            >
              {status === "uploading" ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : status === "done" ? (
                <>
                  <CheckCircle size={16} />
                  Complete
                </>
              ) : (
                "Upload & Parse"
              )}
            </button>
          </div>
        )}
      </div>

      {/* ── Dataset Preview Table ── */}
      {status === "done" && uploadResult && (
        <div className="bg-soc-surface border border-soc-border rounded-xl overflow-hidden flex flex-col shadow-lg mt-8">
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
            Showing first 10 rows. Model analysis will process the entire dataset.
          </div>
        </div>
      )}
    </div>
  );
}
