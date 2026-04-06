import { useState, useEffect, lazy, Suspense, useRef } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { themeFor } from "../../../utils/theme/themeClasses";
import apiService from "../../../utils/api/api-service";
import ModalPortal from "../shared/ModalPortal";
import QRCodeSmall from "../barcode/QRCodeSmall";
import { ItemDetailView } from "./ItemDetailView";
import InventoryListView from "./InventoryListView";
import DuplicateCheckView from "./DuplicateCheckView";
import BulkItemCreator from "./BulkItemCreator";
import { useToast } from "../shared/ToastNotification";
import ConfirmationModal from "../shared/ConfirmationModal";
import {
  ProcurementPill,
  ProcurementSectionCard,
  ProcurementStatCard,
} from "../shared";
import { InventoryManagementSkeleton } from "../../skeletons/ProcurementSkeletons";
import {
  exportToCSV,
  exportToExcel,
  parseCSV,
  parseExcel,
  validateImportedItems,
  downloadTemplate,
} from "../../../utils/inventory-import-export";
import { pollingManager } from "../../../utils/api/websocket/polling-manager.jsx";
import { InventoryEventHandler } from "../../../utils/api/websocket/handlers/inventory-handler";
import {
  SOCKET_EVENTS,
  SOCKET_ROOMS,
} from "../../../utils/api/websocket/constants/events.js";
import { findInventoryDuplicateItem } from "../../../utils/inventory-duplicate-utils";

// ─── Lucide Icons ───────────────────────────────────────────────────────────
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  ArrowUpDown,
  MapPin,
  Upload,
  Download,
  Barcode,
  Plus,
  Trash2,
  PackagePlus,
  PackageMinus,
  Info,
  FileSpreadsheet,
  FileDown,
  RefreshCw,
  LayoutGrid,
  List,
  CopyX,
} from "lucide-react";

// Lazy load the heavy wizard component
const AddEditItemWizard = lazy(() => import("./AddEditItemWizard"));

function InventoryManagement() {
  const { isDarkMode } = useAuth();
  const t = themeFor(isDarkMode);
  const { success, error: showError, warning } = useToast();
  // Inventory Management States
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showBulkCreator, setShowBulkCreator] = useState(false);
  const [showStockInsert, setShowStockInsert] = useState(false);
    // Bulk add handler
    const handleBulkAddItems = async (bulkItems) => {
      try {
        for (const item of bulkItems) {
          // Check for duplicate by name+brand
          const latestItems = await getLatestItemsSnapshot();
          const duplicateItem = findInventoryDuplicateItem(latestItems, item);
          if (duplicateItem) {
            await apiService.items.updateItem(
              duplicateItem.item_no,
              buildItemPayload(duplicateItem, item),
            );
          } else {
            await apiService.items.createItem(buildItemPayload({}, item));
          }
        }
        await fetchItems();
        setShowBulkCreator(false);
        success("Bulk Add Success", `Added/updated ${bulkItems.length} items.`);
      } catch (err) {
        showError("Bulk Add Failed", err.message);
      }
    };
  const [stockInsertData, setStockInsertData] = useState({
    quantity: 0,
    reason: "",
  });
  const [showStockManager, setShowStockManager] = useState(false);
  const [stockManagerData, setStockManagerData] = useState({
    stock_in: 0,
    stock_out: 0,
    reason: "",
    current_balance: 0,
  });
  const [statistics, setStatistics] = useState({});
  const [filters, setFilters] = useState({
    search: "",
    item_status: "",
    location: "",
  });
  const [sortBy, setSortBy] = useState("");
  const [sortedItems, setSortedItems] = useState([]);
  const [uniqueLocations, setUniqueLocations] = useState([]);
  const [showItemDetail, setShowItemDetail] = useState(false);
  const [selectedItemForDetail, setSelectedItemForDetail] = useState(null);
  const [returnToDetailView, setReturnToDetailView] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list' | 'duplicate'
  const [selectedImage, setSelectedImage] = useState(null);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "warning",
  });

  // Client-side pagination state for grid view (20 per batch)
  const [visibleCount, setVisibleCount] = useState(20);

  // Import/Export modal state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importMode, setImportMode] = useState("add"); // 'add' or 'replace'
  const [importPreview, setImportPreview] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importErrors, setImportErrors] = useState([]);
  const [showExportModal, setShowExportModal] = useState(false);

  // Track if real-time handlers are registered to prevent duplicates
  const handlersRegistered = useRef(false);

  useEffect(() => {
    fetchItems();
    setVisibleCount(20);
  }, [filters]);

  // Real-time event subscription for inventory updates
  useEffect(() => {
    if (handlersRegistered.current) return;

    // Register inventory event handler
    new InventoryEventHandler(pollingManager);

    pollingManager.joinRoom(SOCKET_ROOMS.INVENTORY);
    pollingManager.joinRoom(SOCKET_ROOMS.PROCUREMENT);

    // Subscribe to inventory refresh events
    const unsubInventoryRefresh = pollingManager.subscribeToUpdates(
      "inventory:refresh",
      () => {
        console.log("📦 Inventory refresh triggered by real-time event");
        fetchItems();
      },
    );

    // Subscribe to specific inventory events
    const inventoryEvents = [
      SOCKET_EVENTS.INVENTORY.UPDATED,
      SOCKET_EVENTS.INVENTORY.INSERTED,
      SOCKET_EVENTS.INVENTORY.REMOVED,
      SOCKET_EVENTS.INVENTORY.ITEM_CREATED,
      SOCKET_EVENTS.INVENTORY.ITEM_UPDATED,
      SOCKET_EVENTS.INVENTORY.ITEM_DELETED,
      SOCKET_EVENTS.INVENTORY.CHECKOUT_COMPLETED,
    ];

    const unsubsInventory = inventoryEvents.map((evt) =>
      pollingManager.subscribeToUpdates(evt, (data) => {
        console.log(`📦 Received ${evt} event:`, data);
        fetchItems();
      }),
    );

    handlersRegistered.current = true;

    // Cleanup on unmount
    return () => {
      unsubInventoryRefresh();
      unsubsInventory.forEach((unsub) => unsub());
    };
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);

      // Filter out empty values before creating query params
      const cleanFilters = Object.entries(filters).reduce(
        (acc, [key, value]) => {
          if (value && value.trim() !== "") {
            acc[key] = value;
          }
          return acc;
        },
        {},
      );

      // Use ItemsService instead of direct fetch
      const result = await apiService.items.getItems({
        ...cleanFilters,
        limit: 1000,
      });
      const fetched = result.data || [];
      setItems(fetched);
      // Prefer server-declared total if present (covers soft-deletes or server filters)
      const serverTotal =
        (result.statistics &&
          (result.statistics.total_items ?? result.statistics.total)) ??
        result.total ??
        result.count ??
        (Array.isArray(result.data) ? result.data.length : 0);
      setStatistics((prev) => ({ ...prev, server_total_items: serverTotal }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Recompute statistics whenever items change
  useEffect(() => {
    // Derive reliable statistics locally to avoid backend mismatches
    const statusFromText = (text) => {
      if (!text) return null;
      const t = String(text).toLowerCase().trim();
      if (t.includes("out")) return "Out Of Stock";
      if (t.includes("low")) return "Low In Stock";
      if (t.includes("in")) return "In Stock";
      return null;
    };
    const deriveStatus = (item) => {
      const bal = Number(item.balance) || 0;
      const min = Number(item.min_stock) || 0;
      if (bal === 0) return "Out Of Stock";
      if (min > 0 && bal < min) return "Low In Stock";
      return "In Stock";
    };

    const total_items = items.length;
    const statuses = items.map(
      (i) => statusFromText(i.item_status) || deriveStatus(i),
    );
    const in_stock = statuses.filter((s) => s === "In Stock").length;
    const low_stock = statuses.filter((s) => s === "Low In Stock").length;
    const out_of_stock = statuses.filter((s) => s === "Out Of Stock").length;

    setStatistics((prev) => ({
      ...prev,
      total_items,
      in_stock,
      low_stock,
      out_of_stock,
    }));
  }, [items]);

  // Extract unique locations from items data and group them
  useEffect(() => {
    const locations = [
      ...new Set(
        items
          .map((item) => item.location)
          .filter((location) => location && location.trim() !== ""),
      ),
    ].sort();

    // Group locations by first part (e.g., Z1, Z2, OFFC, etc.)
    const groupedLocations = locations.reduce((groups, location) => {
      // Extract the prefix (everything before the first dash or the whole string if no dash)
      const prefix = location.includes("-") ? location.split("-")[0] : location;
      if (!groups[prefix]) {
        groups[prefix] = [];
      }
      groups[prefix].push(location);
      return groups;
    }, {});

    setUniqueLocations(groupedLocations);
  }, [items]);

  // Sort and filter items whenever items or sorting criteria change
  useEffect(() => {
    let filtered = [...items];

    // Apply sorting
    if (sortBy) {
      filtered.sort((a, b) => {
        switch (sortBy) {
          case "name-asc":
            return (a.item_name || "").localeCompare(b.item_name || "");
          case "name-desc":
            return (b.item_name || "").localeCompare(a.item_name || "");
          case "stock-high":
            return (Number(b.balance) || 0) - (Number(a.balance) || 0);
          case "stock-low":
            return (Number(a.balance) || 0) - (Number(b.balance) || 0);
          case "id-asc":
            return (Number(a.item_no) || 0) - (Number(b.item_no) || 0);
          case "id-desc":
            return (Number(b.item_no) || 0) - (Number(a.item_no) || 0);
          default:
            return 0;
        }
      });
    }

    setSortedItems(filtered);
  }, [items, sortBy]);

  const buildItemPayload = (base = {}, incoming = {}) => {
    const merged = { ...base, ...incoming };
    return {
      item_name: merged.item_name ?? "",
      brand: merged.brand ?? "",
      item_type: merged.item_type ?? "",
      location: merged.location ?? "",
      balance: Number(merged.balance) || 0,
      min_stock: Number(merged.min_stock) || 0,
      unit_of_measure: merged.unit_of_measure ?? "",
      price_per_unit: Number(merged.price_per_unit) || 0,
      supplier: merged.supplier ?? "",
      moq: Number(merged.moq) || 0,
    };
  };

  const getLatestItemsSnapshot = async () => {
    try {
      const latest = await apiService.items.getItems({ limit: 10000 });
      if (latest?.success && Array.isArray(latest.data)) {
        return latest.data;
      }
      return Array.isArray(items) ? items : [];
    } catch (_err) {
      return Array.isArray(items) ? items : [];
    }
  };

  const handleSaveItem = async (itemData) => {
    try {
      if (selectedItem) {
        await apiService.items.updateItem(
          selectedItem.item_no,
          buildItemPayload(selectedItem, itemData),
        );
      } else {
        const latestItems = await getLatestItemsSnapshot();
        const duplicateItem = findInventoryDuplicateItem(latestItems, itemData);

        if (duplicateItem) {
          await apiService.items.updateItem(
            duplicateItem.item_no,
            buildItemPayload(duplicateItem, itemData),
          );
          success(
            "Duplicate Detected",
            `Updated existing item #${duplicateItem.item_no} instead of creating a duplicate.`,
          );
        } else {
          await apiService.items.createItem(buildItemPayload({}, itemData));
        }
      }

      await fetchItems();
      setShowForm(false);
      setSelectedItem(null);
      resetFormData();

      if (returnToDetailView) {
        // Find the updated item to show in detail view
        const updatedItems = await apiService.items.getItems({ limit: 1000 });
        const updatedItem = updatedItems.data?.find(
          (item) => item.item_no === selectedItem.item_no,
        );
        if (updatedItem) {
          setShowItemDetail(true);
          setSelectedItemForDetail(updatedItem);
        }
        setReturnToDetailView(false);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteItem = async (itemNo) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Item",
      message: `Are you sure you want to permanently delete this item? This action cannot be undone.`,
      type: "danger",
      onConfirm: async () => {
        try {
          await apiService.items.deleteItem(itemNo);
          await fetchItems();
          success(
            "Item Deleted!",
            "The item has been permanently removed from inventory.",
          );
        } catch (err) {
          setError(err.message);
          showError("Delete Failed", err.message);
        }
      },
    });
  };

  const handleDeleteDuplicateItems = async (itemNos = []) => {
    if (!Array.isArray(itemNos) || itemNos.length === 0) {
      warning("No Selection", "Please select duplicate items to delete.");
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "Delete Selected Duplicates",
      message: `You are about to delete ${itemNos.length} selected duplicate item(s). This action cannot be undone.`,
      type: "danger",
      onConfirm: async () => {
        try {
          let deleted = 0;
          let failed = 0;

          for (const itemNo of itemNos) {
            try {
              await apiService.items.deleteItem(itemNo);
              deleted++;
            } catch (err) {
              console.error(`Failed to delete duplicate item ${itemNo}:`, err);
              failed++;
            }
          }

          await fetchItems();

          if (failed === 0) {
            success(
              "Duplicates Deleted",
              `Successfully deleted ${deleted} duplicate item(s).`,
            );
          } else {
            warning(
              "Partial Delete Complete",
              `Deleted ${deleted} item(s), ${failed} failed. Please retry failed entries.`,
            );
          }
        } catch (err) {
          showError("Delete Failed", err.message);
        }
      },
    });
  };

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setShowForm(true);
  };

  const resetFormData = () => {
    setSelectedImage(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Out Of Stock":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
      case "Low In Stock":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800";
      case "In Stock":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-slate-800 dark:border-gray-800";
    }
  };

  const formatCurrency = (amount) => {
    if (isNaN(amount)) return "-";
    return `₱${Number(amount).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleStockInsert = async () => {
    if (!selectedItem || stockInsertData.quantity <= 0) return;

    try {
      const result = await apiService.items.insertStock(
        selectedItem.item_no,
        stockInsertData,
      );

      setItems(
        items.map((item) =>
          item.item_no === selectedItem.item_no ? result.data : item,
        ),
      );
      setShowStockInsert(false);
      setSelectedItem(null);
      setStockInsertData({ quantity: 0, reason: "" });
      success(
        "Success!",
        `Stock inserted successfully! Added ${stockInsertData.quantity} units.`,
      );
    } catch (error) {
      console.error("Error inserting stock:", error);
      showError("Error!", error.message);
    }
  };

  const handleStockManagement = (item) => {
    setSelectedItem(item);
    setStockManagerData({
      stock_in: 0,
      stock_out: 0,
      reason: "",
      current_balance: item.balance || 0,
    });
    setShowStockManager(true);
  };

  const handleStockManagerSave = async () => {
    if (
      !selectedItem ||
      (!stockManagerData.stock_in && !stockManagerData.stock_out)
    )
      return;

    try {
      let result = null;

      // Handle stock in (addition)
      if (stockManagerData.stock_in > 0) {
        await apiService.items.insertStock(selectedItem.item_no, {
          quantity: stockManagerData.stock_in,
          reason:
            stockManagerData.reason || "Stock added via inventory management",
        });
      }

      // Handle stock out (removal)
      if (stockManagerData.stock_out > 0) {
        await apiService.items.recordItemOut(selectedItem.item_no, {
          quantity: stockManagerData.stock_out,
          notes:
            stockManagerData.reason || "Stock removed via inventory management",
          out_by: "Inventory Manager",
        });
      }

      // Refresh the items list
      await fetchItems();

      setShowStockManager(false);
      setSelectedItem(null);
      setStockManagerData({
        stock_in: 0,
        stock_out: 0,
        reason: "",
        current_balance: 0,
      });

      const changeText = [];
      if (stockManagerData.stock_in > 0)
        changeText.push(`+${stockManagerData.stock_in}`);
      if (stockManagerData.stock_out > 0)
        changeText.push(`-${stockManagerData.stock_out}`);

      success(
        "Success!",
        `Stock updated successfully! Changes: ${changeText.join(", ")} units`,
      );
    } catch (error) {
      console.error("Error updating stock:", error);
      showError("Error!", error.message);
    }
  };

  const exportBarcodesToExcel = async () => {
    if (items.length === 0) {
      warning("No Items", "No items available to export barcodes.");
      return;
    }

    try {
      let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>CODE-128 ITM Format Barcodes</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 0.3in;
          }
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 15px;
            background: white;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .barcode-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr 1fr;
            gap: 10px;
          }
          .barcode-item {
            border: 2px dashed #000;
            padding: 4px;
            text-align: center;
            break-inside: avoid;
            background: white;
            margin-bottom: 2px;
          }
          .barcode-svg {
            margin: 2px 0;
            background: white;
          }
          .item-name {
            font-size: 11px;
            font-weight: bold;
            margin: 2px 0;
            word-wrap: break-word;
            line-height: 1.2;
          }
          .item-details {
            font-size: 9px;
            color: #333;
            margin: 1px 0;
            line-height: 1.2;
          }
          .instructions {
            background: #fffacd;
            padding: 15px;
            margin: 20px 0;
            border-radius: 8px;
            border: 1px solid #ddd;
          }
          @media print {
            .no-print { display: none; }
            .barcode-item { 
              page-break-inside: avoid; 
              margin-bottom: 2px;
              padding: 3px;
            }
            body { 
              background: white !important;
              padding: 10px;
            }
            .barcode-grid {
              gap: 6px;
            }
          }
        </style>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jsbarcode/3.11.5/JsBarcode.all.min.js"></script>
      </head>
      <body>
        <div class="header no-print">
          <h1>CODE-128 ITM Format Barcodes</h1>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
          <p>Total Items: ${items.length}</p>
          <p><strong>Format:</strong> ITM001, ITM002, ITM003...</p>
          
          <div class="instructions">
            <h3>CODE-128 Scanner Setup Instructions:</h3>
            <ol style="text-align: left; max-width: 600px; margin: 0 auto;">
              <li><strong>Check Scanner Settings:</strong> Make sure CODE-128 is enabled on your scanner</li>
              <li><strong>Barcode Format:</strong> These barcodes use ITM prefix format (ITM001, ITM002, etc.)</li>
              <li><strong>Print Quality:</strong> Use high quality print settings (600 DPI minimum)</li>
              <li><strong>Paper:</strong> Use white paper with good contrast</li>
              <li><strong>Size:</strong> Don't resize - print at 100%</li>
              <li><strong>Lighting:</strong> Ensure good lighting when scanning</li>
              <li><strong>Distance:</strong> Hold scanner 4-8 inches from barcode</li>
            </ol>
          </div>
          
          <button onclick="window.print()" style="padding: 15px 30px; font-size: 18px; margin: 15px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">Print Barcodes</button>
        </div>
        
        <div class="barcode-grid">
    `;

      items.forEach((item, index) => {
        // Generate ITM format barcode ID (ITM + padded item_no)
        const paddedNo = item.item_no.toString().padStart(3, "0");
        const barcodeId = `ITM${paddedNo}`;

        htmlContent += `
        <div class="barcode-item">
          <svg id="barcode-${index}" class="barcode-svg"></svg>
          <div class="item-name">${item.item_name}</div>
          <div class="item-details"><strong>ROP:</strong> ${item.min_stock || 0}</div>
        </div>
      `;
      });

      htmlContent += `
        </div>
        <script>
          window.onload = function() {
            // Wait for JsBarcode to load
            setTimeout(function() {
    `;

      items.forEach((item, index) => {
        // Generate ITM format barcode ID (ITM + padded item_no)
        const paddedNo = item.item_no.toString().padStart(3, "0");
        const barcodeId = `ITM${paddedNo}`;

        htmlContent += `
              try {
                JsBarcode("#barcode-${index}", "${barcodeId}", {
                  format: "CODE128",
                  width: 1.5,
                  height: 30,
                  displayValue: true,
                  fontSize: 10,
                  margin: 2,
                  background: "#ffffff",
                  lineColor: "#000000",
                  textAlign: "center",
                  textPosition: "bottom",
                  textMargin: 2
                });
              } catch(e) {
                console.error("Error generating barcode for ${barcodeId}:", e);
                document.getElementById("barcode-${index}").innerHTML = 
                  '<div style="border:2px solid red; padding:20px; color:red;">Error generating barcode for ${barcodeId}</div>';
              }
      `;
      });

      htmlContent += `
            }, 500);
          };
        </script>
      </body>
      </html>
    `;

      // Create and download
      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `GOOJPRT_Compatible_Barcodes_${new Date().toISOString().split("T")[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      success(
        "GOOJPRT Compatible Barcodes Created!",
        "File downloaded successfully! Check the troubleshooting guide if needed.",
      );
    } catch (error) {
      console.error("Error creating barcodes:", error);
      showError(
        "Export Error!",
        "Failed to create barcode file. Please try again.",
      );
    }
  };

  // Import/Export handlers
  const handleExport = (format) => {
    try {
      if (format === "csv") {
        exportToCSV(
          items,
          `inventory_export_${new Date().toISOString().split("T")[0]}.csv`,
        );
      } else {
        exportToExcel(
          items,
          `inventory_export_${new Date().toISOString().split("T")[0]}.xlsx`,
        );
      }
      success(
        "Export Successful!",
        `Inventory exported as ${format.toUpperCase()}`,
      );
      setShowExportModal(false);
    } catch (error) {
      showError("Export Failed", error.message);
    }
  };

  const handleImportFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImportFile(file);
    setImportErrors([]);
    setImportPreview(null);

    try {
      setImportLoading(true);
      const fileExtension = file.name.split(".").pop().toLowerCase();

      let parseResult;
      if (fileExtension === "csv") {
        parseResult = await parseCSV(file);
      } else if (fileExtension === "xlsx" || fileExtension === "xls") {
        parseResult = await parseExcel(file);
      } else {
        throw new Error(
          "Unsupported file format. Please upload CSV or Excel file.",
        );
      }

      const { validItems, errors } = validateImportedItems(parseResult.items);

      setImportPreview(validItems);
      setImportErrors(errors);

      if (parseResult.errors && parseResult.errors.length > 0) {
        warning(
          "Parsing Warnings",
          `Some rows had issues: ${parseResult.errors.length} warnings`,
        );
      }
    } catch (error) {
      showError("Import Failed", error.message);
      setImportFile(null);
    } finally {
      setImportLoading(false);
    }
  };

  const handleImportConfirm = async () => {
    if (!importPreview || importPreview.length === 0) {
      showError("No Data", "No valid items to import");
      return;
    }

    const getConfirmationDetails = () => {
      switch (importMode) {
        case "replace":
          return {
            title: "Replace All Data?",
            message: `This will DELETE all existing ${items.length} items and replace them with ${importPreview.length} new items. This action CANNOT be undone!`,
            type: "danger",
          };
        case "update":
          return {
            title: "Update Existing Items?",
            message: `This will update existing items that match by Item Number or duplicate key (name + brand), and add ${importPreview.length} items as new if they don't exist.`,
            type: "warning",
          };
        default: // 'add'
          return {
            title: "Add Items?",
            message: `This will add ${importPreview.length} items, but duplicates (name + brand) will be UPDATED instead of creating duplicate records.`,
            type: "warning",
          };
      }
    };

    const confirmDetails = getConfirmationDetails();

    setConfirmModal({
      isOpen: true,
      ...confirmDetails,
      onConfirm: async () => {
        try {
          setImportLoading(true);

          let workingItems = await getLatestItemsSnapshot();
          let updatedCount = 0;
          let addedCount = 0;
          let failCount = 0;

          if (importMode === "replace") {
            // Delete all existing items first
            for (const item of items) {
              await apiService.items.deleteItem(item.item_no);
            }
            workingItems = [];
          }

          for (const importedItem of importPreview) {
            try {
              const existingById = importedItem.item_no
                ? workingItems.find(
                    (i) => Number(i.item_no) === Number(importedItem.item_no),
                  )
                : null;
              const existingByDuplicate = findInventoryDuplicateItem(
                workingItems,
                importedItem,
              );
              const existingItem = existingById || existingByDuplicate;

              if (existingItem) {
                const payload = buildItemPayload(existingItem, importedItem);
                const updateResult = await apiService.items.updateItem(
                  existingItem.item_no,
                  payload,
                );

                const updatedRecord = updateResult?.data || {
                  ...existingItem,
                  ...payload,
                  item_no: existingItem.item_no,
                };

                workingItems = workingItems.map((it) =>
                  Number(it.item_no) === Number(existingItem.item_no)
                    ? updatedRecord
                    : it,
                );
                updatedCount++;
              } else {
                const payload = buildItemPayload({}, importedItem);
                const createResult = await apiService.items.createItem(payload);
                const createdRecord = createResult?.data || payload;
                workingItems.push(createdRecord);
                addedCount++;
              }
            } catch (err) {
              console.error(
                `Failed to process imported item: ${importedItem.item_name}`,
                err,
              );
              failCount++;
            }
          }

          success(
            "Import Complete!",
            `Updated ${updatedCount} duplicate/existing item(s), added ${addedCount} new item(s)${failCount > 0 ? `, ${failCount} failed` : ""}`,
          );

          // Refresh the list
          await fetchItems();

          // Close modal and reset
          setShowImportModal(false);
          setImportFile(null);
          setImportPreview(null);
          setImportErrors([]);
        } catch (error) {
          showError("Import Failed", error.message);
        } finally {
          setImportLoading(false);
        }
      },
    });
  };

  const handleCancelImport = () => {
    setShowImportModal(false);
    setImportFile(null);
    setImportPreview(null);
    setImportErrors([]);
    setImportMode("add");
  };

  const activeFilterCount = [
    filters.search,
    filters.item_status,
    filters.location,
    sortBy,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <ProcurementPill color="blue">Workspace</ProcurementPill>
            <ProcurementPill color="slate">
              {sortedItems.length} Visible
            </ProcurementPill>
            {activeFilterCount > 0 && (
              <ProcurementPill color="amber">
                {activeFilterCount} Filters
              </ProcurementPill>
            )}
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            Inventory Management
          </h2>
          <p className="mt-1.5 text-sm font-medium text-zinc-500 dark:text-zinc-400 max-w-xl">
            Track stock levels, manage duplicate cleanup, and maintain
            procurement inventory records in real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowBulkCreator(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2.5 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm text-xs sm:text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            <span>Bulk Add Items</span>
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 px-3 py-2.5 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm text-xs sm:text-sm"
          >
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
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span>Import Data</span>
          </button>
                {/* Bulk Item Creator Modal */}
                <BulkItemCreator
                  isOpen={showBulkCreator}
                  onClose={() => setShowBulkCreator(false)}
                  onSubmit={handleBulkAddItems}
                />
          <button
            onClick={() => setShowExportModal(true)}
            className="bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-300 dark:border-zinc-700 px-3 py-2.5 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm text-xs sm:text-sm"
          >
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
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Export Data</span>
          </button>
          <button
            onClick={exportBarcodesToExcel}
            className="bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-300 dark:border-zinc-700 px-3 py-2.5 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm text-xs sm:text-sm"
          >
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
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Export Barcodes</span>
          </button>
          <button
            onClick={() => {
              setSelectedItem(null);
              setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2.5 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm text-xs sm:text-sm"
          >
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>Add New Item</span>
          </button>
        </div>
      </div>

      {/* ── Error State ──────────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-4 flex items-start gap-3 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-800 dark:text-red-300">
              System Error
            </p>
            <p className="text-sm text-red-600 dark:text-red-400 mt-0.5">
              {error}
            </p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ── Stat Cards ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ProcurementStatCard
          label="Total Items"
          value={statistics.server_total_items ?? statistics.total_items ?? 0}
          helper="Tracked in system"
          icon={
            <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          }
          color="blue"
        />
        <ProcurementStatCard
          label="In Stock"
          value={statistics.in_stock || 0}
          helper="Available items"
          icon={
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          }
          color="green"
        />
        <ProcurementStatCard
          label="Low Stock"
          value={statistics.low_stock || 0}
          helper="Needs restocking"
          icon={
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          }
          color="amber"
        />
        <ProcurementStatCard
          label="Out of Stock"
          value={statistics.out_of_stock || 0}
          helper="Urgent action needed"
          icon={<XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />}
          color="red"
        />
      </div>

      {/* ── Filter & Search Section ───────────────────────────────────────────── */}
      <ProcurementSectionCard
        title="Directory Controls"
        description="Search, filter, and organize your inventory layout."
        action={
          <button
            onClick={() => {
              setFilters({ search: "", item_status: "", location: "" });
              setSortBy("");
            }}
            className="text-sm px-4 py-2 rounded-xl font-semibold transition-colors bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-transparent dark:border-zinc-700"
          >
            Clear Filters
          </button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Search items by name, brand..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="w-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>

          {/* Sort By */}
          <div className="relative group">
            <ArrowUpDown className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-purple-500 transition-colors" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-zinc-900 dark:text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-sm"
            >
              <option value="">Sort Configuration</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="stock-high">Stock (High to Low)</option>
              <option value="stock-low">Stock (Low to High)</option>
              <option value="id-asc">ID (Oldest First)</option>
              <option value="id-desc">ID (Newest First)</option>
            </select>
          </div>

          {/* Status */}
          <div className="relative group">
            <Package className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
            <select
              value={filters.item_status}
              onChange={(e) =>
                setFilters({ ...filters, item_status: e.target.value })
              }
              className="w-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-zinc-900 dark:text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
            >
              <option value="">All Statuses</option>
              <option value="In Stock">In Stock</option>
              <option value="Low In Stock">Low Stock</option>
              <option value="Out Of Stock">Out of Stock</option>
            </select>
          </div>

          {/* Location */}
          <div className="relative group">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-orange-500 transition-colors" />
            <select
              value={filters.location}
              onChange={(e) =>
                setFilters({ ...filters, location: e.target.value })
              }
              className="w-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-zinc-900 dark:text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm"
            >
              <option value="">
                All Locations ({Object.values(uniqueLocations).flat().length})
              </option>
              {Object.entries(uniqueLocations).map(([group, locations]) => (
                <optgroup key={group} label={`${group} Zone`}>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>

        {/* Show active filters */}
        {(filters.search ||
          filters.item_status ||
          filters.location ||
          sortBy) && (
          <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <p className="text-sm text-gray-600 dark:text-zinc-400 mb-3 font-medium">
              Active filters & sorting:
            </p>
            <div className="flex flex-wrap gap-3">
              {filters.search && (
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-2 rounded-lg text-sm font-medium shadow-sm border border-blue-200 dark:border-blue-800">
                  Search: "{filters.search}"
                </span>
              )}
              {sortBy && (
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-3 py-2 rounded-lg text-sm font-medium shadow-sm border border-purple-200 dark:border-purple-800">
                  Sort:{" "}
                  {sortBy === "name-asc"
                    ? "Name (A-Z)"
                    : sortBy === "name-desc"
                      ? "Name (Z-A)"
                      : sortBy === "stock-high"
                        ? "Stock (High-Low)"
                        : sortBy === "stock-low"
                          ? "Stock (Low-High)"
                          : sortBy === "id-asc"
                            ? "ID (1-999)"
                            : sortBy === "id-desc"
                              ? "ID (999-1)"
                              : sortBy}
                </span>
              )}
              {filters.item_status && (
                <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-2 rounded-lg text-sm font-medium shadow-sm border border-green-200 dark:border-green-800">
                  Status: {filters.item_status}
                </span>
              )}
              {filters.location && (
                <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-3 py-2 rounded-lg text-sm font-medium shadow-sm border border-orange-200 dark:border-orange-800">
                  Location: {filters.location}
                </span>
              )}
            </div>
          </div>
        )}
      </ProcurementSectionCard>

      {/* Loading State */}
      {loading ? (
        <InventoryManagementSkeleton />
      ) : sortedItems.length === 0 ? (
        <ProcurementSectionCard className="p-12 text-center border-dashed">
          <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-zinc-200 dark:border-zinc-800">
            <Package className="w-8 h-8 text-zinc-400" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
            Inventory Empty
          </h3>
          <p className="text-sm font-medium text-zinc-500 max-w-sm mx-auto">
            Get started by adding your first item manually or importing a batch
            from a spreadsheet.
          </p>
        </ProcurementSectionCard>
      ) : (
        <>
          {/* View Toggles */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
            <div className="flex bg-zinc-100/80 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
              {[
                { id: "grid", icon: LayoutGrid, label: "Grid" },
                { id: "list", icon: List, label: "List" },
                { id: "duplicate", icon: CopyX, label: "Duplicates" },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    viewMode === mode.id
                      ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm"
                      : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
                  }`}
                >
                  <mode.icon className="w-4 h-4" />
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid View Implementation */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {sortedItems.slice(0, visibleCount).map((item) => {
                const bal = Number(item.balance) || 0;
                const min = Number(item.min_stock) || 0;

                let statusConfig = {
                  bg: "bg-emerald-500",
                  text: "text-emerald-700 dark:text-emerald-400",
                  badgeBg: "bg-emerald-50 dark:bg-emerald-500/10",
                  icon: CheckCircle2,
                  label: "In Stock",
                };
                if (bal === 0)
                  statusConfig = {
                    bg: "bg-red-500",
                    text: "text-red-700 dark:text-red-400",
                    badgeBg: "bg-red-50 dark:bg-red-500/10",
                    icon: XCircle,
                    label: "Out of Stock",
                  };
                else if (min > 0 && bal < min)
                  statusConfig = {
                    bg: "bg-amber-500",
                    text: "text-amber-700 dark:text-amber-400",
                    badgeBg: "bg-amber-50 dark:bg-amber-500/10",
                    icon: AlertTriangle,
                    label: "Low Stock",
                  };

                const StatusIcon = statusConfig.icon;

                return (
                  <div
                    key={item.item_no}
                    onClick={() => {
                      setSelectedItemForDetail(item);
                      setShowItemDetail(true);
                    }}
                    className="group flex flex-col bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer"
                  >
                    {/* Top Row: Title & Status */}
                    <div className="flex justify-between items-start gap-3 mb-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-zinc-900 dark:text-white text-base truncate">
                          {item.item_name}
                        </h4>
                        <p className="text-xs font-semibold text-zinc-500 truncate mt-0.5">
                          {item.brand || "Generic"}{" "}
                          <span className="mx-1 opacity-40">•</span> #
                          {item.item_no}
                        </p>
                      </div>
                      <div
                        className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusConfig.badgeBg} ${statusConfig.text}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </div>
                    </div>

                    {/* Data Well */}
                    <div className="bg-zinc-50 dark:bg-zinc-900/80 rounded-xl p-4 grid grid-cols-2 gap-y-3 gap-x-4 mb-5 flex-1 border border-zinc-100 dark:border-zinc-800/80">
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                          Balance
                        </span>
                        <span className="text-lg font-black text-zinc-900 dark:text-white">
                          {item.balance}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                          Min. Stock
                        </span>
                        <span className="text-lg font-black text-zinc-900 dark:text-white">
                          {item.min_stock}
                        </span>
                      </div>
                      <div className="col-span-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                          Price per unit
                        </span>
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          {formatCurrency(item.price_per_unit)}
                        </span>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStockManagement(item);
                        }}
                        className="flex-1 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 py-2 rounded-lg text-xs font-bold transition-colors"
                      >
                        Manage Stock
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteItem(item.item_no);
                        }}
                        className="w-10 flex items-center justify-center bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Load More */}
              {sortedItems.length > visibleCount && (
                <div className="col-span-full flex justify-center mt-4">
                  <button
                    onClick={() =>
                      setVisibleCount((c) =>
                        Math.min(c + 20, sortedItems.length),
                      )
                    }
                    className="flex items-center gap-2 px-6 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold rounded-xl transition-colors text-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Load More ({Math.min(20, sortedItems.length - visibleCount)}
                    )
                  </button>
                </div>
              )}
            </div>
          ) : viewMode === "list" ? (
            <InventoryListView
              items={sortedItems}
              visibleCount={visibleCount}
              setVisibleCount={setVisibleCount}
              onItemClick={(item) => {
                setSelectedItemForDetail(item);
                setShowItemDetail(true);
              }}
              onStockManagement={handleStockManagement}
              onDeleteItem={handleDeleteItem}
              formatCurrency={formatCurrency}
            />
          ) : viewMode === "duplicate" ? (
            <DuplicateCheckView
              items={sortedItems}
              onDeleteSelected={handleDeleteDuplicateItems}
              onItemClick={(item) => {
                setSelectedItemForDetail(item);
                setShowItemDetail(true);
              }}
              formatCurrency={formatCurrency}
            />
          ) : null}
        </>
      )}

      {/* Modals */}
      {showStockInsert && selectedItem && (
        <ModalPortal>
          <div
            className={`fixed inset-0 flex items-center justify-center p-4 z-50 ${isDarkMode ? "bg-black/50" : "bg-black/30"} backdrop-blur-sm`}
          >
            <div className="bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-xl shadow-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  Insert Stock - {selectedItem.item_name}
                </h3>
                <button
                  onClick={() => {
                    setShowStockInsert(false);
                    setSelectedItem(null);
                    setStockInsertData({ quantity: 0, reason: "" });
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-slate-800 dark:hover:text-gray-200"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-slate-800 mb-1">
                    Current Balance
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedItem.balance}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quantity to Add *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={stockInsertData.quantity}
                    onChange={(e) =>
                      setStockInsertData({
                        ...stockInsertData,
                        quantity: Number.parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 font-medium text-lg"
                    placeholder="Enter quantity"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reason (Optional)
                  </label>
                  <input
                    type="text"
                    value={stockInsertData.reason}
                    onChange={(e) =>
                      setStockInsertData({
                        ...stockInsertData,
                        reason: e.target.value,
                      })
                    }
                    className="w-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 font-medium"
                    placeholder="e.g., New shipment, Restocking"
                  />
                </div>

                {stockInsertData.quantity > 0 && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <p className="text-sm text-green-700 dark:text-green-300 mb-1">
                      New Balance Will Be
                    </p>
                    <p className="text-xl font-bold text-green-800 dark:text-green-200">
                      {selectedItem.balance + stockInsertData.quantity}{" "}
                      {selectedItem.unit_of_measure}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleStockInsert}
                  disabled={stockInsertData.quantity <= 0}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200"
                >
                  Insert Stock
                </button>
                <button
                  onClick={() => {
                    setShowStockInsert(false);
                    setSelectedItem(null);
                    setStockInsertData({ quantity: 0, reason: "" });
                  }}
                  className="px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* ── Wizards & Detail Views (Lazy Loaded / Intact) ─────────────────── */}
      <Suspense
        fallback={
          <ModalPortal>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <RefreshCw className="w-8 h-8 text-white animate-spin" />
            </div>
          </ModalPortal>
        }
      >
        <AddEditItemWizard
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setSelectedItem(null);
            resetFormData();
          }}
          onSave={handleSaveItem}
          selectedItem={selectedItem}
        />
      </Suspense>

      {/* Stock Manager Modal */}
      {showStockManager && selectedItem && (
        <ModalPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-md">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-6 w-full max-w-md border border-zinc-200 dark:border-zinc-800">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white">
                  Adjust Stock Level
                </h3>
                <button
                  onClick={() => setShowStockManager(false)}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 mb-6 border border-zinc-100 dark:border-zinc-700/50 flex justify-between items-center">
                <span className="text-sm font-bold text-zinc-500 uppercase tracking-wider">
                  Current Balance
                </span>
                <span className="text-2xl font-black text-zinc-900 dark:text-white">
                  {selectedItem.balance || 0}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                    <PackagePlus className="w-4 h-4 text-emerald-500" /> Stock
                    In
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stockManagerData.stock_in}
                    onChange={(e) =>
                      setStockManagerData({
                        ...stockManagerData,
                        stock_in: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 text-lg font-bold"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                    <PackageMinus className="w-4 h-4 text-red-500" /> Stock Out
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={selectedItem.balance || 0}
                    value={stockManagerData.stock_out}
                    onChange={(e) =>
                      setStockManagerData({
                        ...stockManagerData,
                        stock_out: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/20 text-lg font-bold"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                  Reason Log (Optional)
                </label>
                <input
                  type="text"
                  value={stockManagerData.reason}
                  onChange={(e) =>
                    setStockManagerData({
                      ...stockManagerData,
                      reason: e.target.value,
                    })
                  }
                  placeholder="e.g., Audit adjustment, Damaged goods..."
                  className="w-full bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                />
              </div>

              {stockManagerData.stock_out > (selectedItem.balance || 0) && (
                <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-bold p-3 rounded-lg mb-6 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Invalid: Exceeds current
                  balance.
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleStockManagerSave}
                  disabled={
                    (!stockManagerData.stock_in &&
                      !stockManagerData.stock_out) ||
                    stockManagerData.stock_out > (selectedItem.balance || 0)
                  }
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-800 text-white px-4 py-3 rounded-xl font-bold transition-colors disabled:cursor-not-allowed"
                >
                  Commit Changes
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Item Detail Modal */}
      {showItemDetail && selectedItemForDetail && (
        <ModalPortal>
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-md">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto overflow-x-hidden border border-zinc-200 dark:border-zinc-800">
              <ItemDetailView
                item={selectedItemForDetail}
                onBack={() => {
                  setShowItemDetail(false);
                  setSelectedItemForDetail(null);
                }}
                onEdit={(item) => {
                  setShowItemDetail(false);
                  setSelectedItemForDetail(null);
                  setReturnToDetailView(true);
                  handleEditItem(item);
                }}
              />
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />

      {/* Export Modal */}
      {showExportModal && (
        <ModalPortal>
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-md">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-6 w-full max-w-md border border-zinc-200 dark:border-zinc-800">
              <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white mb-2">
                Export Data
              </h3>
              <p className="text-sm font-medium text-zinc-500 mb-6">
                Select a format to export {items.length} records.
              </p>

              <div className="space-y-3 mb-6">
                <button
                  onClick={() => handleExport("csv")}
                  className="w-full group flex items-center justify-center gap-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white p-4 rounded-xl font-bold transition-colors"
                >
                  <FileDown className="w-5 h-5 text-emerald-500" /> Export as
                  CSV
                </button>
                <button
                  onClick={() => handleExport("excel")}
                  className="w-full group flex items-center justify-center gap-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white p-4 rounded-xl font-bold transition-colors"
                >
                  <FileSpreadsheet className="w-5 h-5 text-blue-500" /> Export
                  as Excel
                </button>
              </div>

              <button
                onClick={() => setShowExportModal(false)}
                className="w-full py-3 text-sm font-bold text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <ModalPortal>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[1000]">
            <div
              className={
                isDarkMode
                  ? "bg-gray-800 rounded-lg sm:rounded-xl lg:rounded-2xl shadow-2xl w-full max-w-4xl mx-2 sm:mx-4 max-h-[90vh] overflow-y-auto p-4 sm:p-6"
                  : "bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-2xl w-full max-w-4xl mx-2 sm:mx-4 max-h-[90vh] overflow-y-auto p-4 sm:p-6"
              }
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Import Inventory Data
              </h3>

              <div className="space-y-6">
                {/* Instructions */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    📋 Import Instructions
                  </h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                    <li>Upload a CSV or Excel file with your inventory data</li>
                    <li>
                      Required fields: Item Name, Balance, ROP (Min Stock),
                      Price Per Unit
                    </li>
                    <li>
                      Optional fields: Item Number, MOQ, Brand, Type, Supplier,
                      Location
                    </li>
                    <li>Download a template above to see the correct format</li>
                    <li>
                      Choose to <strong>add</strong>,{" "}
                      <strong>update existing</strong>, or{" "}
                      <strong>replace all</strong> items
                    </li>
                    <li>
                      <strong>Duplicate handling:</strong> if an imported row
                      matches an existing item by normalized{" "}
                      <strong>Item Name + Brand</strong>, the existing item will
                      be <strong>updated</strong> instead of creating a new
                      duplicate row.
                    </li>
                  </ul>
                </div>

                {/* Import Mode Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Import Mode
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setImportMode("add")}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        importMode === "add"
                          ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                          : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <div className="font-semibold">Add Items</div>
                      <div className="text-xs mt-1">
                        Add to existing inventory
                      </div>
                    </button>
                    <button
                      onClick={() => setImportMode("update")}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        importMode === "update"
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                          : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <div className="font-semibold">Update Existing</div>
                      <div className="text-xs mt-1">🔄 Update or add items</div>
                    </button>
                    <button
                      onClick={() => setImportMode("replace")}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        importMode === "replace"
                          ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                          : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <div className="font-semibold">Replace All</div>
                      <div className="text-xs mt-1">
                        ⚠️ Delete all & replace
                      </div>
                    </button>
                  </div>

                  {/* Mode Description */}
                  <div className="mt-3 text-sm text-gray-600 dark:text-slate-800 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    {importMode === "add" && (
                      <p>
                        ✅ Imported rows are added as new items, but detected
                        duplicates by <strong>Item Name + Brand</strong> will{" "}
                        <strong>update the existing item</strong> instead of
                        creating another row.
                      </p>
                    )}
                    {importMode === "update" && (
                      <p>
                        🔄 Items matching by <strong>Item Number</strong> or
                        duplicate key <strong>Item Name + Brand</strong> will be
                        updated. Non-matching items will be added as new.
                      </p>
                    )}
                    {importMode === "replace" && (
                      <p className="text-red-600 dark:text-red-400">
                        ⚠️ <strong>WARNING:</strong> All existing items will be
                        permanently deleted and replaced with imported data!
                      </p>
                    )}
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select File (CSV or Excel)
                  </label>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleImportFileChange}
                    className="w-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* Loading State */}
                {importLoading && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-slate-800">
                      Processing file...
                    </p>
                  </div>
                )}

                {/* Validation Errors */}
                {importErrors.length > 0 && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                      ⚠️ Validation Errors ({importErrors.length})
                    </h4>
                    <div className="max-h-40 overflow-y-auto space-y-2 text-sm">
                      {importErrors.slice(0, 10).map((error, index) => (
                        <div
                          key={index}
                          className="text-red-700 dark:text-red-300"
                        >
                          <strong>Row {error.row}:</strong> {error.item_name} -{" "}
                          {error.errors.join(", ")}
                        </div>
                      ))}
                      {importErrors.length > 10 && (
                        <div className="text-red-600 dark:text-red-400 font-medium">
                          ...and {importErrors.length - 10} more errors
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Preview */}
                {importPreview && importPreview.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Preview ({importPreview.length} valid items)
                    </h4>
                    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                          <tr>
                            <th className="px-4 py-2 text-left font-semibold text-gray-800 dark:text-gray-200">
                              Item Name
                            </th>
                            <th className="px-4 py-2 text-center font-semibold text-gray-800 dark:text-gray-200">
                              Balance
                            </th>
                            <th className="px-4 py-2 text-center font-semibold text-gray-800 dark:text-gray-200">
                              Min Stock
                            </th>
                            <th className="px-4 py-2 text-right font-semibold text-gray-800 dark:text-gray-200">
                              Price
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {importPreview.slice(0, 10).map((item, index) => (
                            <tr
                              key={index}
                              className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            >
                              <td className="px-4 py-2 text-gray-900 dark:text-white">
                                {item.item_name}
                              </td>
                              <td className="px-4 py-2 text-center text-gray-700 dark:text-gray-300">
                                {item.balance}
                              </td>
                              <td className="px-4 py-2 text-center text-gray-700 dark:text-gray-300">
                                {item.min_stock}
                              </td>
                              <td className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">
                                ₱{item.price_per_unit.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                          {importPreview.length > 10 && (
                            <tr>
                              <td
                                colSpan="4"
                                className="px-4 py-2 text-center text-gray-500 dark:text-slate-800 italic"
                              >
                                ...and {importPreview.length - 10} more items
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleImportConfirm}
                  disabled={
                    !importPreview ||
                    importPreview.length === 0 ||
                    importLoading
                  }
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 disabled:cursor-not-allowed"
                >
                  {importLoading
                    ? "Importing..."
                    : `Import ${importPreview?.length || 0} Items`}
                </button>
                <button
                  onClick={handleCancelImport}
                  disabled={importLoading}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}

export default InventoryManagement;
