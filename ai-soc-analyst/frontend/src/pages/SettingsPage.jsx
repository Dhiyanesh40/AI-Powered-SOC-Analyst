import { Save } from "lucide-react";

/**
 * SettingsPage — Configuration for the SOC Analyst system.
 *
 * Sprint 1: Static form fields. Nothing is persisted.
 * Sprint 2+: API key and model threshold will connect to backend config.
 */
export default function SettingsPage() {
  return (
    <div className="space-y-8 max-w-2xl">
      {/* ── Page Header ── */}
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-sm text-slate-400 mt-1">
          Configure system parameters. Changes will take effect in Sprint 2+.
        </p>
      </div>

      {/* ── API Configuration ── */}
      <section className="bg-soc-surface border border-soc-border rounded-xl p-6 space-y-5">
        <h3 className="text-sm font-semibold text-slate-200 border-b border-soc-border pb-3">
          API Configuration
        </h3>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Gemini API Key
          </label>
          <input
            type="password"
            placeholder="Enter your API key"
            className="w-full bg-slate-800 border border-soc-border rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-soc-accent transition-colors"
          />
          <p className="text-[10px] text-slate-500 mt-1">
            Required for multi-agent investigation in Sprint 3.
          </p>
        </div>
      </section>

      {/* ── ML Model Configuration ── */}
      <section className="bg-soc-surface border border-soc-border rounded-xl p-6 space-y-5">
        <h3 className="text-sm font-semibold text-slate-200 border-b border-soc-border pb-3">
          ML Model
        </h3>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Detection Threshold
          </label>
          <input
            type="range"
            min="0"
            max="100"
            defaultValue="70"
            className="w-full accent-soc-accent"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>Sensitive (0%)</span>
            <span>Strict (100%)</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Model Algorithm
          </label>
          <select className="w-full bg-slate-800 border border-soc-border rounded-lg px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-soc-accent transition-colors">
            <option>XGBoost (default)</option>
            <option>Random Forest</option>
          </select>
        </div>
      </section>

      {/* ── Save Button ── */}
      <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity">
        <Save size={16} />
        <span>Save Settings</span>
      </button>
    </div>
  );
}
