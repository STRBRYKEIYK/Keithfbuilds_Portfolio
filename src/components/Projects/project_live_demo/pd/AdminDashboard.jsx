import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { themeFor } from "../../utils/theme/themeClasses";
import apiService from "../../utils/api/api-service";
import { AdminDashboardSkeleton } from "../skeletons/ProcurementSkeletons";
import {
  ProcurementSectionCard,
  ProcurementStatCard,
  ProcurementPill,
} from "./shared";
import {
  ArrowRight,
  Receipt,
  Activity,
  CheckCircle2,
  LayoutGrid,
} from "lucide-react";

// ─── Icons (Replacing Emojis) ────────────────────────────────────────────────
const Icons = {
  Refresh: () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  ),
  Alert: () => (
    <svg
      className="w-6 h-6 text-red-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  ),
  CheckCircle: () => (
    <svg
      className="w-8 h-8 text-emerald-500 mb-2"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  Clipboard: () => (
    <svg
      className="w-8 h-8 text-zinc-400 mb-2"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
  ),
};

// ─── Inline design tokens ────────────────────────────────────────────────────
const STATUS_BAR = {
  green: {
    badge:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 ring-1 ring-emerald-500/20",
  },
  amber: {
    badge:
      "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400 ring-1 ring-amber-500/20",
  },
  red: {
    badge:
      "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400 ring-1 ring-red-500/20",
  },
};

// ─── Small shared primitives ──────────────────────────────────────────────────
function MetricTile({
  label,
  value,
  sub,
  accent = "text-zinc-900 dark:text-zinc-100",
}) {
  return (
    <div className="group relative bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/50 rounded-2xl p-5 flex flex-col gap-1.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
      <div
        className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-10 transition-opacity"
        style={{ color: "inherit" }}
      />
      <span className={`text-2xl font-extrabold tracking-tight ${accent}`}>
        {value}
      </span>
      <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
        {label}
      </span>
      {sub && (
        <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
          {sub}
        </span>
      )}
    </div>
  );
}

function ProgressRow({ label, count, total, colorClass }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-4 group">
      <span className="w-24 shrink-0 text-sm font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors">
        {label}
      </span>
      <div className="flex-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-full h-2 overflow-hidden shadow-inner">
        <div
          className={`${colorClass} h-full rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-right text-sm font-bold text-zinc-700 dark:text-zinc-200">
        {count}
      </span>
    </div>
  );
}

function SectionHeader({ step, title, description }) {
  return (
    <div className="flex items-start gap-3.5 mb-5">
      <div className="mt-0.5 flex items-center justify-center w-7 h-7 rounded-full bg-emerald-600 dark:bg-emerald-500 text-white text-xs font-bold shrink-0 shadow-sm shadow-emerald-500/20">
        {step}
      </div>
      <div>
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-white dark:bg-zinc-900/90 backdrop-blur-sm border border-zinc-200/60 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}
    >
      {children}
    </div>
  );
}

// ─── Log icon helper ──────────────────────────────────────────────────────────
function logIcon(details = "") {
  const d = details.toLowerCase();
  if (d.includes("checkout"))
    return {
      icon: <ArrowRight className="w-4 h-4" />,
      bg: "bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400",
    };
  if (d.includes("checkin"))
    return {
      icon: <ArrowRight className="w-4 h-4 rotate-180" />,
      bg: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    };
  if (d.includes("stock"))
    return {
      icon: <Receipt className="w-4 h-4" />,
      bg: "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400",
    };
  if (d.includes("update"))
    return {
      icon: <Activity className="w-4 h-4" />,
      bg: "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400",
    };
  if (d.includes("create"))
    return {
      icon: <CheckCircle2 className="w-4 h-4" />,
      bg: "bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400",
    };
  return {
    icon: <LayoutGrid className="w-4 h-4" />,
    bg: "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400",
  };
}

// ─── Main component ───────────────────────────────────────────────────────────
function AdminDashboard({ onNavigate }) {
  const { isDarkMode } = useAuth();
  const t = themeFor(isDarkMode);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [statistics, setStatistics] = useState({
    total_items: 0,
    total_inventory_value: 0,
    in_stock: 0,
    low_stock: 0,
    out_of_stock: 0,
    active_suppliers: 0,
  });
  const [analytics, setAnalytics] = useState({
    lowStockItems: [],
    recentStockAlerts: [],
    monthlyTrends: [],
  });
  const [purchaseOrderSummary, setPurchaseOrderSummary] = useState({
    total_orders: 0,
    pending_orders: 0,
    completed_orders: 0,
    cancelled_orders: 0,
    total_value: 0,
    pending_value: 0,
    completed_value: 0,
    status_breakdown: {
      requested: 0,
      ordered: 0,
      in_transit: 0,
      ready_for_pickup: 0,
      received: 0,
      cancelled: 0,
    },
  });
  const [employeeLogsSummary, setEmployeeLogsSummary] = useState([]);

  // ── Data fetching ────────────────────────────────────────
  const fetchPurchaseOrderSummary = useCallback(async () => {
    try {
      const result = await apiService.purchaseOrders.getPurchaseOrders();
      if (!result.success) return;
      const orders = result.orders || [];
      const is_pending = (o) =>
        ["requested", "ordered", "in_transit", "ready_for_pickup"].includes(
          o.status,
        );

      const totalOrders = orders.length;
      const pendingOrders = orders.filter(is_pending).length;
      const completedOrders = orders.filter(
        (o) => o.status === "received",
      ).length;
      const cancelledOrders = orders.filter(
        (o) => o.status === "cancelled",
      ).length;

      const totalValue = orders.reduce(
        (s, o) => s + (parseFloat(o.total_value) || 0),
        0,
      );
      const pendingValue = orders
        .filter(is_pending)
        .reduce((s, o) => s + (parseFloat(o.total_value) || 0), 0);
      const completedValue = orders
        .filter((o) => o.status === "received")
        .reduce((s, o) => s + (parseFloat(o.total_value) || 0), 0);

      setPurchaseOrderSummary({
        total_orders: totalOrders,
        pending_orders: pendingOrders,
        completed_orders: completedOrders,
        cancelled_orders: cancelledOrders,
        total_value: totalValue,
        pending_value: pendingValue,
        completed_value: completedValue,
        status_breakdown: {
          requested: orders.filter((o) => o.status === "requested").length,
          ordered: orders.filter((o) => o.status === "ordered").length,
          in_transit: orders.filter((o) => o.status === "in_transit").length,
          ready_for_pickup: orders.filter(
            (o) => o.status === "ready_for_pickup",
          ).length,
          received: completedOrders,
          cancelled: cancelledOrders,
        },
      });
    } catch (err) {
      console.error("Error fetching purchase order summary:", err);
    }
  }, []);

  const fetchEmployeeLogsSummary = useCallback(async () => {
    try {
      const result = await apiService.employeeLogs.getEmployeeLogs({
        limit: 5,
        sort_by: "created_at",
        sort_order: "DESC",
      });
      if (result.success) setEmployeeLogsSummary(result.data || []);
    } catch (err) {
      console.error("Error fetching employee logs summary:", err);
    }
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await apiService.items.getItems({ limit: 1000 });
      const items = result.data || [];
      const serverTotal =
        (result.statistics &&
          (result.statistics.total_items ?? result.statistics.total)) ??
        result.total ??
        result.count ??
        items.length;
      const uniqueSuppliers = [
        ...new Set(items.filter((i) => i.supplier).map((i) => i.supplier)),
      ];
      const totalInventoryValue = items.reduce(
        (s, i) => s + (i.balance || 0) * (i.price_per_unit || 0),
        0,
      );

      const statusFromText = (tx) => {
        if (!tx) return null;
        const s = String(tx).toLowerCase().trim();
        if (s.includes("out")) return "Out Of Stock";
        if (s.includes("low")) return "Low In Stock";
        if (s.includes("in")) return "In Stock";
        return null;
      };

      const deriveStatus = (i) => {
        const b = Number(i.balance) || 0,
          m = Number(i.min_stock) || 0;
        if (b === 0) return "Out Of Stock";
        if (m > 0 && b < m) return "Low In Stock";
        return "In Stock";
      };

      const statuses = items.map(
        (i) => statusFromText(i.item_status) || deriveStatus(i),
      );
      setStatistics({
        total_items: serverTotal,
        total_inventory_value: totalInventoryValue,
        in_stock: statuses.filter((s) => s === "In Stock").length,
        low_stock: statuses.filter((s) => s === "Low In Stock").length,
        out_of_stock: statuses.filter((s) => s === "Out Of Stock").length,
        active_suppliers: uniqueSuppliers.length,
      });

      const lowStockItems = items
        .filter((i) => {
          const st = statusFromText(i.item_status) || deriveStatus(i);
          return st === "Low In Stock" || st === "Out Of Stock";
        })
        .sort((a, b) => (a.balance || 0) - (b.balance || 0))
        .slice(0, 10);

      const recentStockAlerts = items
        .filter((i) => (Number(i.balance) || 0) === 0)
        .sort((a, b) => Number(b.item_no) - Number(a.item_no))
        .slice(0, 5);

      setAnalytics({ lowStockItems, recentStockAlerts, monthlyTrends: [] });
      await Promise.all([
        fetchPurchaseOrderSummary(),
        fetchEmployeeLogsSummary(),
      ]);
    } catch (err) {
      setError(err.message);
      console.error("Dashboard Data fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchPurchaseOrderSummary, fetchEmployeeLogsSummary]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const fmt = (n) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n);

  const completionRate =
    purchaseOrderSummary.total_orders > 0
      ? Math.round(
          (purchaseOrderSummary.completed_orders /
            purchaseOrderSummary.total_orders) *
            100,
        )
      : 0;

  const stockHealth =
    statistics.out_of_stock === 0 && statistics.low_stock <= 5
      ? { label: "Excellent", color: "green" }
      : statistics.out_of_stock <= 2
        ? { label: "Good", color: "amber" }
        : { label: "Needs Attention", color: "red" };

  const healthBadge = STATUS_BAR[stockHealth.color]?.badge ?? "";

  // ── Renders ──────────────────────────────────────────────────────────────────
  if (loading) return <AdminDashboardSkeleton />;
  if (error)
    return (
      <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
        <Icons.Alert />
        <div>
          <p className="text-lg font-bold text-red-800 dark:text-red-400">
            Error Loading Dashboard
          </p>
          <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-3 text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    );

  return (
    <div className="space-y-10 max-w-[1600px] mx-auto pb-10">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-zinc-900/40 p-6 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="text-xs font-bold tracking-widest uppercase text-zinc-400 dark:text-zinc-500">
              Procurement
            </span>
            <div className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${healthBadge}`}
            >
              {stockHealth.label} Health
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            Overview
          </h1>
          <p className="mt-1.5 text-sm font-medium text-zinc-500 dark:text-zinc-400 max-w-lg">
            Monitor inventory thresholds, supplier activity, and team actions in
            real-time.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-sm font-semibold transition-all shadow-md hover:shadow-lg active:scale-95"
        >
          <span className="group-hover:rotate-180 transition-transform duration-500 ease-in-out">
            <Icons.Refresh />
          </span>
          Refresh Data
        </button>
      </div>

      {/* ══ SECTION 1 — At a Glance ══════════════════════════════════════════ */}
      <section>
        <SectionHeader
          step="1"
          title="At a Glance"
          description="Core metrics across your entire workspace."
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricTile
            label="Total Items"
            value={statistics.total_items}
            sub="Tracked in inventory"
            accent="text-blue-600 dark:text-blue-400"
          />
          <MetricTile
            label="Inventory Value"
            value={fmt(statistics.total_inventory_value)}
            sub="Current valuation"
            accent="text-emerald-600 dark:text-emerald-400"
          />
          <MetricTile
            label="Active Suppliers"
            value={statistics.active_suppliers}
            sub="Unique partners"
            accent="text-purple-600 dark:text-purple-400"
          />
          <MetricTile
            label="Purchase Orders"
            value={purchaseOrderSummary.total_orders}
            sub={`${purchaseOrderSummary.pending_orders} active`}
            accent="text-amber-600 dark:text-amber-400"
          />
        </div>
      </section>

      {/* ══ SECTION 2 — Inventory Health ═════════════════════════════════════ */}
      <section>
        <SectionHeader
          step="2"
          title="Inventory Health"
          description="Stock levels and immediate action items."
        />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {/* Stock Distribution */}
          <Card className="flex flex-col">
            <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
              Stock Distribution
            </h4>
            <div className="space-y-5 flex-1">
              <ProgressRow
                label="In Stock"
                count={statistics.in_stock}
                total={statistics.total_items}
                colorClass="bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
              />
              <ProgressRow
                label="Low Stock"
                count={statistics.low_stock}
                total={statistics.total_items}
                colorClass="bg-amber-400 dark:bg-amber-400"
              />
              <ProgressRow
                label="Out of Stock"
                count={statistics.out_of_stock}
                total={statistics.total_items}
                colorClass="bg-red-500 dark:bg-red-500"
              />
            </div>
            <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                System Status
              </span>
              <span
                className={`text-xs font-bold px-3 py-1.5 rounded-full ${healthBadge}`}
              >
                {stockHealth.label}
              </span>
            </div>
          </Card>

          {/* Critical Alerts */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                Critical Alerts
                {analytics.recentStockAlerts.length > 0 && (
                  <span className="flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 rounded-full">
                    {analytics.recentStockAlerts.length}
                  </span>
                )}
              </h4>
            </div>

            {analytics.recentStockAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center bg-zinc-50/50 dark:bg-zinc-800/20 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                <Icons.CheckCircle />
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  All items stocked
                </span>
                <span className="text-xs font-medium text-zinc-500 mt-1">
                  No critical action required
                </span>
              </div>
            ) : (
              <div className="space-y-3 max-h-[260px] overflow-y-auto pr-2 custom-scrollbar">
                {analytics.recentStockAlerts.map((item) => (
                  <div
                    key={item.item_no}
                    className="group flex items-center justify-between gap-4 p-3.5 bg-red-50/50 dark:bg-red-500/5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl border border-red-100 dark:border-red-500/20 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {item.item_name}
                      </p>
                      <p className="text-xs font-medium text-zinc-500 mt-0.5 truncate">
                        {item.location || "Unassigned"}{" "}
                        <span className="mx-1 opacity-50">•</span> #
                        {item.item_no}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-extrabold px-2.5 py-1 rounded-md bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400">
                      EMPTY
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </section>

      {/* ══ SECTION 3 — Purchase Orders ══════════════════════════════════════ */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <SectionHeader
            step="3"
            title="Purchase Orders"
            description="Financials and fulfillment pipeline."
          />
          <button
            onClick={() => onNavigate && onNavigate("orders")}
            className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition-colors sm:-mt-6"
          >
            View Directory <span aria-hidden="true">&rarr;</span>
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <MetricTile
            label="Total Value"
            value={fmt(purchaseOrderSummary.total_value)}
            sub="Lifetime orders"
            accent="text-zinc-900 dark:text-white"
          />
          <MetricTile
            label="Pending Value"
            value={fmt(purchaseOrderSummary.pending_value)}
            sub="Active pipeline"
            accent="text-amber-600 dark:text-amber-400"
          />
          <MetricTile
            label="Completion Rate"
            value={`${completionRate}%`}
            sub="Successfully fulfilled"
            accent="text-emerald-600 dark:text-emerald-400"
          />
          <MetricTile
            label="Avg. Order Value"
            value={fmt(
              purchaseOrderSummary.total_orders > 0
                ? purchaseOrderSummary.total_value /
                    purchaseOrderSummary.total_orders
                : 0,
            )}
            sub="Per transaction"
            accent="text-purple-600 dark:text-purple-400"
          />
        </div>

        {/* Order pipeline */}
        <Card className="bg-zinc-50/50 dark:bg-zinc-900/50">
          <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-6">
            Pipeline Stages
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {[
              {
                key: "requested",
                label: "Requested",
                color:
                  "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300",
              },
              {
                key: "ordered",
                label: "Ordered",
                color:
                  "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400",
              },
              {
                key: "in_transit",
                label: "In Transit",
                color:
                  "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400",
              },
              {
                key: "ready_for_pickup",
                label: "Ready",
                color:
                  "bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20 text-orange-700 dark:text-orange-400",
              },
              {
                key: "received",
                label: "Received",
                color:
                  "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400",
              },
              {
                key: "cancelled",
                label: "Cancelled",
                color:
                  "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400",
              },
            ].map(({ key, label, color }) => (
              <div
                key={key}
                className={`flex flex-col items-center justify-center rounded-xl p-4 border shadow-sm transition-transform hover:-translate-y-0.5 ${color}`}
              >
                <span className="text-3xl font-black tracking-tighter mb-1">
                  {purchaseOrderSummary.status_breakdown[key]}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider opacity-80 text-center">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* ══ SECTION 4 — Analytics & Activity ════════════════════════════════ */}
      <section>
        <SectionHeader
          step="4"
          title="Analytics & Activity"
          description="Procurement signals and employee ledger."
        />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {/* Procurement Signals */}
          <Card>
            <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-6">
              System Signals
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <MetricTile
                label="Availability"
                value={`${statistics.total_items > 0 ? ((statistics.in_stock / statistics.total_items) * 100).toFixed(1) : 0}%`}
                sub="Stocked ratio"
                accent="text-blue-600 dark:text-blue-400"
              />
              <MetricTile
                label="Restock Queue"
                value={analytics.lowStockItems.length}
                sub="Items low/out"
                accent="text-red-600 dark:text-red-400"
              />
              <MetricTile
                label="Supplier Diversity"
                value={statistics.active_suppliers}
                sub="Network size"
                accent="text-purple-600 dark:text-purple-400"
              />
              <MetricTile
                label="Avg. Item Value"
                value={fmt(
                  statistics.total_items > 0
                    ? statistics.total_inventory_value / statistics.total_items
                    : 0,
                )}
                sub="System average"
                accent="text-emerald-600 dark:text-emerald-400"
              />
            </div>
          </Card>

          {/* Recent Employee Activity */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Action Ledger
              </h4>
              <button
                onClick={() => onNavigate && onNavigate("logs")}
                className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                Full Ledger &rarr;
              </button>
            </div>

            {employeeLogsSummary.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/20">
                <Icons.Clipboard />
                <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400">
                  Ledger Empty
                </span>
                <span className="text-xs font-medium text-zinc-500 mt-1">
                  No actions recorded recently
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                {employeeLogsSummary.map((log) => {
                  const { icon, bg } = logIcon(log.details);
                  return (
                    <div
                      key={log.id}
                      className="group flex items-center gap-4 p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/40 dark:hover:bg-zinc-800/80 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-all"
                    >
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-lg text-lg font-black shrink-0 shadow-sm ${bg}`}
                      >
                        {icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {log.username || "System User"}
                        </p>
                        <p className="text-xs font-medium text-zinc-500 truncate mt-0.5">
                          {log.details || "Action recorded"}
                        </p>
                      </div>
                      <time className="text-xs font-semibold text-zinc-400 shrink-0 tabular-nums">
                        {new Date(log.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </time>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;
