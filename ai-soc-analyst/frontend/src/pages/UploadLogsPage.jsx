import { useState } from "react";
import { UploadCloud, FileUp } from "lucide-react";

/**
 * UploadLogsPage — Allows the analyst to upload a CICIDS2017 CSV file.
 *
 * Sprint 1: UI only. File is selected but not sent to the backend.
 * Sprint 2: Will POST the file to /api/upload for ML inference.
 */
export default function UploadLogsPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | selected | uploading | done

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setStatus("selected");
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    // Sprint 2: Replace with actual API call to POST /api/upload
    setStatus("uploading");
    setTimeout(() => {
      setStatus("done");
    }, 1500);
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

        {/* ── Selected File Info ── */}
        {selectedFile && (
          <div className="mt-6 flex items-center justify-between bg-slate-800 rounded-lg px-5 py-3">
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
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white disabled:opacity-50 transition-opacity"
            >
              {status === "uploading"
                ? "Processing..."
                : status === "done"
                ? "Complete ✓"
                : "Upload & Analyze"}
            </button>
          </div>
        )}

        {/* ── Result Placeholder ── */}
        {status === "done" && (
          <div className="mt-6 bg-soc-success/10 border border-soc-success/30 rounded-lg p-4">
            <p className="text-sm text-soc-success font-medium">
              File uploaded successfully. Analysis results will appear here in
              Sprint 2.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
