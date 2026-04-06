import React, { useState, useEffect } from "react";
import { pollingManager } from "../../utils/api/websocket/polling-manager.jsx";
import { SOCKET_EVENTS } from "../../utils/api/websocket/constants/events.js";
import apiService from "../../utils/api/api-service";
import { getStoredToken } from "../../utils/auth";
import { ModalPortal } from "./shared";
import { EmployeeLogsSkeleton } from "../skeletons/ProcurementSkeletons";
import { useAuth } from "../../contexts/AuthContext";
import { ReportBuilder } from "./shared/ReportBuilder";
import {
  RefreshCw,
  Download,
  BarChart2,
  Search,
  SlidersHorizontal,
  X,
  FileText,
  PackageOpen,
  LogIn,
  LogOut,
  Archive,
  Pencil,
  PlusCircle,
  Trash2,
  ClipboardList,
  AlertTriangle,
  CheckSquare,
  User,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  History,
  FileEdit,
  ScrollText,
  Clock,
  Calendar,
  Hash,
  Layers,
  ArrowRight,
  Boxes,
  RotateCcw,
  Save,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";

// ─── helpers ────────────────────────────────────────────────────────────────

function ActivityIcon({ details, className = "w-3.5 h-3.5" }) {
  if (!details) return <ClipboardList className={className} />;
  const d = details.toLowerCase();
  if (d.includes("checkout")) return <LogOut className={className} />;
  if (d.includes("checkin")) return <LogIn className={className} />;
  if (d.includes("stock")) return <Boxes className={className} />;
  if (d.includes("update")) return <Pencil className={className} />;
  if (d.includes("create")) return <PlusCircle className={className} />;
  if (d.includes("delete")) return <Trash2 className={className} />;
  return <FileText className={className} />;
}

// ─── main component ──────────────────────────────────────────────────────────

function EmployeeLogs() {
  const [state, setState] = useState({
    logs: [],
    loading: true,
    initialLoading: true,
    error: null,
    searchTerm: "",
    dateFilter: { dateFrom: "", dateTo: "" },
    currentPage: 1,
    totalLogs: 0,
    filters: { hasDetails: false },
    visibleCount: 50,
    selectedLogs: [],
    showFilters: false,
    showDetailedView: false,
    selectedLog: null,
    employeeDetails: null,
    associatedItems: [],
    profileMap: {},
    logProfileMap: {},
    detailsLoading: false,
    showReportBuilder: false,
  });

  const logsPerPage = 10;
  const {
    logs,
    loading,
    initialLoading,
    error,
    searchTerm,
    dateFilter,
    currentPage,
    totalLogs,
    filters,
    visibleCount,
    selectedLogs,
    showFilters,
    showDetailedView,
    selectedLog,
    employeeDetails,
    associatedItems,
    detailsLoading,
    showReportBuilder,
  } = state;
  const [isEditWizardOpen, setIsEditWizardOpen] = useState(false);
  const [editTargetLog, setEditTargetLog] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 4000);
  };

  // ── profile preload ────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const preload = async () => {
      if (!logs || logs.length === 0) return;
      const visible = logs.slice(0, visibleCount);
      const profileMap = { ...(state.profileMap || {}) };
      const logProfileMap = { ...(state.logProfileMap || {}) };
      for (const log of visible) {
        if (cancelled) return;
        if (logProfileMap[log.id] !== undefined) continue;
        try {
          const employee = await fetchEmployeeDetails(log);
          if (employee && employee.id) {
            const uid = employee.id;
            if (profileMap[uid] !== undefined) {
              logProfileMap[log.id] = profileMap[uid];
              continue;
            }
            try {
              const profileUrl = apiService.profiles.getProfileUrlByUid(uid);
              const response = await fetch(profileUrl, {
                method: "GET",
                headers: { Authorization: `Bearer ${getStoredToken()}` },
              });
              if (response.ok) {
                profileMap[uid] = profileUrl;
                logProfileMap[log.id] = profileUrl;
              } else {
                profileMap[uid] = null;
                logProfileMap[log.id] = null;
              }
            } catch (err) {
              profileMap[uid] = null;
              logProfileMap[log.id] = null;
            }
          } else {
            logProfileMap[log.id] = null;
          }
        } catch (err) {
          logProfileMap[log.id] = null;
        }
      }
      if (!cancelled) setState((prev) => ({ ...prev, profileMap, logProfileMap }));
    };
    preload();
    return () => { cancelled = true; };
  }, [logs, visibleCount]);

  useEffect(() => { fetchEmployeeLogs(); }, [currentPage, searchTerm, dateFilter, filters]);

  useEffect(() => {
    const handler = (e) => {
      fetchEmployeeLogs();
      if (e && e.detail && e.detail.originalId) console.log("Log edited", e.detail);
    };
    window.addEventListener("employeeLogEdited", handler);
    return () => window.removeEventListener("employeeLogEdited", handler);
  }, []);

  useEffect(() => {
    const unsubCreated = pollingManager.subscribeToUpdates(
      SOCKET_EVENTS.INVENTORY.LOG_CREATED,
      (data) => {
        if (state.currentPage === 1) {
          fetchEmployeeLogs();
        } else {
          setState((prev) => {
            if (prev.logs.some((l) => String(l.id) === String(data.id))) return prev;
            const newEntry = {
              id: data.id,
              username: data.username || "N/A",
              details: data.details || data.purpose || "New activity",
              log_date: data.log_date,
              log_time: data.log_time,
              purpose: data.purpose || "",
              created_at: new Date().toISOString(),
            };
            return { ...prev, logs: [newEntry, ...prev.logs] };
          });
        }
      },
    );
    const unsubRefresh = pollingManager.subscribeToUpdates(
      "inventory:logs:refresh",
      () => { if (state.currentPage === 1) fetchEmployeeLogs(); },
    );
    return () => {
      if (typeof unsubCreated === "function") unsubCreated();
      if (typeof unsubRefresh === "function") unsubRefresh();
    };
  }, [state.currentPage]);

  // ── data fetching ──────────────────────────────────────────────────────────
  const fetchEmployeeLogs = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const params = {
        offset: (currentPage - 1) * logsPerPage,
        limit: logsPerPage,
        sort_by: "created_at",
        sort_order: "DESC",
        ...(searchTerm.trim() && { search: searchTerm.trim() }),
        ...(dateFilter.dateFrom && { date_from: dateFilter.dateFrom }),
        ...(dateFilter.dateTo && { date_to: dateFilter.dateTo }),
        ...(filters.hasDetails && { has_details: true }),
      };
      const result = await apiService.employeeLogs.getEmployeeLogs(params);
      if (result.success) {
        setState((prev) => ({
          ...prev,
          logs: result.data || [],
          totalLogs: result.total || 0,
          loading: false,
          initialLoading: false,
        }));
      } else {
        throw new Error(result.message || "Failed to fetch employee logs");
      }
    } catch (err) {
      setState((prev) => ({ ...prev, error: err.message, loading: false, initialLoading: false }));
    }
  };

  const handleSearch = (e) =>
    setState((prev) => ({ ...prev, searchTerm: e.target.value, currentPage: 1 }));

  const handleDateFilterChange = (field, value) =>
    setState((prev) => ({ ...prev, dateFilter: { ...prev.dateFilter, [field]: value }, currentPage: 1 }));

  const handleFilterChange = (field, value) =>
    setState((prev) => ({ ...prev, filters: { ...prev.filters, [field]: value }, currentPage: 1 }));

  const clearFilters = () =>
    setState((prev) => ({
      ...prev,
      searchTerm: "",
      dateFilter: { dateFrom: "", dateTo: "" },
      filters: { hasDetails: false },
      currentPage: 1,
    }));

  const toggleFilters = () =>
    setState((prev) => ({ ...prev, showFilters: !prev.showFilters }));

  const handleSelectAll = (checked) =>
    setState((prev) => ({
      ...prev,
      selectedLogs: checked ? logs.slice(0, visibleCount).map((log) => log.id) : [],
    }));

  const handleLogSelect = (logId, checked) =>
    setState((prev) => ({
      ...prev,
      selectedLogs: checked
        ? [...prev.selectedLogs, logId]
        : prev.selectedLogs.filter((id) => id !== logId),
    }));

  const handleBulkAction = async (action) => {
    if (selectedLogs.length === 0) return;
    try {
      setState((prev) => ({ ...prev, loading: true }));
      switch (action) {
        case "markReviewed":
          for (const logId of selectedLogs) {
            await apiService.employeeLogs.updateEmployeeLog(logId, {
              details: `${logs.find((log) => log.id === logId)?.details || ""} [REVIEWED]`.trim(),
            });
          }
          break;
        case "archive":
          for (const logId of selectedLogs) {
            await apiService.employeeLogs.updateEmployeeLog(logId, {
              details: `${logs.find((log) => log.id === logId)?.details || ""} [ARCHIVED]`.trim(),
            });
          }
          break;
        case "delete":
          if (window.confirm(`Are you sure you want to delete ${selectedLogs.length} log(s)? This action cannot be undone.`)) {
            for (const logId of selectedLogs) {
              await apiService.employeeLogs.deleteEmployeeLog(logId);
            }
          } else {
            setState((prev) => ({ ...prev, loading: false }));
            return;
          }
          break;
        case "export":
          exportLogs("csv");
          setState((prev) => ({ ...prev, loading: false }));
          return;
      }
      await fetchEmployeeLogs();
      setState((prev) => ({ ...prev, selectedLogs: [], loading: false }));
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false }));
      alert(`Failed to ${action} logs: ${error.message}`);
    }
  };

  const exportLogs = async (format) => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      let logsToExport = [];
      if (selectedLogs.length > 0) {
        logsToExport = logs.filter((log) => selectedLogs.includes(log.id));
      } else {
        const params = {
          limit: 10000,
          sort_by: "created_at",
          sort_order: "DESC",
          ...(searchTerm.trim() && { search: searchTerm.trim() }),
          ...(dateFilter.dateFrom && { date_from: dateFilter.dateFrom }),
          ...(dateFilter.dateTo && { date_to: dateFilter.dateTo }),
          ...(filters.hasDetails && { has_details: true }),
        };
        const result = await apiService.employeeLogs.getEmployeeLogs(params);
        if (result.success) logsToExport = result.data || [];
        else throw new Error(result.message || "Failed to fetch logs for export");
      }
      exportData(logsToExport, format);
      setState((prev) => ({ ...prev, loading: false }));
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false }));
      alert(`Export failed: ${error.message}`);
    }
  };

  const exportData = (data, format) => {
    const filename = `employee_logs_${new Date().toISOString().split("T")[0]}`;
    if (format === "csv") {
      const headers = ["ID", "Username", "ID Number", "ID Barcode", "Activity", "Date", "Time", "Details", "Item Numbers", "Created At"];
      const csvContent = [
        headers.join(","),
        ...data.map((log) =>
          [
            log.id,
            `"${log.username || "N/A"}"`,
            `"${log.id_number || "N/A"}"`,
            `"${log.id_barcode || "N/A"}"`,
            `"${getActivityLabel(log.details)}"`,
            log.log_date || "",
            log.log_time || "",
            `"${log.details || ""}"`,
            `"${log.item_no || ""}"`,
            log.created_at,
          ].join(","),
        ),
      ].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.csv`;
      link.click();
    }
  };

  const setTimeRange = (range) => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const ranges = {
      today: { dateFrom: today, dateTo: today },
      week: {
        dateFrom: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        dateTo: today,
      },
      month: {
        dateFrom: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        dateTo: today,
      },
      clear: { dateFrom: "", dateTo: "" },
    };
    setState((prev) => ({ ...prev, dateFilter: ranges[range], currentPage: 1 }));
  };

  const formatDateTime = (dateString, timeString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    if (!timeString) return formattedDate;
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${formattedDate} ${hour12}:${minutes} ${ampm}`;
  };

  // kept for export CSV compatibility
  const getActivityIcon = (details) => {
    if (!details) return "📝";
    const d = details.toLowerCase();
    if (d.includes("checkout")) return "📤";
    if (d.includes("checkin")) return "📥";
    if (d.includes("stock")) return "📦";
    if (d.includes("update")) return "✏️";
    if (d.includes("create")) return "➕";
    if (d.includes("delete")) return "🗑️";
    return "📋";
  };

  const getActivityLabel = (details) => {
    if (!details) return "Note";
    const d = details.toLowerCase();
    if (d.includes("checkout")) return "Check-out";
    if (d.includes("checkin")) return "Check-in";
    if (d.includes("stock")) return "Stock";
    if (d.includes("update")) return "Update";
    if (d.includes("create")) return "Create";
    if (d.includes("delete")) return "Delete";
    return "Log";
  };

  const getActivityBadgeClass = (details) => {
    if (!details) return "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
    const d = details.toLowerCase();
    if (d.includes("checkout")) return "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400";
    if (d.includes("checkin")) return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400";
    if (d.includes("stock")) return "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400";
    if (d.includes("update")) return "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400";
    if (d.includes("create")) return "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400";
    if (d.includes("delete")) return "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400";
    return "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
  };

  const renderDetailsContent = (log, items) => {
    const detailsText = log?.details ? log.details.trim() : "";
    const lowerDetails = detailsText.toLowerCase();
    const hasCheckoutText = lowerDetails.includes("checkout");

    if (items && items.length > 0) {
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                <Boxes className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="font-semibold text-sm text-zinc-900 dark:text-white">
                  {items.length} Item{items.length > 1 ? "s" : ""} Referenced
                </div>
                <div className="text-[11px] text-zinc-500">Quantities and details below</div>
              </div>
            </div>
            {hasCheckoutText && (
              <button
                onClick={() => handleEditCheckoutItems(log, items)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit Quantities
              </button>
            )}
          </div>

          <div className="space-y-2">
            {items.map((it) => (
              <div
                key={it.item_no || Math.random()}
                className="rounded-xl p-3.5 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                        #{it.item_no}
                      </span>
                      <span className="font-semibold text-sm text-zinc-900 dark:text-white truncate">
                        {it.item_name || "Unknown item"}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-500 flex flex-wrap gap-x-1.5">
                      {it.brand && <span>{it.brand}</span>}
                      {it.location && <span>· {it.location}</span>}
                      {it.category && <span>· {it.category}</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                      ₱{it.price_per_unit ? Number(it.price_per_unit).toFixed(2) : "0.00"}
                    </div>
                    <div className="text-[10px] text-zinc-500">per unit</div>
                    <div className="text-xs font-bold text-blue-700 dark:text-blue-400 mt-0.5">
                      Qty: {it.quantity || 1}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {detailsText !== "" && !hasCheckoutText && (
            <div className="rounded-lg p-3 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{detailsText}</p>
            </div>
          )}
        </div>
      );
    }

    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {log.details || "No details available"}
      </p>
    );
  };

  // ── employee / item helpers (LOGIC UNCHANGED) ─────────────────────────────
  const fetchEmployeeDetails = async (log) => {
    try {
      let employeeResult = null;
      const username = log.username && log.username !== "N/A" && log.username.trim() !== "" ? log.username.trim() : null;
      const idNumber = log.id_number && log.id_number.trim() !== "" ? log.id_number.trim() : null;
      const idBarcode = log.id_barcode && log.id_barcode.trim() !== "" ? log.id_barcode.trim() : null;

      if (username) {
        try {
          const searchResult = await apiService.employees.getEmployees({ search: username, limit: 1 });
          if (searchResult.success && searchResult.employees && searchResult.employees.length > 0)
            employeeResult = searchResult.employees[0];
        } catch (error) {}
      }
      if (!employeeResult && idNumber) {
        try {
          const searchResult = await apiService.employees.getEmployees({ search: idNumber, limit: 1 });
          if (searchResult.success && searchResult.employees && searchResult.employees.length > 0)
            employeeResult = searchResult.employees[0];
        } catch (error) {}
      }
      if (!employeeResult && idBarcode) {
        try {
          const searchResult = await apiService.employees.getEmployees({ search: idBarcode, limit: 1 });
          if (searchResult.success && searchResult.employees && searchResult.employees.length > 0)
            employeeResult = searchResult.employees[0];
        } catch (error) {}
      }
      return employeeResult;
    } catch (error) {
      return null;
    }
  };

  const fetchAssociatedItems = async (itemNos, detailsText = "", itemsJson = null) => {
    if (itemsJson) {
      try {
        const parsedItems = typeof itemsJson === "string" ? JSON.parse(itemsJson) : itemsJson;
        if (Array.isArray(parsedItems) && parsedItems.length > 0) {
          const promises = parsedItems.map(async (jsonItem) => {
            try {
              const res = await apiService.items.getItem(jsonItem.item_no);
              if (res.success && res.data) {
                return { ...res.data, quantity: jsonItem.quantity, unit_of_measure: jsonItem.unit_of_measure || "pcs", balance_before: jsonItem.balance_before, balance_after: jsonItem.balance_after, _fromJson: true };
              }
              return { item_no: jsonItem.item_no, item_name: jsonItem.item_name, brand: jsonItem.brand, location: jsonItem.location, quantity: jsonItem.quantity, unit_of_measure: jsonItem.unit_of_measure || "pcs", balance_before: jsonItem.balance_before, balance_after: jsonItem.balance_after, _fromJson: true };
            } catch (err) {
              return { item_no: jsonItem.item_no, item_name: jsonItem.item_name, brand: jsonItem.brand, location: jsonItem.location, quantity: jsonItem.quantity, unit_of_measure: jsonItem.unit_of_measure || "pcs", balance_before: jsonItem.balance_before, balance_after: jsonItem.balance_after, _fromJson: true };
            }
          });
          return await Promise.all(promises);
        }
      } catch (err) {}
    }

    if (!itemNos || itemNos.trim() === "") return [];
    const sanitizeNumber = (value) => { const parsed = parseInt(value, 10); return Number.isNaN(parsed) ? null : parsed; };
    const parseToken = (token) => {
      let raw = token.trim();
      const colonMatch = raw.match(/^(.*?)\s*[:=]\s*(\d+)$/);
      if (colonMatch) return { itemNo: colonMatch[1].trim(), qty: sanitizeNumber(colonMatch[2]) };
      const parenMatch = raw.match(/^(.*?)\(\s*(\d+)\s*\)$/);
      if (parenMatch) return { itemNo: parenMatch[1].trim(), qty: sanitizeNumber(parenMatch[2]) };
      const xMatch = raw.match(/^(.*?)\b[x×]\s*(\d+)(?=\s*(?:pcs?|units?|unit|ea|pc|piece|pieces|\(|,|$))/i);
      if (xMatch) return { itemNo: xMatch[1].trim(), qty: sanitizeNumber(xMatch[2]) };
      return { itemNo: raw, qty: null };
    };
    const extractQuantitiesFromDetails = (details) => {
      if (!details) return [];
      const normalized = details.replace(/\s+/g, " ").trim();
      const withoutPrefix = normalized.replace(/^checkout:\s*\d+\s*items?\s*-\s*/i, "");
      const segments = withoutPrefix.split(/[;,•]\s*/).map((seg) => seg.trim()).filter(Boolean);
      return segments.map((seg) => {
        const qtyLabel = seg.match(/qty\s*[:\-]?\s*(\d+)/i);
        if (qtyLabel) return sanitizeNumber(qtyLabel[1]);
        const qtyX = seg.match(/\b[x×]\s*(\d+)(?=\s*(?:pcs?|units?|unit|ea|pc|piece|pieces|\(|,|$))/i);
        if (qtyX) return sanitizeNumber(qtyX[1]);
        const qtyParen = seg.match(/\((\d+)\s*(?:pcs?|units?|unit|ea|pc|piece|pieces)?\)/i);
        if (qtyParen) return sanitizeNumber(qtyParen[1]);
        return null;
      });
    };
    try {
      const tokens = itemNos.split(/[;|]/).map((t) => t.trim()).filter((t) => t !== "");
      if (tokens.length === 0) return [];
      const detailQuantities = extractQuantitiesFromDetails(detailsText);
      const parsed = tokens.map((tok, index) => {
        const { itemNo, qty } = parseToken(tok);
        const normalizedItemNo = itemNo.replace(/^#/, "").trim();
        const fallbackQty = detailQuantities[index] ?? null;
        const finalQty = qty ?? fallbackQty ?? 1;
        return { itemNo: normalizedItemNo, qty: finalQty };
      });
      const promises = parsed.map((p) =>
        apiService.items.getItem(p.itemNo)
          .then((res) => ({ res, qty: p.qty, itemNo: p.itemNo }))
          .catch((err) => ({ res: { success: false, error: err }, qty: p.qty, itemNo: p.itemNo })),
      );
      const results = await Promise.all(promises);
      return results.filter((r) => r && r.res && r.res.success).map((r) => ({ ...(r.res.data || {}), quantity: r.qty }));
    } catch (error) {
      return [];
    }
  };

  const openDetailedView = async (log) => {
    setState((prev) => ({ ...prev, showDetailedView: true, selectedLog: log, detailsLoading: true, employeeDetails: null, associatedItems: [] }));
    try {
      const [employeeResult, assocItems] = await Promise.all([
        fetchEmployeeDetails(log),
        fetchAssociatedItems(log.item_no, log.details, log.items_json),
      ]);
      let finalEmployee = employeeResult;
      try {
        if (finalEmployee && !finalEmployee.profilePicture && finalEmployee.id) {
          try {
            const profileUrl = apiService.profiles.getProfileUrlByUid(finalEmployee.id);
            const response = await fetch(profileUrl, { method: "GET", headers: { Authorization: `Bearer ${getStoredToken()}` } });
            if (response.ok) finalEmployee = { ...finalEmployee, profilePicture: profileUrl };
          } catch (e) {}
        }
      } catch (err) {}
      setState((prev) => ({ ...prev, employeeDetails: finalEmployee, associatedItems: assocItems, detailsLoading: false }));
    } catch (error) {
      setState((prev) => ({ ...prev, detailsLoading: false }));
    }
  };

  const closeDetailedView = () =>
    setState((prev) => ({ ...prev, showDetailedView: false, selectedLog: null, employeeDetails: null, associatedItems: [] }));

  const handleEditCheckoutItems = (log, items) => {
    setEditTargetLog({ ...log, items });
    setIsEditWizardOpen(true);
  };

  const totalPages = Math.ceil(totalLogs / logsPerPage);
  const hasActiveFilters = searchTerm || dateFilter.dateFrom || dateFilter.dateTo || filters.hasDetails;

  if (initialLoading) return <EmployeeLogsSkeleton />;

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="max-w-7xl mx-auto space-y-3">

        {/* ── Header ── */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-4 md:p-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
                <ScrollText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-zinc-900 dark:text-white leading-tight">Activity Logs</h1>
                <p className="text-[11px] text-zinc-500 font-medium">Track and manage employee activity</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={fetchEmployeeLogs}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-semibold border border-zinc-200 dark:border-zinc-700 shadow-sm active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={() => exportLogs("csv")}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm active:scale-95 transition-all"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">CSV</span>
              </button>
              <button
                onClick={() => setState((prev) => ({ ...prev, showReportBuilder: true }))}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm active:scale-95 transition-all"
              >
                <BarChart2 className="w-4 h-4" />
                <span className="hidden sm:inline">Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Search & Filters ── */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-3 md:p-4">
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search by name, ID…"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={toggleFilters}
                className={`inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold border shadow-sm active:scale-95 transition-all ${
                  showFilters
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {hasActiveFilters && (
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-white/20 text-[10px] font-black">
                    {[searchTerm, dateFilter.dateFrom, dateFilter.dateTo, filters.hasDetails].filter(Boolean).length}
                  </span>
                )}
              </button>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 shadow-sm active:scale-95 transition-all"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {showFilters && (
            <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">From</label>
                  <input
                    type="date"
                    value={dateFilter.dateFrom}
                    onChange={(e) => handleDateFilterChange("dateFrom", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">To</label>
                  <input
                    type="date"
                    value={dateFilter.dateTo}
                    onChange={(e) => handleDateFilterChange("dateTo", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Quick:</span>
                {["today", "week", "month"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setTimeRange(r)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 active:scale-95 transition-all capitalize"
                  >
                    {r === "week" ? "7 Days" : r === "month" ? "30 Days" : "Today"}
                  </button>
                ))}
                <label className="ml-auto flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.hasDetails}
                    onChange={(e) => handleFilterChange("hasDetails", e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Only with details</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* ── Meta row ── */}
        <div className="flex items-center justify-between px-1">
          <p className="text-[11px] font-semibold text-zinc-500">
            Showing <span className="text-zinc-900 dark:text-white font-black">{logs.length}</span> of {totalLogs}
            {totalPages > 1 && <span className="text-zinc-400"> · Page {currentPage}/{totalPages}</span>}
          </p>
          {loading && (
            <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span className="text-[11px] font-semibold">Loading…</span>
            </div>
          )}
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-red-700 dark:text-red-400">Error Loading Logs</p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* ── Bulk Actions ── */}
        {selectedLogs.length > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
                <span className="text-white font-black text-sm">{selectedLogs.length}</span>
              </div>
              <div>
                <p className="font-bold text-sm text-blue-700 dark:text-blue-400">{selectedLogs.length} log{selectedLogs.length > 1 ? "s" : ""} selected</p>
                <p className="text-[11px] text-blue-600 dark:text-blue-500">Choose an action below</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => handleBulkAction("markReviewed")} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm active:scale-95 transition-all">
                <CheckSquare className="w-3.5 h-3.5" /> Mark Reviewed
              </button>
              <button onClick={() => handleBulkAction("archive")} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm active:scale-95 transition-all">
                <Archive className="w-3.5 h-3.5" /> Archive
              </button>
              <button onClick={() => handleBulkAction("export")} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-sm active:scale-95 transition-all">
                <Download className="w-3.5 h-3.5" /> Export
              </button>
              <button onClick={() => handleBulkAction("delete")} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm active:scale-95 transition-all">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>
        )}

        {/* ── Table ── */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max md:min-w-full">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={selectedLogs.length === logs.slice(0, visibleCount).length && logs.slice(0, visibleCount).length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  {["Activity", "Employee", "Date & Time", "Details"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {!loading && logs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                          <ClipboardList className="w-7 h-7 text-zinc-400" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-zinc-700 dark:text-zinc-300">No logs found</p>
                          <p className="text-xs text-zinc-500 mt-0.5">Try adjusting your search or filters</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  logs.slice(0, visibleCount).map((log) => (
                    <tr
                      key={log.id}
                      tabIndex={0}
                      onClick={() => openDetailedView(log)}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 cursor-pointer transition-colors group"
                    >
                      <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedLogs.includes(log.id)}
                          onChange={(e) => handleLogSelect(log.id, e.target.checked)}
                          className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 text-blue-600 focus:ring-blue-500"
                        />
                      </td>

                      {/* Activity badge */}
                      <td className="px-4 py-3.5">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getActivityBadgeClass(log.details)}`}>
                          <ActivityIcon details={log.details} />
                          {getActivityLabel(log.details)}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono mt-0.5">#{log.id}</div>
                      </td>

                      {/* Employee */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                            {state.logProfileMap && state.logProfileMap[log.id] ? (
                              <img src={state.logProfileMap[log.id]} alt={log.username || "profile"} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                                {(log.username || "N")[0].toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-zinc-900 dark:text-white truncate leading-tight">
                              {log.username || "N/A"}
                            </p>
                            {log.id_number && (
                              <span className="text-[10px] font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                                {log.id_number}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-white whitespace-nowrap">
                          {formatDateTime(log.log_date, log.log_time)}
                        </p>
                        <p className="text-[10px] text-zinc-400 mt-0.5 hidden md:block">
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                      </td>

                      {/* Details */}
                      <td className="px-4 py-3.5 max-w-xs">
                        <p className="text-xs text-zinc-500 truncate">
                          {log.details || <span className="italic text-zinc-300">—</span>}
                        </p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Load more */}
          {logs.length > visibleCount && (
            <div className="p-4 text-center border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/30">
              <button
                onClick={() => setState((prev) => ({ ...prev, visibleCount: Math.min(prev.visibleCount + 20, logs.length) }))}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm active:scale-95 transition-all"
              >
                Load {Math.min(20, logs.length - visibleCount)} more
              </button>
            </div>
          )}
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 flex-wrap">
            <button
              onClick={() => setState((prev) => ({ ...prev, currentPage: Math.max(prev.currentPage - 1, 1) }))}
              disabled={currentPage === 1 || loading}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Prev</span>
            </button>

            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = totalPages <= 5 ? i + 1 : currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setState((prev) => ({ ...prev, currentPage: pageNum }))}
                    disabled={loading}
                    className={`w-9 h-9 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                      currentPage === pageNum
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setState((prev) => ({ ...prev, currentPage: Math.min(prev.currentPage + 1, totalPages) }))}
              disabled={currentPage === totalPages || loading}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all shadow-sm"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* ── Detail Modal ── */}
      {showDetailedView && selectedLog && (
        <ModalPortal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-md bg-zinc-900/40 dark:bg-black/60">
            <div className="w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
                    <FileText className="w-4.5 h-4.5 text-white w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base text-zinc-900 dark:text-white leading-tight">Activity Log Details</h2>
                    <p className="text-[11px] text-zinc-500 font-mono">#{selectedLog.id}</p>
                  </div>
                </div>
                <button
                  onClick={closeDetailedView}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 active:scale-95 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal body */}
              <div className="overflow-y-auto flex-1 p-6">
                {detailsLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    <p className="text-sm font-medium text-zinc-500">Loading details…</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    {/* Employee card */}
                    <div className="col-span-1">
                      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 p-5">
                        <div className="flex flex-col items-center text-center">
                          <div className="w-24 h-24 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden ring-4 ring-white dark:ring-zinc-900 shadow-md">
                            {employeeDetails && employeeDetails.profilePicture ? (
                              <img src={employeeDetails.profilePicture} alt={employeeDetails.fullName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-4xl font-black text-zinc-400">
                                  {(selectedLog.username || "N")[0].toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <h3 className="mt-3 font-bold text-base text-zinc-900 dark:text-white">
                            {employeeDetails ? employeeDetails.fullName : selectedLog.username || "N/A"}
                          </h3>
                          {employeeDetails && (
                            <>
                              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">{employeeDetails.position}</p>
                              <p className="text-[11px] text-zinc-500">{employeeDetails.department}</p>
                            </>
                          )}

                          <div className="mt-4 w-full space-y-2">
                            {[
                              { label: "ID Number", value: employeeDetails?.id_number || selectedLog.id_number || "—" },
                              { label: "Barcode", value: employeeDetails?.id_barcode || selectedLog.id_barcode || "—" },
                              ...(employeeDetails ? [
                                { label: "Email", value: employeeDetails.email || "—" },
                                { label: "Contact", value: employeeDetails.contactNumber || "—" },
                              ] : []),
                            ].map(({ label, value }) => (
                              <div key={label} className="rounded-lg p-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-left">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{label}</p>
                                <p className="text-xs font-semibold text-zinc-900 dark:text-white mt-0.5 truncate">{value}</p>
                              </div>
                            ))}
                            {employeeDetails && (
                              <div className="rounded-lg p-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-left">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Status</p>
                                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  employeeDetails.status === "Active"
                                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                                    : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                                }`}>
                                  {employeeDetails.status || "—"}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Log details */}
                    <div className="col-span-2 space-y-4">
                      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 p-5">
                        {/* Activity type badge */}
                        <div className="flex items-center gap-2 mb-4">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getActivityBadgeClass(selectedLog.details)}`}>
                            <ActivityIcon details={selectedLog.details} />
                            {getActivityLabel(selectedLog.details)}
                          </div>
                          <p className="text-[11px] text-zinc-500 font-medium">Log Information</p>
                        </div>

                        {/* Meta grid */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="rounded-xl p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Log ID</p>
                            <p className="text-lg font-black text-zinc-900 dark:text-white mt-0.5 font-mono">#{selectedLog.id}</p>
                          </div>
                          <div className="rounded-xl p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Created</p>
                            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mt-0.5">{new Date(selectedLog.created_at).toLocaleString()}</p>
                          </div>
                          <div className="rounded-xl p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 col-span-2">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Activity Date & Time</p>
                            <p className="text-sm font-bold text-zinc-900 dark:text-white mt-0.5">{formatDateTime(selectedLog.log_date, selectedLog.log_time)}</p>
                          </div>
                        </div>

                        {selectedLog.purpose && (
                          <div className="mb-4">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Purpose</p>
                            <div className="rounded-xl p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                              <p className="text-sm text-blue-800 dark:text-blue-300">{selectedLog.purpose}</p>
                            </div>
                          </div>
                        )}

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Activity Details</p>
                          {renderDetailsContent(selectedLog, associatedItems)}
                        </div>

                        <div className="mt-5">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Edit History</p>
                          <AuditViewer logId={selectedLog?.id} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal footer */}
              <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                <button
                  onClick={closeDetailedView}
                  className="px-5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-95 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* ── Edit Wizard ── */}
      {isEditWizardOpen && (
        <EditLogWizard
          isOpen={isEditWizardOpen}
          onClose={() => { setIsEditWizardOpen(false); setEditTargetLog(null); }}
          log={editTargetLog}
          onSaved={(res) => { fetchEmployeeLogs(); setIsEditWizardOpen(false); setEditTargetLog(null); }}
          showToast={showToast}
        />
      )}

      {/* ── Toast ── */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-[9999] flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-white text-sm font-semibold transition-all ${
          toast.type === "success" ? "bg-emerald-600" : toast.type === "error" ? "bg-red-600" : "bg-amber-600"
        }`}>
          {toast.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : toast.type === "error" ? <X className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
          {toast.message}
        </div>
      )}

      {/* ── Report Builder ── */}
      <ReportBuilder
        isOpen={showReportBuilder}
        onClose={() => setState((prev) => ({ ...prev, showReportBuilder: false }))}
        logs={logs}
      />
    </div>
  );
}

// ─── AuditViewer ─────────────────────────────────────────────────────────────

function AuditViewer({ logId }) {
  const [audits, setAudits] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedAudits, setExpandedAudits] = useState({});

  useEffect(() => {
    if (!logId) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await apiService.employeeLogs.getAuditForLog(logId);
        if (!cancelled) setAudits(res.data || []);
      } catch (err) {
        if (!cancelled) setAudits([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [logId]);

  const toggleAudit = (auditId) =>
    setExpandedAudits((prev) => ({ ...prev, [auditId]: !prev[auditId] }));

  const parseJsonSafely = (jsonStr) => {
    try { return JSON.parse(jsonStr); } catch { return null; }
  };

  const renderChanges = (changesJson, originalJson, newJson) => {
    const changes = parseJsonSafely(changesJson);
    const original = parseJsonSafely(originalJson);
    const newData = parseJsonSafely(newJson);

    if (!changes || Object.keys(changes).length === 0) {
      return <p className="text-xs text-zinc-400 italic">No field changes recorded</p>;
    }

    const fieldMeta = {
      username:   { label: "Username",        Icon: User },
      details:    { label: "Activity Details", Icon: FileEdit },
      item_no:    { label: "Item Numbers",     Icon: Boxes },
      id_number:  { label: "ID Number",        Icon: Hash },
      id_barcode: { label: "ID Barcode",       Icon: Hash },
      purpose:    { label: "Purpose",          Icon: ClipboardList },
      log_date:   { label: "Activity Date",    Icon: Calendar },
      log_time:   { label: "Activity Time",    Icon: Clock },
    };

    return (
      <div className="space-y-2">
        {Object.entries(changes).map(([field, change]) => {
          const meta = fieldMeta[field] || { label: field, Icon: FileText };
          const { Icon } = meta;
          const oldValue = change.old !== undefined ? change.old : original && original[field];
          const newValue = change.new !== undefined ? change.new : newData && newData[field];

          return (
            <div key={field} className="rounded-xl p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center gap-1.5 mb-2">
                <Icon className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{meta.label}</span>
              </div>
              <div className="space-y-1 text-xs ml-5">
                <div className="flex items-start gap-2">
                  <span className="text-red-500 font-black shrink-0 leading-tight">−</span>
                  <span className="text-red-600 dark:text-red-400 break-all">{oldValue || "(empty)"}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500 font-black shrink-0 leading-tight">+</span>
                  <span className="text-emerald-600 dark:text-emerald-400 break-all">{newValue || "(empty)"}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (!logId) return null;

  if (loading) {
    return (
      <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700">
        <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
        <span className="text-xs text-zinc-500 font-medium">Loading edit history…</span>
      </div>
    );
  }

  if (!audits || audits.length === 0) {
    return (
      <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700">
        <ScrollText className="w-4 h-4 text-zinc-400" />
        <div>
          <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">No Edit History</p>
          <p className="text-[11px] text-zinc-400">This log has not been modified</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {audits.map((audit, index) => {
        const isExpanded = expandedAudits[audit.id];
        const editDate = new Date(audit.created_at);
        const formattedDate = editDate.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
        const formattedTime = editDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

        return (
          <div key={audit.id} className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden">

            {/* Audit header */}
            <div className="flex items-start justify-between gap-3 p-4 bg-amber-50/60 dark:bg-amber-500/5 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center shrink-0">
                  <History className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white">Edit #{audits.length - index}</span>
                    <span className="text-[10px] font-mono bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full">ID: {audit.id}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-3 mt-0.5">
                    <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500">
                      <Calendar className="w-3 h-3" /> {formattedDate} at {formattedTime}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500">
                      <User className="w-3 h-3" /> Admin {audit.admin_id}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => toggleAudit(audit.id)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 active:scale-95 transition-all shrink-0"
              >
                {isExpanded ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {isExpanded ? "Hide" : "Show"}
              </button>
            </div>

            {/* Reason */}
            <div className="px-4 py-3 flex items-start gap-2.5 border-b border-zinc-100 dark:border-zinc-800 bg-blue-50/40 dark:bg-blue-500/5">
              <FileEdit className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Reason</p>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-0.5">{audit.reason || "No reason provided"}</p>
              </div>
            </div>

            {/* Changes */}
            {isExpanded && (
              <div className="p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Modified Fields</p>
                {renderChanges(audit.changes_json, audit.original_json, audit.new_json)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── EditLogWizard ────────────────────────────────────────────────────────────

function EditLogWizard({ isOpen, onClose, log, onSaved, showToast }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [itemQuantities, setItemQuantities] = useState({});
  const [itemUnits, setItemUnits] = useState({});

  const isCheckoutEdit = log && log.items && Array.isArray(log.items) && log.items.length > 0;

  useEffect(() => {
    if (log && isCheckoutEdit) {
      setReason("");
      setStep(1);
      const quantities = {};
      const units = {};
      log.items.forEach((item) => {
        quantities[item.item_no] = item.quantity || 1;
        units[item.item_no] = item.unit_of_measure || "pcs";
      });
      setItemQuantities(quantities);
      setItemUnits(units);
    }
  }, [log, isCheckoutEdit]);

  if (!isOpen || !log || !isCheckoutEdit) return null;

  const canProceedStep1 = true;
  const canProceedStep2 = true;
  const canProceedStep3 = reason.trim() !== "";

  const doSave = async () => {
    if (!user) { if (showToast) showToast("Only admins may edit logs", "error"); return; }
    if (!reason || reason.trim() === "") { if (showToast) showToast("Edit reason is required", "error"); return; }

    const payload = { admin_id: user.id, reason };
    const itemCorrections = [];
    let hasChanges = false;

    log.items.forEach((item) => {
      const originalQty = item.quantity || 1;
      const correctedQty = itemQuantities[item.item_no] || 1;
      if (originalQty !== correctedQty) {
        hasChanges = true;
        itemCorrections.push({ item_no: item.item_no, item_name: item.item_name, original_quantity: originalQty, corrected_quantity: correctedQty, stock_to_restore: originalQty - correctedQty });
      }
    });

    if (!hasChanges) { if (showToast) showToast("No quantity changes detected", "error"); return; }
    const invalidItems = itemCorrections.filter((item) => isNaN(item.corrected_quantity) || item.corrected_quantity < 0);
    if (invalidItems.length > 0) { if (showToast) showToast(`Invalid quantities for: ${invalidItems.map((i) => i.item_name).join(", ")}`, "error"); return; }

    payload.item_corrections = itemCorrections;
    setSaving(true);
    try {
      const res = await apiService.employeeLogs.updateEmployeeLog(log.id, payload);
      if (res && res.success) {
        if (showToast) showToast(`Successfully corrected ${itemCorrections.length} item(s)!`, "success");
        if (typeof onSaved === "function") onSaved(res);
        setTimeout(() => onClose(), 1500);
      } else {
        throw new Error(res?.message || "Save failed");
      }
    } catch (err) {
      if (showToast) showToast("Failed to save: " + (err.message || err), "error");
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    { num: 1, label: "Review Items", sub: "Check current quantities" },
    { num: 2, label: "Correct Quantities", sub: "Fix incorrect values" },
    { num: 3, label: "Confirm", sub: "Provide reason" },
  ];

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 backdrop-blur-md bg-zinc-900/40 dark:bg-black/60">
        <div className="w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-600 flex items-center justify-center shadow-sm">
                <Pencil className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-base text-zinc-900 dark:text-white leading-tight">Edit Checkout Quantities</h2>
                <p className="text-[11px] text-zinc-500">{log.items.length} item{log.items.length > 1 ? "s" : ""} · Log #{log.id}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 active:scale-95 transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Step indicator */}
          <div className="px-6 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
            <div className="flex items-center max-w-lg mx-auto">
              {steps.map((s, i) => (
                <React.Fragment key={s.num}>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                      step === s.num ? "bg-amber-600 text-white shadow-sm" : step > s.num ? "bg-emerald-500 text-white" : "bg-zinc-200 dark:bg-zinc-700 text-zinc-500"
                    }`}>
                      {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                    </div>
                    <div className="hidden sm:block">
                      <p className={`text-[11px] font-bold leading-tight ${step === s.num ? "text-zinc-900 dark:text-white" : "text-zinc-400"}`}>{s.label}</p>
                      <p className="text-[10px] text-zinc-400">{s.sub}</p>
                    </div>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-3 rounded-full ${step > s.num ? "bg-emerald-400" : "bg-zinc-200 dark:bg-zinc-700"}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1 p-6">

            {/* Step 1: Review */}
            {step === 1 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                    <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-zinc-900 dark:text-white">Review Checkout Items</p>
                    <p className="text-[11px] text-zinc-500">Items checked out in this transaction</p>
                  </div>
                </div>

                {log.items.map((item) => (
                  <div key={item.item_no} className="rounded-xl p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-mono bg-zinc-200 dark:bg-zinc-700 text-zinc-500 px-1.5 py-0.5 rounded">#{item.item_no}</span>
                          <span className="font-bold text-sm text-zinc-900 dark:text-white">{item.item_name || "Unknown item"}</span>
                        </div>
                        <p className="text-[11px] text-zinc-500">{item.brand && item.brand}{item.location && ` · ${item.location}`}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-base font-black text-emerald-700 dark:text-emerald-400">×{item.quantity || 1}</p>
                        <p className="text-[10px] text-zinc-400">checked out</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Step 2: Correct */}
            {step === 2 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                    <Pencil className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-zinc-900 dark:text-white">Correct Item Quantities</p>
                    <p className="text-[11px] text-zinc-500">{log.items.length} item{log.items.length > 1 ? "s" : ""} total</p>
                  </div>
                </div>

                {/* Changed summary banner */}
                {(() => {
                  const n = log.items.filter((it) => (it.quantity || 1) !== (itemQuantities[it.item_no] || it.quantity || 1)).length;
                  return n > 0 ? (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-xs font-semibold text-amber-700 dark:text-amber-400">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      {n} item{n > 1 ? "s" : ""} modified — review before continuing
                    </div>
                  ) : null;
                })()}

                <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-xs text-blue-700 dark:text-blue-400">
                  <Layers className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span><strong>Formula:</strong> Original − Corrected = Stock to restore</span>
                </div>

                {log.items.map((item) => {
                  const originalQty = item.quantity || 1;
                  const correctedQty = itemQuantities[item.item_no] ?? originalQty;
                  const stockDiff = originalQty - correctedQty;
                  const hasChanged = correctedQty !== originalQty;

                  return (
                    <div key={item.item_no} className="rounded-2xl p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
                      <div className="flex items-center gap-2 mb-3">
                        <Boxes className="w-4 h-4 text-zinc-400" />
                        <span className="font-bold text-sm text-zinc-900 dark:text-white flex-1">{item.item_name || "Unknown item"}</span>
                        <span className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded">#{item.item_no}</span>
                        {hasChanged && (
                          <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Modified
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        {/* Original */}
                        <div className="rounded-xl p-3 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Original</p>
                          <p className="text-lg font-black text-zinc-700 dark:text-zinc-300">{originalQty}</p>
                        </div>

                        {/* Corrected input */}
                        <div className="rounded-xl p-3 bg-amber-50 dark:bg-amber-500/10 border-2 border-amber-300 dark:border-amber-500/40">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">Corrected</p>
                          <input
                            type="number"
                            min="0"
                            value={correctedQty}
                            onChange={(e) => {
                              const newQty = Math.max(0, parseInt(e.target.value) || 0);
                              setItemQuantities((prev) => ({ ...prev, [item.item_no]: newQty }));
                            }}
                            className="w-full text-lg font-black bg-transparent border-none outline-none text-amber-700 dark:text-amber-300"
                          />
                        </div>

                        {/* Diff */}
                        <div className={`rounded-xl p-3 border-2 ${
                          stockDiff > 0 ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/40"
                          : stockDiff < 0 ? "bg-red-50 dark:bg-red-500/10 border-red-300 dark:border-red-500/40"
                          : "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700"
                        }`}>
                          <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
                            stockDiff > 0 ? "text-emerald-600 dark:text-emerald-400"
                            : stockDiff < 0 ? "text-red-600 dark:text-red-400"
                            : "text-zinc-400"
                          }`}>
                            {stockDiff > 0 ? "Restore" : stockDiff < 0 ? "Deduct" : "No change"}
                          </p>
                          <p className={`text-lg font-black ${
                            stockDiff > 0 ? "text-emerald-700 dark:text-emerald-300"
                            : stockDiff < 0 ? "text-red-700 dark:text-red-300"
                            : "text-zinc-500"
                          }`}>{Math.abs(stockDiff)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                    <Save className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-zinc-900 dark:text-white">Confirm & Provide Reason</p>
                    <p className="text-[11px] text-zinc-500">Review your changes, then explain why</p>
                  </div>
                </div>

                {/* Summary */}
                <div className="rounded-2xl p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-3">Summary of Changes</p>
                  <div className="space-y-2">
                    {log.items.map((item) => {
                      const originalQty = item.quantity || 1;
                      const correctedQty = itemQuantities[item.item_no] ?? originalQty;
                      const stockDiff = originalQty - correctedQty;
                      const hasChanged = correctedQty !== originalQty;
                      return (
                        <div key={item.item_no} className={`flex items-center gap-2 text-xs ${hasChanged ? "" : "opacity-40"}`}>
                          <Boxes className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200 flex-1 truncate">{item.item_name}</span>
                          <span className="text-red-500 font-mono">{originalQty}</span>
                          <ArrowRight className="w-3 h-3 text-zinc-400" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-mono font-black">{correctedQty}</span>
                          {hasChanged && (
                            <span className={`font-semibold ${stockDiff > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                              ({stockDiff > 0 ? "+" : ""}{-stockDiff})
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Reason for Edit <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="E.g., Correcting data entry error, updating per employee request…"
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all resize-none"
                  />
                  {reason.trim() === "" && (
                    <p className="flex items-center gap-1 text-[11px] text-red-500 mt-1.5">
                      <AlertTriangle className="w-3 h-3" /> Reason is required to proceed
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3">
            <div className="flex gap-2">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 active:scale-95 transition-all shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 active:scale-95 transition-all shadow-sm"
              >
                Cancel
              </button>
            </div>

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={(step === 1 && !canProceedStep1) || (step === 2 && !canProceedStep2)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold shadow-sm active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={doSave}
                disabled={!canProceedStep3 || saving}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                ) : (
                  <><Save className="w-4 h-4" /> Save Changes</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

export default EmployeeLogs;