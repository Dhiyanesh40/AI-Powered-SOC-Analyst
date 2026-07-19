import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Bell, Check, Info, ShieldAlert, CheckCircle, Database } from "lucide-react";
import api from "../../services/api";
import { formatDate } from "../../utils/formatters";

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
  
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Load read notification IDs from local storage
    const storedReads = localStorage.getItem("soc_read_notifications");
    if (storedReads) {
      try {
        setReadIds(JSON.parse(storedReads));
      } catch (e) {
        console.error("Failed to parse stored read notifications");
      }
    }

    const fetchNotifications = async () => {
      try {
        const response = await api.get("/api/history/notifications");
        setNotifications(response.data || []);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };
    
    fetchNotifications();
    // Poll every 10 seconds for new notifications
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    const newReads = Array.from(new Set([...readIds, ...allIds]));
    setReadIds(newReads);
    localStorage.setItem("soc_read_notifications", JSON.stringify(newReads));
  };
  
  const markAsRead = (id) => {
    if (!readIds.includes(id)) {
      const newReads = [...readIds, id];
      setReadIds(newReads);
      localStorage.setItem("soc_read_notifications", JSON.stringify(newReads));
    }
  };

  const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;

  const getNotificationIcon = (title) => {
    const t = title.toLowerCase();
    if (t.includes('completed') || t.includes('success')) return <CheckCircle size={16} className="text-soc-success" />;
    if (t.includes('deleted')) return <ShieldAlert size={16} className="text-soc-critical" />;
    if (t.includes('upload') || t.includes('parsed')) return <Database size={16} className="text-soc-primary" />;
    return <Info size={16} className="text-soc-accent" />;
  };

  return (
    <header className="h-16 bg-soc-surface border-b border-soc-border flex items-center justify-between px-8 relative">
      {/* ── Page Title ── */}
      <h1 className="text-lg font-semibold text-slate-100">{title}</h1>

      {/* ── Right Section ── */}
      <div className="flex items-center gap-5">
        {/* Status indicator */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="h-2 w-2 rounded-full bg-soc-success animate-pulse" />
          <span>System Online</span>
        </div>

        {/* Notification bell */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="relative text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-full hover:bg-slate-800 focus:outline-none"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-soc-critical border-2 border-soc-surface" />
            )}
          </button>
          
          {isOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-soc-surface border border-soc-border rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-soc-border bg-[#172033]">
                <h3 className="text-sm font-semibold text-slate-100">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-xs text-soc-primary hover:text-blue-400 transition-colors flex items-center gap-1"
                  >
                    <Check size={14} />
                    Mark all read
                  </button>
                )}
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-slate-500 text-sm">
                    No notifications yet
                  </div>
                ) : (
                  <div className="divide-y divide-soc-border">
                    {notifications.map((notification) => {
                      const isRead = readIds.includes(notification.id);
                      return (
                        <div 
                          key={notification.id} 
                          onClick={() => markAsRead(notification.id)}
                          className={`px-4 py-3 hover:bg-slate-800/50 transition-colors cursor-pointer flex gap-3 ${!isRead ? 'bg-slate-800/20' : ''}`}
                        >
                          <div className="mt-1 flex-shrink-0">
                            {getNotificationIcon(notification.title)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${!isRead ? 'text-slate-200' : 'text-slate-400'}`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                              {notification.message}
                            </p>
                            <p className="text-[10px] text-slate-600 mt-1">
                              {formatDate(notification.timestamp)}
                            </p>
                          </div>
                          {!isRead && (
                            <div className="flex-shrink-0 self-center">
                              <span className="h-2 w-2 rounded-full bg-soc-primary inline-block" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
