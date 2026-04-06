/**
 * NotificationToast Component
 * Displays real-time notifications for employee logs
 */

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { 
  CheckCircle2, 
  Trash2, 
  X, 
  AlertCircle, 
  Bell, 
  User, 
  CheckSquare, 
  Inbox 
} from "lucide-react";

export const NotificationToast = ({
  notification,
  onClose,
  duration = 5000,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Fade in
    const timer = setTimeout(() => setIsVisible(true), 10);

    // Auto dismiss
    const dismissTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(timer);
      clearTimeout(dismissTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300); // Matches the transition duration
  };

  if (!notification) return null;

  const { log, critical } = notification;

  return createPortal(
    <div
      className={`fixed top-4 right-4 sm:top-6 sm:right-6 z-[10001] w-full max-w-sm px-4 sm:px-0 transform transition-all duration-300 ease-out ${
        isVisible && !isExiting
          ? "translate-x-0 opacity-100 scale-100"
          : "translate-x-8 opacity-0 scale-95"
      }`}
    >
      <div
        className={`relative bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border overflow-hidden ${
          critical
            ? "border-red-200 dark:border-red-800/50"
            : "border-zinc-200/60 dark:border-zinc-800/60"
        }`}
      >
        <div className="p-4">
          <div className="flex items-start gap-3.5">
            
            {/* Icon Container */}
            <div className={`shrink-0 flex items-center justify-center w-10 h-10 rounded-xl shadow-sm ${
              critical 
                ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400" 
                : "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
            }`}>
              {critical ? <AlertCircle className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h4 className="text-sm font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
                  {critical ? "Critical Alert" : "New Activity"}
                </h4>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider shrink-0">
                  {new Date(log.log_date + " " + log.log_time).toLocaleTimeString(
                    "en-US",
                    { hour: "2-digit", minute: "2-digit" }
                  )}
                </span>
              </div>
              
              <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-0.5 truncate">
                {log.username || "System User"}
              </p>
              
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 line-clamp-2">
                {log.details || log.purpose || "New activity logged in the system."}
              </p>

              {log.item_no && (
                <div className="mt-2">
                  <span className="inline-flex px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded text-[10px] font-bold uppercase tracking-wider border border-zinc-200 dark:border-zinc-700">
                    Item #{log.item_no}
                  </span>
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="shrink-0 p-1.5 -mr-2 -mt-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:text-zinc-300 dark:hover:bg-zinc-800 rounded-lg transition-colors focus:outline-none"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="absolute bottom-0 left-0 h-1 bg-zinc-100 dark:bg-zinc-800 w-full overflow-hidden">
          <div
            className={`h-full ${critical ? "bg-red-500" : "bg-blue-500"}`}
            style={{
              animation: `toast-progress ${duration}ms linear forwards`,
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>,
    document.body
  );
};

/**
 * NotificationBadge Component
 * Displays unread notification count
 */
export const NotificationBadge = ({ count, onClick }) => {
  if (count === 0) return null;

  return (
    <button
      onClick={onClick}
      className="relative flex items-center justify-center p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 transition-all"
      aria-label={`${count} unread notifications`}
    >
      <Bell className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] rounded-full bg-red-500 border-2 border-white dark:border-zinc-950 text-white text-[10px] font-bold flex items-center justify-center px-1 animate-in zoom-in">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
};

/**
 * NotificationPanel Component
 * Shows list of all notifications in a slide-out drawer
 */
export const NotificationPanel = ({
  notifications,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
}) => {
  return createPortal(
    <div 
      className="fixed inset-0 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm flex justify-end z-[10000] animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md h-full bg-white dark:bg-zinc-950 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 ease-out border-l border-zinc-200 dark:border-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Header ─────────────────────────────────────────────────────── */}
        <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Activity Feed
            </h3>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mt-0.5">
              {notifications.filter((n) => !n.read).length} Unread Alerts
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ─── Bulk Actions ───────────────────────────────────────────────── */}
        {notifications.length > 0 && (
          <div className="px-4 py-3 bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800/80 flex gap-2 shrink-0">
            <button
              onClick={onMarkAllAsRead}
              disabled={notifications.every(n => n.read)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckSquare className="w-3.5 h-3.5" /> Read All
            </button>
            <button
              onClick={onClearAll}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear Feed
            </button>
          </div>
        )}

        {/* ─── Notifications List ─────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-zinc-50/30 dark:bg-zinc-900/10">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center text-zinc-400">
              <Inbox className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm font-bold uppercase tracking-wider text-zinc-500">Inbox Zero</p>
              <p className="text-xs font-medium mt-1">You are all caught up.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => onMarkAsRead(notification.id)}
                  className={`p-5 transition-all cursor-pointer group ${
                    !notification.read
                      ? "bg-blue-50/30 dark:bg-blue-500/5 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                      : "bg-white dark:bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    
                    {/* Read Status Indicator */}
                    <div className="shrink-0 mt-1">
                       <div className={`w-2.5 h-2.5 rounded-full transition-colors ${
                          notification.read 
                            ? "bg-zinc-200 dark:bg-zinc-700" 
                            : "bg-blue-500 ring-4 ring-blue-500/20"
                       }`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        {notification.critical && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 text-[9px] font-black uppercase tracking-wider rounded">
                            Critical
                          </span>
                        )}
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 shrink-0">
                          {new Date(notification.timestamp).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <div className={`font-bold text-sm mb-1 ${notification.read ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-900 dark:text-white"}`}>
                        {notification.log.username || "System Alert"}
                      </div>
                      
                      <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                        {notification.log.details || notification.log.purpose || "Activity recorded."}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};