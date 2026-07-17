import { useLocation } from "react-router-dom";
import { Bell } from "lucide-react";

/**
 * Map route paths to human-readable page titles shown in the navbar.
 */
const pageTitles = {
  "/":         "Dashboard",
  "/upload":   "Upload Logs",
  "/reports":  "Reports",
  "/history":  "History",
  "/settings": "Settings",
};

export default function Navbar() {
  const { pathname } = useLocation();
  const title = pageTitles[pathname] || "SOC Analyst";

  return (
    <header className="h-16 bg-soc-surface border-b border-soc-border flex items-center justify-between px-8">
      {/* ── Page Title ── */}
      <h1 className="text-lg font-semibold text-slate-100">{title}</h1>

      {/* ── Right Section ── */}
      <div className="flex items-center gap-5">
        {/* Status indicator */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="h-2 w-2 rounded-full bg-soc-success animate-pulse" />
          <span>System Online</span>
        </div>

        {/* Notification bell (placeholder) */}
        <button className="relative text-slate-400 hover:text-slate-200 transition-colors">
          <Bell size={20} />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-soc-critical" />
        </button>
      </div>
    </header>
  );
}
