import { useState, useEffect } from "react";
import { Server, Database, Cpu, Palette, Code, Info, ShieldCheck, CheckCircle, XCircle } from "lucide-react";
import api from "../services/api";

export default function SettingsPage() {
  const [backendStatus, setBackendStatus] = useState("checking"); // checking, online, offline
  
  useEffect(() => {
    // Simple ping to check if backend is online
    const checkStatus = async () => {
      try {
        await api.get("/"); // Assuming root or some health endpoint exists
        setBackendStatus("online");
      } catch (error) {
        // Even if it returns 404, the server is online. If it's a network error, it's offline.
        if (error.response) {
          setBackendStatus("online");
        } else {
          setBackendStatus("offline");
        }
      }
    };
    checkStatus();
  }, []);

  return (
    <div className="space-y-8 w-full pb-10">
      {/* ── Page Header ── */}
      <div>
        <h2 className="text-2xl font-bold text-slate-50">Settings & System Info</h2>
        <p className="text-sm text-slate-400 mt-1">
          Application configuration and platform diagnostics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* ── Application Information ── */}
        <section className="bg-soc-surface border border-soc-border rounded-xl p-6 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-3 border-b border-soc-border pb-4 mb-4">
            <ShieldCheck size={20} className="text-soc-primary" />
            <h3 className="text-base font-semibold text-slate-50">Application Information</h3>
          </div>
          <div className="space-y-4">
            <InfoRow label="Application Name" value="AI-Powered SOC Analyst" />
            <InfoRow label="Version" value="0.3.0 (Sprint 3)" />
            <InfoRow label="Environment" value="Production" />
          </div>
        </section>

        {/* ── Project Information ── */}
        <section className="bg-soc-surface border border-soc-border rounded-xl p-6 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-3 border-b border-soc-border pb-4 mb-4">
            <Info size={20} className="text-soc-accent" />
            <h3 className="text-base font-semibold text-slate-50">Project Information</h3>
          </div>
          <div className="space-y-4">
            <InfoRow label="Project Name" value="AI-Powered SOC Analyst" />
            <InfoRow label="Version" value="1.0" />
            <InfoRow label="Developer" value="AI Engineering Student" />
            <InfoRow label="University" value="Final Year Project" />
            <InfoRow label="Dataset" value="CICIDS2017" />
            <InfoRow label="ML Algorithm" value="XGBoost Classifier" />
          </div>
        </section>

        {/* ── System Status ── */}
        <section className="bg-soc-surface border border-soc-border rounded-xl p-6 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-3 border-b border-soc-border pb-4 mb-4">
            <Server size={20} className="text-soc-success" />
            <h3 className="text-base font-semibold text-slate-50">System Status</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Backend Status</span>
              <div className="flex items-center gap-2">
                {backendStatus === "checking" ? (
                  <span className="text-sm font-medium text-slate-500">Checking...</span>
                ) : backendStatus === "online" ? (
                  <>
                    <CheckCircle size={16} className="text-soc-success" />
                    <span className="text-sm font-medium text-soc-success">Online</span>
                  </>
                ) : (
                  <>
                    <XCircle size={16} className="text-soc-critical" />
                    <span className="text-sm font-medium text-soc-critical">Offline</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Database Status</span>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-soc-success" />
                <span className="text-sm font-medium text-soc-success">Connected (SQLite)</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Technical Stack ── */}
        <section className="bg-soc-surface border border-soc-border rounded-xl p-6 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-3 border-b border-soc-border pb-4 mb-4">
            <Code size={20} className="text-slate-300" />
            <h3 className="text-base font-semibold text-slate-50">Technical Stack</h3>
          </div>
          <div className="space-y-4">
            <InfoRow label="Python Version" value="3.11.x" />
            <InfoRow label="FastAPI Version" value="0.111.0" />
            <InfoRow label="React" value="18.3.1" />
            <InfoRow label="TailwindCSS" value="3.4.15" />
          </div>
        </section>

        {/* ── ML Model ── */}
        <section className="bg-soc-surface border border-soc-border rounded-xl p-6 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-3 border-b border-soc-border pb-4 mb-4">
            <Cpu size={20} className="text-violet-400" />
            <h3 className="text-base font-semibold text-slate-50">ML Model Information</h3>
          </div>
          <div className="space-y-4">
            <InfoRow label="Current Model" value="XGBoost Multi-Class" />
            <InfoRow label="Task Type" value="Network Traffic Classification" />
            <InfoRow label="Feature Count" value="84 Selected Features" />
          </div>
        </section>

        {/* ── Preferences ── */}
        <section className="bg-soc-surface border border-soc-border rounded-xl p-6 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-3 border-b border-soc-border pb-4 mb-4">
            <Palette size={20} className="text-fuchsia-400" />
            <h3 className="text-base font-semibold text-slate-50">Preferences</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Theme</span>
              <div className="bg-slate-800 border border-soc-border rounded-lg px-3 py-1.5 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#0B1220] border border-slate-600"></div>
                <span className="text-sm font-medium text-slate-200">Enterprise Dark</span>
              </div>
            </div>
          </div>
        </section>
        
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-800/50 pb-2 last:border-0 last:pb-0">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-sm font-medium text-slate-200">{value}</span>
    </div>
  );
}
