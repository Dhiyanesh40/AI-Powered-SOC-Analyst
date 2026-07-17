import React from 'react';
import { Bell, Search, ShieldCheck, User } from 'lucide-react';

export const TopBar = () => {
  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8 text-slate-300">
      {/* Search Bar */}
      <div className="flex items-center bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-1.5 w-80">
        <Search size={16} className="text-slate-400 mr-2" />
        <input 
          type="text" 
          placeholder="Search IPs, CVEs, Alerts..." 
          className="bg-transparent border-none text-xs text-slate-100 placeholder-slate-400 focus:outline-none w-full"
        />
      </div>

      {/* System Status Indicators */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <ShieldCheck size={16} className="text-emerald-500" />
          <span>IDS Engine: Online</span>
        </div>
        
        {/* Notifications */}
        <button className="relative p-1 hover:text-slate-100">
          <Bell size={20} />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500"></span>
        </button>
        
        {/* User Info */}
        <div className="flex items-center space-x-3 pl-4 border-l border-slate-800">
          <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
            <User size={16} />
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold text-slate-200">bhaskar_analyst</p>
            <p className="text-[10px] text-slate-500">Tier 1 SOC Analyst</p>
          </div>
        </div>
      </div>
    </header>
  );
};
