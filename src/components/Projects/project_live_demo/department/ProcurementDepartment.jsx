import { useAuth } from "../../contexts/AuthContext";
import { useState, useEffect, lazy, Suspense, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../utils/api/api-service";
import { getStoredToken, verifyToken } from "../../utils/auth";
import { useRealtimeEvents } from "../../hooks/useRealtime";
import { useLogoutSync } from "../../hooks/useLogoutSync";
import {
  playStockAlertSound,
  preloadDefaultSounds,
} from "../../utils/notificationSound";
import ProcurementHeader from "../pd/shared/ProcurementHeader";
import { 
  X, 
  Loader2, 
  AlertCircle, 
  Bell, 
  CheckCircle2, 
  Circle 
} from "lucide-react";

// Lazy-load heavy procurement sub-components directly to avoid importing the whole barrel
const AdminDashboard = lazy(() => import("../pd/AdminDashboard"));
const InventoryManagement = lazy(() => import("../pd/inventory/InventoryManagement"));
const PurchaseOrderTracker = lazy(() => import("../pd/purchase-orders/PurchaseOrderTracker"));
const SupplierManagement = lazy(() => import("../pd/SuppliesManagement"));
const EmployeeLogs = lazy(() => import("../pd/EmployeeLogs"));
const ItemDetailView = lazy(() => import("../pd/inventory/ItemDetailView"));
const ToastProvider = lazy(() => import("../pd/shared/ToastNotification"));
const SettingsModal = lazy(() => import("../pd/shared/SettingsModal"));
const NotificationModal = lazy(() => import("../pd/shared/NotificationModal"));

function ProcurementDepartment() {
  const { user, logout, isDarkMode, toggleDarkMode } = useAuth();
  const navigate = useNavigate();

  // Sync logout across tabs and sessions
  useLogoutSync("/jjcewgsaccess/procurement");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAllNotificationsModal, setShowAllNotificationsModal] = useState(false);

  // Real-time event handler for announcements and stock alerts
  const handleAnnouncementEvent = useCallback(
    (data) => {
      const priority = data?.priority || "medium";
      playStockAlertSound(priority);
      loadNotifications();
    },
    [user]
  );

  // Handler for stock alerts specifically
  const handleStockAlert = useCallback((data) => {
    const priority = data?.priority || "urgent";
    playStockAlertSound(priority);
    loadNotifications();
  }, []);

  // Subscribe to real-time announcement events
  useRealtimeEvents(
    {
      announcement_created: handleAnnouncementEvent,
      announcement_updated: () => loadNotifications(),
      announcement_deleted: () => loadNotifications(),
      stock_alert_created: handleStockAlert,
    },
    [handleAnnouncementEvent, handleStockAlert]
  );

  // Get profile picture URL
  const getProfilePictureUrl = (user) => {
    if (!user || !user.id) return null;
    if (userProfile && userProfile.id === user.id && userProfile.profilePicture) {
      return userProfile.profilePicture;
    }
    return apiService.profiles.getProfileUrlByUid(user.id);
  };

  // Normalize UID extraction from token payloads or auth user
  const resolveUid = (payload, fallbackUser) => {
    if (!payload && !fallbackUser) return null;
    const candidates = [
      payload?.userId,
      payload?.id,
      payload?.employeeId,
      payload?.uid,
    ];
    for (const c of candidates) {
      if (c) return c;
    }
    if (fallbackUser?.id) return fallbackUser.id;
    return null;
  };

  // Load user profile data
  const loadUserProfile = async () => {
    if (!user?.id) return;
    try {
      const response = await apiService.employees.getEmployee(user.id);
      if (response.success && response.employee) {
        setUserProfile(response.employee);
      }
    } catch (error) {
      console.error("Failed to load user profile:", error);
    }
  };

  // Load notifications (announcements)
  const loadNotifications = async () => {
    setNotificationsLoading(true);
    setNotificationsError(null);

    try {
      const token = getStoredToken();
      if (!token) {
        setNotificationsError("Authentication required");
        setNotificationsLoading(false);
        return;
      }

      const payload = verifyToken(token);
      const uid = resolveUid(payload, user);

      if (!uid) {
        setNotificationsError("Invalid session");
        setNotificationsLoading(false);
        return;
      }

      const response = await apiService.announcements.getEmployeeAnnouncements(uid);

      if (response?.data) {
        const formattedAnnouncements = response.data.map((ann) => ({
          id: ann.id,
          title: ann.title || ann.message || "Announcement",
          description: ann.description || ann.content || "",
          time: new Date(ann.created_at || ann.date).toLocaleDateString(),
          read: ann.is_read || ann.read || false,
          priority: ann.priority || "normal",
          fullData: ann,
        }));
        setNotifications(formattedAnnouncements);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
      setNotificationsError("Failed to load announcements");
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Mark announcement as read
  const markAnnouncementAsRead = async (announcementId) => {
    try {
      const token = getStoredToken();
      if (!token) return;

      const payload = verifyToken(token);
      const uid = resolveUid(payload, user);

      if (!uid) return;

      await apiService.announcements.markAnnouncementAsRead(announcementId, uid);

      setNotifications((prev) =>
        prev.map((ann) =>
          ann.id === announcementId ? { ...ann, read: true } : ann
        )
      );
    } catch (error) {
      console.error("Failed to mark announcement as read:", error);
    }
  };

  // Dismiss notification (remove from list)
  const dismissNotification = async (announcementId) => {
    try {
      const token = getStoredToken();
      if (!token) return;

      const payload = verifyToken(token);
      const uid = resolveUid(payload, user);

      if (!uid) return;

      await apiService.announcements.dismissAnnouncement(announcementId, uid);

      setNotifications((prev) =>
        prev.filter((ann) => ann.id !== announcementId)
      );
    } catch (error) {
      console.error("Failed to dismiss announcement:", error);
      setNotifications((prev) =>
        prev.filter((ann) => ann.id !== announcementId)
      );
    }
  };

  // Bulk mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    try {
      const token = getStoredToken();
      if (!token) return;

      const payload = verifyToken(token);
      const uid = resolveUid(payload, user);

      if (!uid) return;

      await apiService.announcements.markAllAnnouncementsAsRead(uid);

      setNotifications((prev) => prev.map((ann) => ({ ...ann, read: true })));
    } catch (error) {
      console.error("Failed to mark all announcements as read:", error);
    }
  };

  // Bulk dismiss all notifications
  const dismissAllNotifications = async () => {
    try {
      const token = getStoredToken();
      if (!token) return;

      const payload = verifyToken(token);
      const uid = resolveUid(payload, user);

      if (!uid) return;

      await apiService.announcements.dismissAllAnnouncements(uid);
      setNotifications([]);
    } catch (error) {
      console.error("Failed to dismiss all announcements:", error);
      setNotifications([]);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
  };

  // Handle employee dashboard navigation with auto-login
  const handleEmployeeDashboard = () => {
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("employeeToken");
      if (token) {
        sessionStorage.setItem(
          "nav_auth_token",
          JSON.stringify({
            token: token,
            username: user?.username,
            timestamp: Date.now(),
          })
        );
        window.location.href = "/employee/dashboard?autoLogin=true&loginType=admin";
      } else {
        navigate("/employee/dashboard");
      }
    } catch (error) {
      console.error("Error navigating to employee dashboard:", error);
      navigate("/employee/dashboard");
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  useEffect(() => {
    loadNotifications();
  }, [user]);

  useEffect(() => {
    preloadDefaultSounds();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMobileMenu && !event.target.closest(".mobile-menu")) {
        setShowMobileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMobileMenu]);

  return (
    <ToastProvider>
      <div className={`min-h-screen transition-colors duration-500 ease-in-out ${isDarkMode ? "bg-zinc-950" : "bg-zinc-50"}`}>
        
        {/* Header & Navigation */}
        <ProcurementHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          notifications={notifications}
          notificationsLoading={notificationsLoading}
          onNotificationsRefresh={() => setShowAllNotificationsModal(true)}
          onNotificationsDismiss={dismissNotification}
          onNotificationsMarkRead={markAnnouncementAsRead}
          onNotificationsMarkAllRead={markAllNotificationsAsRead}
          onNotificationsDismissAll={dismissAllNotifications}
          onNotificationClick={setSelectedNotification}
          onSettingsOpen={() => setShowSettingsModal(true)}
          onLogout={handleLogout}
          onViewProfile={() => navigate("/employee/dashboard?tab=profile")}
          onEmployeeDashboard={handleEmployeeDashboard}
          showMobileMenu={showMobileMenu}
          onMobileMenuToggle={() => setShowMobileMenu(!showMobileMenu)}
        />

        {/* Main Content */}
        <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 pt-24 pb-28 md:pb-12">
          
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
              <p className="text-sm font-bold uppercase tracking-widest text-zinc-400">
                Initializing Workspace
              </p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-5 flex items-start gap-4 shadow-sm animate-in slide-in-from-top-4">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-bold text-red-800 dark:text-red-300">System Notice</h3>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="mt-3 text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 uppercase tracking-wider transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Content Area Wrapper */}
          <div className="bg-white dark:bg-zinc-900/40 rounded-[2rem] border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm overflow-hidden transition-all duration-300">
            <div className="p-5 sm:p-8">
              <Suspense
                fallback={
                  <div className="flex flex-col items-center justify-center py-32 text-zinc-400">
                    <Loader2 className="w-8 h-8 animate-spin mb-4 opacity-50" />
                    <span className="text-xs font-bold uppercase tracking-widest">Loading Module</span>
                  </div>
                }
              >
                {activeTab === "dashboard" && <AdminDashboard onNavigate={setActiveTab} />}
                {activeTab === "inventory" && <InventoryManagement />}
                {activeTab === "orders" && <PurchaseOrderTracker />}
                {activeTab === "suppliers" && <SupplierManagement />}
                {activeTab === "logs" && <EmployeeLogs />}
              </Suspense>
            </div>
          </div>
        </main>

        {/* ─── All Notifications Modal ────────────────────────────────────────── */}
        {showAllNotificationsModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">
              
              {/* Header */}
              <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white leading-tight">
                      Notification Center
                    </h2>
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mt-0.5">
                      {notifications.filter(n => !n.read).length} Unread Updates
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAllNotificationsModal(false)}
                  className="p-2.5 rounded-xl text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-white dark:bg-zinc-900">
                {notificationsLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
                    <Loader2 className="w-8 h-8 animate-spin mb-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Syncing Feed</span>
                  </div>
                ) : notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          setSelectedNotification(notif);
                          setShowAllNotificationsModal(false);
                        }}
                        className={`group relative p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                          notif.read
                            ? "bg-zinc-50 dark:bg-zinc-900/50 border-zinc-100 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm"
                            : "bg-blue-50/50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20 hover:border-blue-300 dark:hover:border-blue-500/40 hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="shrink-0 mt-0.5">
                            {notif.read ? (
                              <Circle className="w-5 h-5 text-zinc-300 dark:text-zinc-700" />
                            ) : (
                              <div className="relative">
                                <CheckCircle2 className="w-5 h-5 text-blue-500" />
                                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-bold text-base truncate pr-8 ${
                              notif.read ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-900 dark:text-white"
                            }`}>
                              {notif.title}
                            </h3>
                            <p className="text-xs font-semibold text-zinc-500 mt-1.5 flex items-center gap-2">
                              {notif.time}
                              {notif.priority === 'urgent' && (
                                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 text-[10px] uppercase tracking-wider">
                                  Urgent
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-8 h-8 text-zinc-400 dark:text-zinc-600" />
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">All Caught Up</h3>
                    <p className="text-sm font-medium text-zinc-500">You have no new notifications.</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 flex justify-end gap-3 shrink-0">
                {notifications.some(n => !n.read) && (
                   <button
                   onClick={markAllNotificationsAsRead}
                   className="px-5 py-2.5 rounded-xl font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors text-sm"
                 >
                   Mark All Read
                 </button>
                )}
                <button
                  onClick={() => setShowAllNotificationsModal(false)}
                  className="px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold transition-all shadow-sm active:scale-95 text-sm"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Global Modals */}
        <Suspense fallback={null}>
          <SettingsModal
            isOpen={showSettingsModal}
            onClose={() => setShowSettingsModal(false)}
            user={user}
          />
        </Suspense>

        <Suspense fallback={null}>
          <NotificationModal
            notification={selectedNotification}
            isOpen={!!selectedNotification}
            onClose={() => setSelectedNotification(null)}
            onMarkAsRead={(id) => {
              markAnnouncementAsRead(id);
              setSelectedNotification(null);
            }}
            onDismiss={(id) => {
              dismissNotification(id);
              setSelectedNotification(null);
            }}
            isDarkMode={isDarkMode}
          />
        </Suspense>
      </div>
    </ToastProvider>
  );
}

export default ProcurementDepartment;