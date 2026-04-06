import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { themeFor } from "../../../utils/theme/themeClasses";
import apiService from "../../../utils/api/api-service";
import { ModalPortal, useToast } from "../shared";
import {
  ProcurementPill,
  ProcurementSectionCard,
  ProcurementStatCard,
} from "../shared";
import CreatePurchaseOrderWizard from "./CreatePurchaseOrderWizard";
import { PurchaseOrderTrackerSkeleton } from "../../skeletons/ProcurementSkeletons";
import { exportPurchaseOrderToPDF } from "../../../utils/purchase-order-export";
import { pollingManager } from "../../../utils/api/websocket/polling-manager.jsx";
import {
  SOCKET_EVENTS,
  SOCKET_ROOMS,
} from "../../../utils/api/websocket/constants/events.js";
import { ProcurementEventHandler } from "../../../utils/api/websocket/handlers/procurement-handler.js";
import {
  Plus,
  FileText,
  Pencil,
  Trash2,
  FileDown,
  Eye,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ShoppingCart,
  Clock,
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Banknote,
  PackageOpen,
  RefreshCw,
  X,
  CheckCheck,
  Info,
  ClipboardList,
  Loader2,
} from "lucide-react";

// ─── sort icon helper ─────────────────────────────────────────────────────────
function SortIcon({ field, sortField, sortDirection }) {
  if (sortField !== field)
    return <ChevronsUpDown className="w-3 h-3 text-zinc-400 opacity-60" />;
  return sortDirection === "asc" ? (
    <ChevronUp className="w-3 h-3 text-blue-500" />
  ) : (
    <ChevronDown className="w-3 h-3 text-blue-500" />
  );
}

// ─── sortable th ─────────────────────────────────────────────────────────────
function SortTh({
  field,
  label,
  sortField,
  sortDirection,
  onSort,
  className = "text-left",
}) {
  return (
    <th
      onClick={() => onSort(field)}
      className={`px-4 py-3 ${className} text-[10px] font-bold uppercase tracking-wider text-zinc-500 cursor-pointer hover:text-zinc-800 dark:hover:text-zinc-200 select-none transition-colors`}
    >
      <div
        className={`inline-flex items-center gap-1.5 ${className === "text-center" ? "justify-center" : ""}`}
      >
        {label}
        <SortIcon
          field={field}
          sortField={sortField}
          sortDirection={sortDirection}
        />
      </div>
    </th>
  );
}

// ─── status helpers ───────────────────────────────────────────────────────────
const STATUS_META = {
  draft: {
    label: "Draft",
    badge: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  },
  requested: {
    label: "Requested",
    badge: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  },
  approved: {
    label: "Approved",
    badge:
      "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
  },
  ordered: {
    label: "Ordered",
    badge:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  },
  received: {
    label: "Received",
    badge:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  cancelled: {
    label: "Cancelled",
    badge: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  },
};

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || {
    label: status,
    badge: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${meta.badge}`}
    >
      {meta.label}
    </span>
  );
}

const PRIORITY_META = {
  P0: { badge: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400" },
  P1: {
    badge:
      "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
  },
  P2: {
    badge:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  },
  P3: {
    badge: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  },
  P4: {
    badge: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  },
};

function PriorityBadge({ priority }) {
  const key = String(priority || "").toUpperCase();
  const meta = PRIORITY_META[key] || {
    badge: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${meta.badge}`}
    >
      {key || "—"}
    </span>
  );
}

// ─── main component ───────────────────────────────────────────────────────────
function PurchaseOrderTracker() {
  const { isDarkMode } = useAuth();
  const t = themeFor(isDarkMode);
  const { success, error: showError } = useToast();
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [restockItems, setRestockItems] = useState([]);

  const [sortField, setSortField] = useState("priority");
  const [sortDirection, setSortDirection] = useState("desc");

  const [orderForm, setOrderForm] = useState({
    supplier: "",
    items: [],
    expected_delivery_date: "",
    notes: "",
    priority: "P2",
    multi_supplier_mode: false,
  });

  const [orderSplitMode, setOrderSplitMode] = useState("single");

  const [statusUpdate, setStatusUpdate] = useState({
    order_id: "",
    new_status: "",
    notes: "",
    actual_delivery_date: "",
  });

  const handlersRegistered = useRef(false);
  const unsubscribers = useRef([]);

  const initializeRealtime = useCallback(() => {
    if (!handlersRegistered.current) {
      new ProcurementEventHandler(pollingManager);
      pollingManager.joinRoom(SOCKET_ROOMS.PROCUREMENT);

      const unsubRefresh = pollingManager.subscribeToUpdates(
        "procurement:refresh",
        () => {
          fetchPurchaseOrders();
        },
      );
      const poEvents = [
        SOCKET_EVENTS.PROCUREMENT.PO_CREATED,
        SOCKET_EVENTS.PROCUREMENT.PO_UPDATED,
        SOCKET_EVENTS.PROCUREMENT.PO_DELETED,
        SOCKET_EVENTS.PROCUREMENT.PO_STATUS_CHANGED,
        SOCKET_EVENTS.PROCUREMENT.PO_APPROVED,
        SOCKET_EVENTS.PROCUREMENT.PO_REJECTED,
        SOCKET_EVENTS.PROCUREMENT.PO_RECEIVED,
      ];
      const unsubs = poEvents.map((evt) =>
        pollingManager.subscribeToUpdates(evt, () => fetchPurchaseOrders()),
      );
      unsubscribers.current.push(unsubRefresh, ...unsubs);
      handlersRegistered.current = true;
    }
  }, []);

  useEffect(() => {
    fetchPurchaseOrders();
    fetchRestockItems();
    initializeRealtime();
    return () => {
      if (unsubscribers.current.length) {
        unsubscribers.current.forEach((fn) => {
          try {
            fn && fn();
          } catch (_) {}
        });
        unsubscribers.current = [];
      }
    };
  }, [initializeRealtime]);

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      const result = await apiService.purchaseOrders.getPurchaseOrders();
      if (result.success) {
        const orders = result.orders || [];
        setPurchaseOrders(sortOrders(orders, sortField, sortDirection));
      } else {
        setError(result.message || "Failed to fetch purchase orders");
      }
    } catch (err) {
      setError(err.message || "Failed to fetch purchase orders");
    } finally {
      setLoading(false);
    }
  };

  const sortOrders = (orders, field, direction) => {
    const sorted = [...orders].sort((a, b) => {
      let aVal, bVal;
      switch (field) {
        case "po_number":
          aVal = parseInt(a.po_number) || 0;
          bVal = parseInt(b.po_number) || 0;
          break;
        case "supplier":
          aVal = (a.supplier || "").toLowerCase();
          bVal = (b.supplier || "").toLowerCase();
          break;
        case "po_date":
          aVal = new Date(a.po_date || 0);
          bVal = new Date(b.po_date || 0);
          break;
        case "priority":
          aVal = getPriorityRank(a.priority);
          bVal = getPriorityRank(b.priority);
          break;
        case "total_amount":
          aVal = parseFloat(a.total_amount) || 0;
          bVal = parseFloat(b.total_amount) || 0;
          break;
        case "order_status":
          aVal = (a.order_status || "").toLowerCase();
          bVal = (b.order_status || "").toLowerCase();
          break;
        default:
          return 0;
      }
      if (direction === "asc") return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      else return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
    });
    return sorted;
  };

  const handleSort = (field) => {
    if (sortField === field)
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  useEffect(() => {
    if (purchaseOrders.length > 0)
      setPurchaseOrders(sortOrders(purchaseOrders, sortField, sortDirection));
  }, [sortField, sortDirection]);

  const fetchRestockItems = async () => {
    try {
      const result = await apiService.items.getItems({ limit: 1000 });
      const items = result.data || [];
      const restock = items
        .map((item) => {
          const balance = Number(item.balance) || 0;
          const minStock = Number(item.min_stock) || 0;
          const shortage = Math.max(minStock - balance, 0);
          const status =
            balance === 0
              ? "Out Of Stock"
              : minStock > 0 && balance < minStock
                ? "Low In Stock"
                : "In Stock";
          return {
            ...item,
            shortage,
            recommended_quantity: Math.max(shortage, 1),
            status,
          };
        })
        .filter(
          (item) =>
            item.status === "Out Of Stock" || item.status === "Low In Stock",
        )
        .sort((a, b) => {
          const sp = { "Out Of Stock": 0, "Low In Stock": 1 };
          if (sp[a.status] !== sp[b.status]) return sp[a.status] - sp[b.status];
          return b.shortage - a.shortage;
        });
      setRestockItems(restock);
    } catch (err) {
      console.error("Error fetching restock items:", err);
    }
  };

  const getStatusText = (status) => STATUS_META[status]?.label || status;

  const getPriorityRank = (priority) => {
    if (!priority) return 0;
    const p = String(priority).toUpperCase();
    return (
      {
        P0: 5,
        P1: 4,
        P2: 3,
        P3: 2,
        P4: 1,
        URGENT: 5,
        HIGH: 4,
        NORMAL: 3,
        LOW: 2,
      }[p] || 0
    );
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const groupItemsBySupplier = (items) =>
    items.reduce((groups, item) => {
      const supplier = item.supplier || "Unknown Supplier";
      if (!groups[supplier]) groups[supplier] = [];
      groups[supplier].push(item);
      return groups;
    }, {});

  const getUniqueSuppliers = (items) => [
    ...new Set(items.map((item) => item.supplier || "Unknown Supplier")),
  ];

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleWizardSuccess = (message) => {
    success("Success", message);
    fetchPurchaseOrders();
  };
  const handleCreateOrder = () => {
    setOrderForm({
      supplier: "",
      items: [],
      expected_delivery_date: "",
      notes: "",
      priority: "P2",
    });
    setSelectedOrder(null);
    setShowCreateModal(true);
  };
  const handleExportPDF = (order) => {
    try {
      exportPurchaseOrderToPDF(order);
    } catch (err) {
      showError("Export Error", err.message || "Failed to export PDF");
    }
  };

  const handleAddItemToOrder = (item) => {
    setOrderForm((prev) => {
      const newItems = [
        ...prev.items,
        {
          item_no: item.item_no,
          item_name: item.item_name,
          quantity: item.recommended_quantity,
          custom_quantity: item.recommended_quantity,
          recommended_quantity: item.recommended_quantity,
          unit_price: item.price_per_unit || 0,
          unit_of_measure: item.unit_of_measure || "",
          supplier: item.supplier || "",
          supplier_specific: item.supplier || "",
          delivery_method: "delivery",
        },
      ];
      const uniqueSuppliers = getUniqueSuppliers(newItems);
      let newSupplier = prev.supplier;
      let multiSupplierMode = false;
      if (newItems.length === 1) newSupplier = item.supplier || "";
      else if (uniqueSuppliers.length === 1) newSupplier = uniqueSuppliers[0];
      else {
        multiSupplierMode = true;
        newSupplier = "Multiple Suppliers";
      }
      return {
        ...prev,
        items: newItems,
        supplier: newSupplier,
        multi_supplier_mode: multiSupplierMode,
      };
    });
  };

  const handleUpdateItemQuantity = (itemNo, newQuantity) =>
    setOrderForm((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.item_no === itemNo
          ? { ...item, custom_quantity: newQuantity, quantity: newQuantity }
          : item,
      ),
    }));

  const handleUpdateItemDeliveryMethod = (itemNo, deliveryMethod) =>
    setOrderForm((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.item_no === itemNo
          ? { ...item, delivery_method: deliveryMethod }
          : item,
      ),
    }));

  const handleRemoveItemFromOrder = (itemNo) => {
    setOrderForm((prev) => {
      const newItems = prev.items.filter((item) => item.item_no !== itemNo);
      let newSupplier = prev.supplier;
      if (newItems.length === 0) newSupplier = "";
      else {
        const suppliers = newItems
          .map((i) => i.supplier || "")
          .filter((s) => s);
        const uniqueSuppliers = [...new Set(suppliers)];
        if (uniqueSuppliers.length === 1) newSupplier = uniqueSuppliers[0];
      }
      return { ...prev, items: newItems, supplier: newSupplier };
    });
  };

  const handleSubmitOrder = async () => {
    try {
      if (orderForm.multi_supplier_mode && orderSplitMode === "split") {
        const supplierGroups = groupItemsBySupplier(orderForm.items);
        const createPromises = [];
        for (const [supplier, items] of Object.entries(supplierGroups)) {
          const orderData = {
            supplier,
            items,
            expected_delivery_date: orderForm.expected_delivery_date || null,
            notes: `${orderForm.notes}${orderForm.notes ? " | " : ""}Multi-supplier order - Part of batch`,
            priority: orderForm.priority,
            created_by: "Current User",
          };
          const orderPromise = apiService.purchaseOrders
            .createPurchaseOrder(orderData, { deduplicate: false })
            .then((r) => r)
            .catch((e) => {
              console.error(
                `Error creating order for supplier ${supplier}:`,
                e,
              );
              return { success: false, error: e.message };
            });
          createPromises.push(orderPromise);
        }
        const results = await Promise.all(createPromises);
        const successCount = results.filter((r) => r && r.success).length;
        const failCount = results.length - successCount;
        if (successCount > 0) {
          const successfulSuppliers = results
            .map((r, i) =>
              r && r.success ? Object.keys(supplierGroups)[i] : null,
            )
            .filter(Boolean);
          const failedSuppliers = results
            .map((r, i) =>
              !r || !r.success ? Object.keys(supplierGroups)[i] : null,
            )
            .filter(Boolean);
          let message = `Successfully created ${successCount} purchase order(s)`;
          if (successfulSuppliers.length > 0)
            message += ` for: ${successfulSuppliers.join(", ")}`;
          if (failCount > 0)
            message += `. Failed for: ${failedSuppliers.join(", ")}`;
          success("Purchase Orders Created", message);
          setShowCreateModal(false);
          setOrderForm({
            supplier: "",
            items: [],
            expected_delivery_date: "",
            notes: "",
            priority: "P2",
            multi_supplier_mode: false,
          });
          setOrderSplitMode("single");
          fetchPurchaseOrders();
        } else {
          showError(
            "Failed to Create Orders",
            `Attempted suppliers: ${Object.keys(supplierGroups).join(", ")}`,
          );
        }
      } else {
        const orderData = {
          supplier: orderForm.multi_supplier_mode
            ? "Multiple Suppliers"
            : orderForm.supplier,
          items: orderForm.items,
          expected_delivery_date: orderForm.expected_delivery_date || null,
          notes: orderForm.notes,
          priority: orderForm.priority,
          created_by: "Current User",
        };
        const result =
          await apiService.purchaseOrders.createPurchaseOrder(orderData);
        if (result.success) {
          success("Success", "Purchase order created successfully!");
          setShowCreateModal(false);
          setOrderForm({
            supplier: "",
            items: [],
            expected_delivery_date: "",
            notes: "",
            priority: "P2",
            multi_supplier_mode: false,
          });
          setOrderSplitMode("single");
          fetchPurchaseOrders();
        } else {
          showError(
            "Failed",
            result.message || "Failed to create purchase order",
          );
        }
      }
    } catch (err) {
      setError(err.message || "Failed to create purchase order");
    }
  };

  const handleUpdateStatus = async () => {
    try {
      if (!selectedOrder) {
        showError(
          "No Order Selected",
          "Please open a purchase order to update its status.",
        );
        return;
      }
      const payload = {
        status: (statusUpdate.new_status || "received").toLowerCase(),
        actual_delivery_date: statusUpdate.actual_delivery_date || undefined,
        notes: statusUpdate.notes || undefined,
      };
      const result = await apiService.purchaseOrders.updatePurchaseOrderStatus(
        selectedOrder.id,
        payload,
      );
      if (result && result.success) {
        success("Updated", result.message || "Purchase order status updated");
        fetchPurchaseOrders();
        setShowOrderDetails(false);
      } else {
        showError(
          "Failed",
          (result && (result.message || result.error)) ||
            "Failed to update purchase order status",
        );
      }
    } catch (err) {
      showError(
        "Error",
        err.message || "Failed to update purchase order status",
      );
    }
  };

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setStatusUpdate({
      order_id: order.id,
      new_status: order.status,
      notes: "",
      actual_delivery_date: order.actual_delivery_date || "",
    });
    setShowOrderDetails(true);
  };

  const handleConvertDraftToRequested = async () => {
    if (!selectedOrder || selectedOrder.status !== "draft") {
      showError(
        "Invalid Action",
        "Only draft orders can be converted to requested status",
      );
      return;
    }
    try {
      const result = await apiService.purchaseOrders.updatePurchaseOrderStatus(
        selectedOrder.id,
        { status: "requested", notes: "Converted from draft to requested" },
      );
      if (result && result.success) {
        success(
          "Converted",
          "Draft purchase order has been submitted as requested",
        );
        fetchPurchaseOrders();
        setShowOrderDetails(false);
      } else
        showError(
          "Failed",
          (result && (result.message || result.error)) ||
            "Failed to convert draft to requested",
        );
    } catch (err) {
      showError("Error", err.message || "Failed to convert draft to requested");
    }
  };

  const handleOpenEdit = (order) => {
    setSelectedOrder(order);
    setShowCreateModal(true);
  };

  const handleDeleteOrder = async (orderId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this purchase order? This action cannot be undone.",
      )
    ) {
      try {
        const result =
          await apiService.purchaseOrders.deletePurchaseOrder(orderId);
        if (result.success) {
          success("Deleted", "Purchase order deleted successfully!");
          fetchPurchaseOrders();
        } else
          showError(
            "Failed",
            result.message || "Failed to delete purchase order",
          );
      } catch (err) {
        showError("Error", err.message || "Failed to delete purchase order");
      }
    }
  };

  if (loading) return <PurchaseOrderTrackerSkeleton />;

  const pendingOrders = purchaseOrders.filter(
    (o) => !["received", "cancelled"].includes(o.status),
  ).length;
  const urgentOrders = purchaseOrders.filter(
    (o) => getPriorityRank(o.priority) >= 4,
  ).length;
  const overdueOrders = purchaseOrders.filter((o) => {
    if (
      !o.expected_delivery_date ||
      ["received", "cancelled"].includes(o.status)
    )
      return false;
    return new Date(o.expected_delivery_date) < new Date();
  }).length;
  const totalOrderValue = purchaseOrders.reduce(
    (total, o) => total + (parseFloat(o.total_value) || 0),
    0,
  );

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Page header ── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <ProcurementPill color="slate">Orders Workspace</ProcurementPill>
            <ProcurementPill color="slate">
              Live updates enabled
            </ProcurementPill>
          </div>
          <div>
            <h2
              className={`text-2xl sm:text-3xl font-bold tracking-tight ${t.header}`}
            >
              Purchase Order Tracker
            </h2>
            <p className={`mt-1.5 max-w-2xl text-sm ${t.muted}`}>
              Coordinate supplier requests, monitor approvals, and keep
              deliveries visible from draft to receipt.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Orders in view
            </p>
            <p className={`mt-1 text-lg font-black ${t.header}`}>
              {purchaseOrders.length}
            </p>
          </div>
          <button
            onClick={handleCreateOrder}
            className="inline-flex items-center gap-2 rounded-2xl bg-zinc-950 dark:bg-zinc-100 px-4 py-3 text-sm font-semibold text-white dark:text-zinc-900 shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-300 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Purchase Order
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          {
            label: "Orders",
            value: purchaseOrders.length,
            Icon: ShoppingCart,
            helper: "All purchase orders in the tracker",
          },
          {
            label: "Pending",
            value: pendingOrders,
            Icon: Clock,
            helper: "Draft, requested, approved, or ordered",
          },
          {
            label: "Urgent",
            value: urgentOrders,
            Icon: AlertTriangle,
            helper: "Priority P0–P1 orders needing attention",
          },
          {
            label: "Overdue",
            value: overdueOrders,
            Icon: CalendarClock,
            helper: "Expected delivery date has passed",
          },
          {
            label: "Received",
            value: purchaseOrders.filter((o) => o.status === "received").length,
            Icon: CheckCircle2,
            helper: "Completed purchase orders",
          },
          {
            label: "Pipeline Value",
            value: formatCurrency(totalOrderValue),
            Icon: Banknote,
            helper: "Combined value of tracked orders",
          },
        ].map(({ label, value, Icon, helper }) => (
          <div
            key={label}
            className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                {label}
              </p>
              <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <Icon className="w-3.5 h-3.5 text-zinc-500" />
              </div>
            </div>
            <p className="text-xl font-black text-zinc-900 dark:text-white leading-none">
              {value}
            </p>
            <p className="mt-1 text-[10px] text-zinc-400 leading-tight">
              {helper}
            </p>
          </div>
        ))}
      </div>

      {/* ── Order queue ── */}
      <ProcurementSectionCard
        title="Order queue"
        description="Review supplier activity, sort by delivery risk or value, and open any order for detail actions."
        action={
          <ProcurementPill color="slate">
            {purchaseOrders.length} tracked
          </ProcurementPill>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <SortTh
                  field="po_number"
                  label="Order ID"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
                <SortTh
                  field="supplier"
                  label="Supplier"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
                <SortTh
                  field="order_status"
                  label="Status"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  className="text-center"
                />
                <SortTh
                  field="priority"
                  label="Priority"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  className="text-center"
                />
                <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Items
                </th>
                <SortTh
                  field="total_amount"
                  label="Total Value"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  className="text-center"
                />
                <SortTh
                  field="po_date"
                  label="Expected Delivery"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  className="text-center"
                />
                <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {purchaseOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-zinc-900 dark:text-white">
                      {order.id}
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      {formatDate(order.order_date)}
                    </p>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-zinc-700 dark:text-zinc-300 font-medium">
                    {order.supplier}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <PriorityBadge priority={order.priority} />
                  </td>
                  <td className="px-4 py-3.5 text-center text-xs text-zinc-600 dark:text-zinc-400">
                    <span className="font-semibold text-zinc-900 dark:text-white">
                      {order.total_items}
                    </span>
                    <span className="text-zinc-400"> items</span>
                    <span className="block text-[10px] text-zinc-400">
                      {order.total_quantity} qty
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center font-black text-sm text-zinc-900 dark:text-white">
                    {formatCurrency(order.total_value)}
                  </td>
                  <td className="px-4 py-3.5 text-center text-xs text-zinc-600 dark:text-zinc-400">
                    {formatDate(order.expected_delivery_date)}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => handleViewOrderDetails(order)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 active:scale-95 transition-all"
                      >
                        <Eye className="w-3 h-3" /> View
                      </button>
                      <button
                        onClick={() => handleExportPDF(order)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-700 dark:hover:bg-zinc-300 active:scale-95 transition-all"
                      >
                        <FileDown className="w-3 h-3" /> PDF
                      </button>
                      <button
                        onClick={() => handleOpenEdit(order)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold active:scale-95 transition-all"
                      >
                        <Pencil className="w-3 h-3" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold active:scale-95 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {purchaseOrders.length === 0 && !loading && (
          <div className="py-16 text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
              <PackageOpen className="w-7 h-7 text-zinc-400" />
            </div>
            <p className={`text-base font-bold ${t.header}`}>
              No purchase orders yet
            </p>
            <p className={`mt-1 text-sm ${t.muted}`}>
              Create your first order to start tracking supplier requests and
              approvals.
            </p>
          </div>
        )}
      </ProcurementSectionCard>

      {/* ── Create / Edit Wizard ── */}
      <CreatePurchaseOrderWizard
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedOrder(null);
        }}
        onSuccess={(msg) => handleWizardSuccess(msg)}
        editingOrder={selectedOrder}
      />

      {/* ── Order Details Modal ── */}
      {showOrderDetails && selectedOrder && (
        <ModalPortal>
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 backdrop-blur-md bg-zinc-900/40 dark:bg-black/60">
            <div className="w-full max-w-5xl max-h-[90vh] flex flex-col rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden">
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-950 dark:bg-zinc-950">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Purchase Order Details
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-zinc-300">
                      {selectedOrder.id}
                    </span>
                    <StatusBadge status={selectedOrder.status} />
                  </div>
                </div>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white active:scale-95 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable body */}
              <div className="overflow-y-auto flex-1 p-6 space-y-5 bg-zinc-50 dark:bg-zinc-950/50">
                {/* Order info */}
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Info className="w-4 h-4 text-zinc-400" />
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                      Order Information
                    </h4>
                  </div>

                  {/* Draft notice */}
                  {selectedOrder.status === "draft" && (
                    <div className="mb-4 flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-amber-700 dark:text-amber-400">
                          Draft Purchase Order
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5 mb-3">
                          This draft hasn't been officially submitted. It won't
                          affect inventory or appear in reports until converted
                          to "Requested" status.
                        </p>
                        <button
                          onClick={handleConvertDraftToRequested}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm active:scale-95 transition-all"
                        >
                          <CheckCheck className="w-3.5 h-3.5" /> Submit as
                          Requested
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      {
                        label: "Supplier",
                        content: (
                          <p className="font-bold text-base text-zinc-900 dark:text-white">
                            {selectedOrder.supplier}
                          </p>
                        ),
                      },
                      {
                        label: "Status",
                        content: <StatusBadge status={selectedOrder.status} />,
                      },
                      {
                        label: "Priority",
                        content: (
                          <PriorityBadge priority={selectedOrder.priority} />
                        ),
                      },
                      {
                        label: "Order Date",
                        content: (
                          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                            {formatDate(selectedOrder.order_date)}
                          </p>
                        ),
                      },
                      {
                        label: "Expected Delivery",
                        content: (
                          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                            {formatDate(selectedOrder.expected_delivery_date)}
                          </p>
                        ),
                      },
                      {
                        label: "Total Value",
                        content: (
                          <p className="text-xl font-black text-zinc-900 dark:text-white">
                            {formatCurrency(selectedOrder.total_value)}
                          </p>
                        ),
                      },
                    ].map(({ label, content }) => (
                      <div
                        key={label}
                        className="rounded-xl p-3.5 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700"
                      >
                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                          {label}
                        </p>
                        {content}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order items */}
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <ClipboardList className="w-4 h-4 text-zinc-400" />
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                      Order Items{" "}
                      <span className="text-zinc-400 font-normal">
                        ({selectedOrder.items?.length || 0})
                      </span>
                    </h4>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <table className="w-full text-sm">
                      <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-700">
                        <tr>
                          {[
                            "Item",
                            "Quantity",
                            "Unit Price",
                            "Total",
                            "Status",
                          ].map((h, i) => (
                            <th
                              key={h}
                              className={`px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 ${i === 0 ? "text-left" : i < 3 ? "text-center" : i === 3 ? "text-right" : "text-center"}`}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                        {selectedOrder.items.map((item, idx) => (
                          <tr
                            key={`${item.item_no}-${idx}`}
                            className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                          >
                            <td className="px-4 py-3">
                              <p className="font-semibold text-zinc-900 dark:text-white text-sm">
                                {item.item_name}
                              </p>
                              <p className="text-[10px] font-mono text-zinc-400 mt-0.5">
                                #{item.item_no}
                              </p>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                                {item.quantity} {item.unit_of_measure || ""}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                              {formatCurrency(item.unit_price)}
                            </td>
                            <td className="px-4 py-3 text-right font-black text-sm text-zinc-900 dark:text-white">
                              {formatCurrency(item.quantity * item.unit_price)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <StatusBadge status={item.status} />
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-zinc-50 dark:bg-zinc-800/40">
                          <td
                            colSpan="3"
                            className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-zinc-500"
                          >
                            Total Amount
                          </td>
                          <td className="px-4 py-3 text-right font-black text-base text-zinc-900 dark:text-white">
                            {formatCurrency(selectedOrder.total_value)}
                          </td>
                          <td />
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Update status */}
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <RefreshCw className="w-4 h-4 text-zinc-400" />
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                      Update Order Status
                    </h4>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                          New Status
                        </label>
                        <select
                          value={statusUpdate.new_status}
                          onChange={(e) =>
                            setStatusUpdate({
                              ...statusUpdate,
                              new_status: e.target.value,
                            })
                          }
                          className="w-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        >
                          <option value="">Select new status…</option>
                          <option value="requested">Requested</option>
                          <option value="approved">Approved</option>
                          <option value="ordered">Ordered</option>
                          <option value="received">Received</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                      {statusUpdate.new_status === "received" && (
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                            Actual Delivery Date
                          </label>
                          <input
                            type="date"
                            value={statusUpdate.actual_delivery_date}
                            onChange={(e) =>
                              setStatusUpdate({
                                ...statusUpdate,
                                actual_delivery_date: e.target.value,
                              })
                            }
                            className="w-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                        Update Notes
                      </label>
                      <textarea
                        value={statusUpdate.notes}
                        onChange={(e) =>
                          setStatusUpdate({
                            ...statusUpdate,
                            notes: e.target.value,
                          })
                        }
                        rows={3}
                        placeholder="Add notes about this status update…"
                        className="w-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal footer */}
              <div className="flex items-center gap-3 px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <button
                  onClick={handleUpdateStatus}
                  disabled={!statusUpdate.new_status}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-semibold shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-300 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <CheckCheck className="w-4 h-4" /> Update Status
                </button>
                <button
                  onClick={() => handleExportPDF(selectedOrder)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-95 transition-all"
                >
                  <FileDown className="w-4 h-4" /> PDF
                </button>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-700 active:scale-95 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}

export default PurchaseOrderTracker;
