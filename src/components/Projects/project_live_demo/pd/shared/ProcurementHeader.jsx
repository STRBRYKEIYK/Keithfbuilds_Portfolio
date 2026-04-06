import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import apiService from "../../../utils/api/api-service";
import { ProfileMenu } from "../../shared";
import { 
  LayoutDashboard, 
  Package, 
  ClipboardList, 
  Building2, 
  History, 
  Bell, 
  Moon, 
  Sun, 
  X,
  CheckCircle2,
  Trash2
} from "lucide-react";

function ProcurementHeader({
  activeTab,
  onTabChange,
  notifications,
  notificationsLoading,
  onNotificationsRefresh,
  onNotificationsDismiss,
  onNotificationsMarkRead,
  onNotificationsMarkAllRead,
  onNotificationsDismissAll,
  onNotificationClick,
  onSettingsOpen,
  onLogout,
  onViewProfile,
  showMobileMenu,
  onMobileMenuToggle,
}) {
  const { user, isDarkMode, toggleDarkMode } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const tabs = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "inventory", label: "Inventory", icon: Package },
    { key: "orders", label: "Orders", icon: ClipboardList },
    { key: "suppliers", label: "Suppliers", icon: Building2 },
    { key: "logs", label: "Ledger", icon: History }, // Renamed slightly for professional feel
  ];

  return (
    <>
      {/* ─── Desktop Header ─────────────────────────────────────────────────── */}
      <header
        className={`hidden md:block sticky top-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 dark:bg-zinc-950/80 border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-xl shadow-sm"
            : "bg-white dark:bg-zinc-950 border-zinc-100 dark:border-zinc-900 backdrop-blur-none"
        } border-b`}
      >
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-8">
            
            {/* Left: Department Info */}
            <div className="min-w-0 shrink-0 flex-1 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
                  Procurement
                </h1>
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Department Workspace
                </p>
              </div>
            </div>

            {/* Center: Navigation Pill */}
            <nav className="flex items-center justify-center p-1.5 rounded-2xl bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200/50 dark:border-zinc-800/50 shadow-inner">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => onTabChange(tab.key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                      isActive
                        ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-zinc-200/50 dark:ring-zinc-700/50"
                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-blue-500" : "opacity-70"}`} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            {/* Right: Actions */}
            <div className="flex items-center justify-end gap-3 shrink-0 flex-1">
              
              {/* Notifications Dropdown Wrapper */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2.5 rounded-xl transition-colors relative flex items-center justify-center ${
                    showNotifications || unreadCount > 0
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                      : "bg-zinc-100 hover:bg-zinc-200 text-zinc-600 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-400"
                  }`}
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] rounded-full bg-red-500 border-2 border-white dark:border-zinc-950 text-white text-[10px] font-bold flex items-center justify-center px-1">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown Panel */}
                {showNotifications && (
                  <div className="absolute top-full right-0 mt-3 w-80 rounded-2xl shadow-xl border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 overflow-hidden transform origin-top-right transition-all">
                    <div className="flex flex-col max-h-[28rem]">
                      
                      {/* Dropdown Header */}
                      <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-between shrink-0">
                        <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider">
                          Updates
                        </h3>
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Dropdown Content */}
                      <div className="p-3 overflow-y-auto custom-scrollbar flex-1">
                        {notifications.length > 0 && (
                          <div className="flex gap-2 mb-3 px-2">
                            <button
                              onClick={onNotificationsMarkAllRead}
                              disabled={notifications.every((n) => n.read)}
                              className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg transition-colors bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Read All
                            </button>
                            <button
                              onClick={onNotificationsDismissAll}
                              className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg transition-colors bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Clear
                            </button>
                          </div>
                        )}

                        {notificationsLoading ? (
                          <div className="py-8 text-center text-xs font-bold text-zinc-400 uppercase tracking-widest">
                            Syncing...
                          </div>
                        ) : notifications.length > 0 ? (
                          <div className="space-y-1.5">
                            {notifications.slice(0, 5).map((notif) => (
                              <div
                                key={notif.id}
                                onClick={() => {
                                  onNotificationClick?.(notif);
                                  setShowNotifications(false);
                                }}
                                className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                                  notif.read
                                    ? "border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                                    : "bg-blue-50/50 border-blue-100 hover:bg-blue-50 dark:bg-blue-500/5 dark:border-blue-500/20 dark:hover:bg-blue-500/10"
                                }`}
                              >
                                <p className={`font-bold text-sm line-clamp-2 ${notif.read ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-900 dark:text-white"}`}>
                                  {notif.title}
                                </p>
                                <p className="text-xs font-semibold text-zinc-500 mt-1">
                                  {notif.time}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-8 text-center text-sm font-medium text-zinc-500">
                            No recent updates.
                          </div>
                        )}
                      </div>

                      {/* Dropdown Footer */}
                      {notifications.length > 5 && (
                        <div className="p-3 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30">
                          <button
                            onClick={onNotificationsRefresh}
                            className="w-full py-2.5 rounded-xl text-xs font-bold text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors shadow-sm"
                          >
                            View Directory
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-400 transition-colors"
                aria-label="Toggle Theme"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-1" />

              {/* Profile Menu */}
              <ProfileMenu
                onLogout={onLogout}
                onViewProfile={onViewProfile}
                onSettingsOpen={onSettingsOpen}
                showSettings={true}
                showToolbox={true}
                size="md"
              />
            </div>
          </div>
        </div>
      </header>

      {/* ─── Mobile Header ──────────────────────────────────────────────────── */}
      <header
        className={`md:hidden fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/90 dark:bg-zinc-950/90 border-zinc-200 dark:border-zinc-800 shadow-sm"
            : "bg-white dark:bg-zinc-950 border-zinc-100 dark:border-zinc-900"
        } border-b backdrop-blur-lg`}
      >
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0 flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                <Package className="w-4 h-4 text-white" />
              </div>
            <div>
              <h1 className="text-base font-extrabold truncate text-zinc-900 dark:text-white leading-tight">
                Procurement
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-wider truncate text-zinc-500 dark:text-zinc-400">
                Workspace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 relative"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border-2 border-white dark:border-zinc-950" />
              )}
            </button>
            <ProfileMenu
              onLogout={onLogout}
              onViewProfile={onViewProfile}
              onSettingsOpen={onSettingsOpen}
              showSettings={true}
              showToolbox={true}
              size="sm"
            />
          </div>
        </div>
      </header>

      {/* ─── Mobile Navigation (Bottom Bar) ─────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-zinc-950/90 border-t border-zinc-200 dark:border-zinc-800 backdrop-blur-xl pb-safe">
        <div className="flex items-center justify-around px-2 py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className="flex flex-col items-center justify-center w-16 gap-1"
              >
                <div className={`flex items-center justify-center w-10 h-8 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400" 
                    : "text-zinc-500 dark:text-zinc-400"
                }`}>
                  <Icon className={`w-5 h-5 ${isActive ? "fill-blue-600/20" : ""}`} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] font-bold transition-colors ${
                  isActive ? "text-blue-600 dark:text-blue-400" : "text-zinc-500 dark:text-zinc-400"
                }`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}

export default ProcurementHeader;