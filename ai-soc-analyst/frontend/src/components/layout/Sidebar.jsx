import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  UploadCloud,
  FileText,
  Clock,
  Settings,
  ShieldCheck,
} from "lucide-react";

/**
 * Navigation items rendered in the sidebar.
 * Each entry maps a route path to a label and icon.
 */
const navItems = [
  { to: "/",         label: "Dashboard",   icon: LayoutDashboard },
  { to: "/upload",   label: "Upload Logs", icon: UploadCloud },
  { to: "/reports",  label: "Reports",     icon: FileText },
  { to: "/history",  label: "History",     icon: Clock },
  { to: "/settings", label: "Settings",    icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 h-screen w-60 bg-soc-surface border-r border-soc-border flex flex-col">
      {/* ── Brand ── */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-soc-border">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
          <ShieldCheck size={18} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-100 leading-tight">
            SOC Analyst
          </p>
          <p className="text-[10px] font-semibold text-soc-accent tracking-widest">
            AI-POWERED
          </p>
        </div>
      </div>

      {/* ── Navigation Links ── */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? "bg-soc-accent/10 text-soc-accent"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ── Footer ── */}
      <div className="px-5 py-4 border-t border-soc-border">
        <p className="text-[10px] text-slate-500">Sprint 1 · v0.1.0</p>
      </div>
    </aside>
  );
}
