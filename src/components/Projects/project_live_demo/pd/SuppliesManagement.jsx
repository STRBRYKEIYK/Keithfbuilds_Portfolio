import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { themeFor } from "../../utils/theme/themeClasses";
import apiService from "../../utils/api/api-service";
import { useToast } from "./shared/ToastNotification";
import { SupplierManagementSkeleton } from "../skeletons/ProcurementSkeletons";
import {
  Building2,
  Plus,
  Eye,
  Edit2,
  Trash2,
  FileDown,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  CreditCard,
  FileText,
  AlertTriangle,
  Package,
  TrendingDown,
  Info,
  CheckCircle2,
  XCircle,
} from "lucide-react";

function SupplierManagement() {
  const { isDarkMode } = useAuth();
  const t = themeFor(isDarkMode);
  const { error: showError, success: showSuccess } = useToast();

  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [supplierMetrics, setSupplierMetrics] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [wizardStep, setWizardStep] = useState(1);
  const [viewingSupplier, setViewingSupplier] = useState(null);
  const [supplierForm, setSupplierForm] = useState({
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    postal_code: "",
    website: "",
    tax_id: "",
    payment_terms: "",
    notes: "",
    status: "active",
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const fetchSuppliers = async () => {
    try {
      setInitialLoading(true);
      const result = await apiService.suppliers.getSuppliers();
      setSuppliers(result.suppliers || []);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      showError("Failed to fetch suppliers");
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchSupplierMetrics = async (supplierId) => {
    if (!supplierId) {
      setSupplierMetrics(null);
      return;
    }

    try {
      setLoading(true);
      const result = await apiService.suppliers.getSupplierMetrics(supplierId);
      setSupplierMetrics(result || null);
    } catch (error) {
      console.error("Error fetching supplier metrics:", error);
      setSupplierMetrics(null);
    } finally {
      setLoading(false);
    }
  };

  const downloadSupplierReport = async (supplier) => {
    if (!supplier) return;

    try {
      await apiService.items.exportAndDownloadSupplierReport(supplier.name);
      showSuccess("Report Downloaded", `Exported data for ${supplier.name}`);
    } catch (error) {
      console.error("Error downloading supplier report:", error);
      showError("Error!", "Failed to download supplier report");
    }
  };

  const resetSupplierForm = () => {
    setSupplierForm({
      name: "",
      contact_person: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "",
      postal_code: "",
      website: "",
      tax_id: "",
      payment_terms: "",
      notes: "",
      status: "active",
    });
  };

  const handleAddSupplier = () => {
    setEditingSupplier(null);
    resetSupplierForm();
    setWizardStep(1);
    setIsAddEditModalOpen(true);
  };

  const handleEditSupplier = (supplier) => {
    setEditingSupplier(supplier);
    setSupplierForm({
      name: supplier.name,
      contact_person: supplier.contact_person || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
      city: supplier.city || "",
      country: supplier.country || "",
      postal_code: supplier.postal_code || "",
      website: supplier.website || "",
      tax_id: supplier.tax_id || "",
      payment_terms: supplier.payment_terms || "",
      notes: supplier.notes || "",
      status: supplier.status || "active",
    });
    setWizardStep(1);
    setIsAddEditModalOpen(true);
  };

  const handleViewSupplier = (supplier) => {
    setViewingSupplier(supplier);
    setIsViewModalOpen(true);
  };

  const handleDeleteSupplier = (supplier) => {
    setEditingSupplier(supplier);
    setIsDeleteModalOpen(true);
  };

  const handleSaveSupplier = async () => {
    const validation = apiService.suppliers.validateSupplierData(supplierForm);
    if (!validation.isValid) {
      showError("Validation Error", validation.errors.join(", "));
      return;
    }

    try {
      setLoading(true);
      if (editingSupplier) {
        await apiService.suppliers.updateSupplier(
          editingSupplier.id,
          supplierForm,
        );
        showSuccess("Success!", "Supplier updated successfully");
      } else {
        await apiService.suppliers.createSupplier(supplierForm);
        showSuccess("Success!", "Supplier added successfully");
      }
      setIsAddEditModalOpen(false);
      fetchSuppliers();
    } catch (error) {
      console.error("Error saving supplier:", error);
      showError("Error!", error.message || "Failed to save supplier");
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteSupplier = async () => {
    try {
      setLoading(true);
      await apiService.suppliers.deleteSupplier(editingSupplier.id);
      showSuccess("Success!", "Supplier deleted successfully");
      setIsDeleteModalOpen(false);

      if (selectedSupplier?.id === editingSupplier.id) {
        setSelectedSupplier(null);
        setSupplierMetrics(null);
      }
      fetchSuppliers();
    } catch (error) {
      console.error("Error deleting supplier:", error);
      showError("Error!", error.message || "Failed to delete supplier");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <SupplierManagementSkeleton />;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* ─── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-zinc-900/40 p-6 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="text-xs font-bold tracking-widest uppercase text-zinc-400 dark:text-zinc-500">
              Procurement Directory
            </span>
            <div className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
              {suppliers.length} Registered
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            Supplier Management
          </h1>
          <p className="mt-1.5 text-sm font-medium text-zinc-500 dark:text-zinc-400 max-w-lg">
            Maintain vendor profiles, evaluate stock health, and generate
            detailed procurement reports.
          </p>
        </div>
        <button
          onClick={handleAddSupplier}
          className="group inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all shadow-md hover:shadow-lg active:scale-95"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          Add Supplier
        </button>
      </div>

      {/* ─── Supplier Selector & Controls ─────────────────────────────────────── */}
      <div className="bg-white dark:bg-zinc-900/80 rounded-2xl p-5 shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col xl:flex-row gap-4 items-center justify-between backdrop-blur-sm z-10 sticky top-0">
        <div className="w-full xl:w-1/3 relative group">
          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
          <select
            value={selectedSupplier?.id || ""}
            onChange={(e) => {
              const supplier = suppliers.find(
                (s) => s.id === parseInt(e.target.value),
              );
              setSelectedSupplier(supplier || null);
              fetchSupplierMetrics(supplier?.id);
            }}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-zinc-900 dark:text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            disabled={loading}
          >
            <option value="">Select a vendor profile...</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name} — {supplier.item_count} items tracked
              </option>
            ))}
          </select>
        </div>

        {selectedSupplier && (
          <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto justify-end">
            <button
              onClick={() => handleViewSupplier(selectedSupplier)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-bold border border-zinc-200 dark:border-zinc-700 transition-all shadow-sm"
              disabled={loading}
            >
              <Eye className="w-4 h-4" /> Full Profile
            </button>
            <button
              onClick={() => handleEditSupplier(selectedSupplier)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-bold border border-zinc-200 dark:border-zinc-700 transition-all shadow-sm"
              disabled={loading}
            >
              <Edit2 className="w-4 h-4" /> Edit
            </button>
            <button
              onClick={() => downloadSupplierReport(selectedSupplier)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-emerald-700 dark:text-emerald-400 text-sm font-bold border border-zinc-200 dark:border-zinc-700 transition-all shadow-sm"
              disabled={loading}
            >
              <FileDown className="w-4 h-4" /> Export
            </button>
            <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 hidden sm:block mx-1" />
            <button
              onClick={() => handleDeleteSupplier(selectedSupplier)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 text-sm font-bold border border-red-100 dark:border-red-500/20 transition-all shadow-sm"
              disabled={loading}
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        )}
      </div>

      {/* ─── Loading State ────────────────────────────────────────────────────── */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-zinc-200 border-t-blue-600 dark:border-zinc-800 dark:border-t-blue-500 rounded-full animate-spin mb-4" />
          <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
            Retrieving Vendor Data
          </p>
        </div>
      )}

      {/* ─── Empty State ──────────────────────────────────────────────────────── */}
      {!selectedSupplier && !loading && (
        <div className="bg-white dark:bg-zinc-900/50 rounded-3xl p-12 sm:p-20 shadow-sm border border-dashed border-zinc-300 dark:border-zinc-700 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 border border-zinc-100 dark:border-zinc-700">
            <Building2 className="w-10 h-10 text-zinc-400" />
          </div>
          <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-2">
            No Supplier Selected
          </h3>
          <p className="text-sm font-medium text-zinc-500 max-w-md">
            Choose a vendor from the dropdown menu to view their performance
            metrics, associated inventory, and contact details.
          </p>
        </div>
      )}

      {/* ─── Selected Supplier Dashboard ──────────────────────────────────────── */}
      {selectedSupplier && !loading && (
        <div className="space-y-6">
          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-800/80 rounded-2xl p-5 border border-zinc-200/60 dark:border-zinc-800 shadow-sm flex flex-col gap-1.5">
              <Package className="w-5 h-5 text-blue-500 mb-2" />
              <span className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                {supplierMetrics?.inventory_metrics?.total_items ??
                  selectedSupplier?.item_count ??
                  0}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Tracked Items
              </span>
            </div>

            <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-800/80 rounded-2xl p-5 border border-zinc-200/60 dark:border-zinc-800 shadow-sm flex flex-col gap-1.5">
              <TrendingDown className="w-5 h-5 text-red-500 mb-2" />
              <span className="text-2xl font-black text-red-600 dark:text-red-400 tracking-tight">
                {(supplierMetrics?.inventory_metrics?.low_stock_count ?? 0) +
                  (supplierMetrics?.inventory_metrics?.out_of_stock_count ??
                    0) || 0}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Low / Out of Stock
              </span>
            </div>

            <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-800/80 rounded-2xl p-5 border border-zinc-200/60 dark:border-zinc-800 shadow-sm flex flex-col gap-1.5">
              <CreditCard className="w-5 h-5 text-emerald-500 mb-2" />
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                {formatCurrency(
                  supplierMetrics?.inventory_metrics?.total_inventory_value ??
                    selectedSupplier?.total_inventory_value ??
                    0,
                )}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Inventory Value
              </span>
            </div>

            <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-800/80 rounded-2xl p-5 border border-zinc-200/60 dark:border-zinc-800 shadow-sm flex flex-col gap-1.5">
              <FileText className="w-5 h-5 text-purple-500 mb-2" />
              <span className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                {typeof supplierMetrics?.purchase_order_metrics
                  ?.recent_po_count === "number"
                  ? supplierMetrics.purchase_order_metrics.recent_po_count
                  : 0}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                PO's (Last 6 Mos)
              </span>
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-white dark:bg-zinc-900/90 backdrop-blur-sm border border-zinc-200/60 dark:border-zinc-800/80 rounded-3xl p-6 md:p-8 shadow-sm">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
              <Info className="w-5 h-5 text-zinc-400" />
              Vendor Profile Overview
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-zinc-500" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                    Primary Contact
                  </span>
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {selectedSupplier?.contact_person || "—"}
                  </span>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-zinc-500" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                    Email Address
                  </span>
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 break-all">
                    {selectedSupplier?.email || "—"}
                  </span>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-zinc-500" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                    Phone Number
                  </span>
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {selectedSupplier?.phone || "—"}
                  </span>
                </div>
              </div>

              <div className="flex gap-4 xl:col-span-2">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-zinc-500" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                    Physical Address
                  </span>
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {[
                      selectedSupplier?.address,
                      selectedSupplier?.city,
                      selectedSupplier?.country,
                      selectedSupplier?.postal_code,
                    ]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </span>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5 text-zinc-500" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                    Website
                  </span>
                  {selectedSupplier?.website ? (
                    <a
                      href={selectedSupplier.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline truncate"
                    >
                      {selectedSupplier.website}
                    </a>
                  ) : (
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      —
                    </span>
                  )}
                </div>
              </div>
            </div>

            {selectedSupplier?.notes && (
              <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800/80">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                  Internal Notes
                </span>
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                  {selectedSupplier.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Modals ───────────────────────────────────────────────────────────── */}

      {/* Add / Edit Wizard Modal */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-md">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-6 md:p-8 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 shrink-0">
              <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-6">
                {editingSupplier
                  ? "Edit Supplier Profile"
                  : "Register New Supplier"}
              </h3>

              {/* Progress Bar */}
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex-1 flex flex-col gap-2">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${wizardStep >= step ? "bg-blue-600" : "bg-zinc-200 dark:bg-zinc-800"}`}
                    />
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${wizardStep >= step ? "text-blue-600 dark:text-blue-400" : "text-zinc-400"}`}
                    >
                      {step === 1
                        ? "Details"
                        : step === 2
                          ? "Location"
                          : "Review"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
              <div className="space-y-5">
                {wizardStep === 1 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                        Company Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={supplierForm.name}
                        onChange={(e) =>
                          setSupplierForm({
                            ...supplierForm,
                            name: e.target.value,
                          })
                        }
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                        placeholder="e.g. Acme Corp"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                        Primary Contact
                      </label>
                      <input
                        type="text"
                        value={supplierForm.contact_person}
                        onChange={(e) =>
                          setSupplierForm({
                            ...supplierForm,
                            contact_person: e.target.value,
                          })
                        }
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                        placeholder="Full name"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={supplierForm.email}
                          onChange={(e) =>
                            setSupplierForm({
                              ...supplierForm,
                              email: e.target.value,
                            })
                          }
                          className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                          placeholder="contact@company.com"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={supplierForm.phone}
                          onChange={(e) =>
                            setSupplierForm({
                              ...supplierForm,
                              phone: e.target.value,
                            })
                          }
                          className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                          placeholder="+63 900 000 0000"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {wizardStep === 2 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                        Street Address
                      </label>
                      <input
                        type="text"
                        value={supplierForm.address}
                        onChange={(e) =>
                          setSupplierForm({
                            ...supplierForm,
                            address: e.target.value,
                          })
                        }
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                        placeholder="Unit, Building, Street"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          value={supplierForm.city}
                          onChange={(e) =>
                            setSupplierForm({
                              ...supplierForm,
                              city: e.target.value,
                            })
                          }
                          className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                          Country
                        </label>
                        <input
                          type="text"
                          value={supplierForm.country}
                          onChange={(e) =>
                            setSupplierForm({
                              ...supplierForm,
                              country: e.target.value,
                            })
                          }
                          className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                          placeholder="Country"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          value={supplierForm.postal_code}
                          onChange={(e) =>
                            setSupplierForm({
                              ...supplierForm,
                              postal_code: e.target.value,
                            })
                          }
                          className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                          placeholder="ZIP / Postal Code"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                          Vendor Status
                        </label>
                        <select
                          value={supplierForm.status}
                          onChange={(e) =>
                            setSupplierForm({
                              ...supplierForm,
                              status: e.target.value,
                            })
                          }
                          className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm appearance-none"
                        >
                          <option value="active">Active Vendor</option>
                          <option value="inactive">Inactive</option>
                          <option value="suspended">Suspended</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                          Website
                        </label>
                        <input
                          type="url"
                          value={supplierForm.website}
                          onChange={(e) =>
                            setSupplierForm({
                              ...supplierForm,
                              website: e.target.value,
                            })
                          }
                          className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                          placeholder="https://..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                          Payment Terms
                        </label>
                        <select
                          value={supplierForm.payment_terms}
                          onChange={(e) =>
                            setSupplierForm({
                              ...supplierForm,
                              payment_terms: e.target.value,
                            })
                          }
                          className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm appearance-none"
                        >
                          <option value="">Select Terms...</option>
                          <option value="Net 15">Net 15</option>
                          <option value="Net 30">Net 30</option>
                          <option value="Net 45">Net 45</option>
                          <option value="Net 60">Net 60</option>
                          <option value="Cash on Delivery">
                            Cash on Delivery
                          </option>
                          <option value="Prepayment">Prepayment</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {wizardStep === 3 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                        Internal Notes
                      </label>
                      <textarea
                        value={supplierForm.notes}
                        onChange={(e) =>
                          setSupplierForm({
                            ...supplierForm,
                            notes: e.target.value,
                          })
                        }
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm min-h-[100px] custom-scrollbar"
                        placeholder="Log any special arrangements or notes here..."
                      />
                    </div>

                    <div className="bg-zinc-50 dark:bg-zinc-800/50 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />{" "}
                        Confirm Details
                      </h4>
                      <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                        <div>
                          <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-0.5">
                            Name
                          </span>
                          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                            {supplierForm.name || "—"}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-0.5">
                            Contact
                          </span>
                          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                            {supplierForm.contact_person || "—"}
                          </span>
                        </div>
                        <div className="col-span-2 pt-2 border-t border-zinc-200 dark:border-zinc-700/50">
                          <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-0.5">
                            Location
                          </span>
                          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                            {[
                              supplierForm.address,
                              supplierForm.city,
                              supplierForm.country,
                            ]
                              .filter(Boolean)
                              .join(", ") || "—"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 md:p-8 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 flex gap-3 shrink-0">
              <button
                onClick={() => {
                  setIsAddEditModalOpen(false);
                  setEditingSupplier(null);
                }}
                className="px-6 py-3 rounded-xl font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>

              <div className="flex-1" />

              {wizardStep > 1 && (
                <button
                  onClick={() => setWizardStep((w) => Math.max(1, w - 1))}
                  className="px-6 py-3 rounded-xl font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                >
                  Back
                </button>
              )}

              {wizardStep < 3 ? (
                <button
                  onClick={() => {
                    if (wizardStep === 1) {
                      if (!supplierForm.name?.trim()) {
                        showError(
                          "Validation Error",
                          "Supplier name is required",
                        );
                        return;
                      }
                    }
                    setWizardStep((w) => Math.min(3, w + 1));
                  }}
                  className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-sm active:scale-95"
                >
                  Next Step
                </button>
              ) : (
                <button
                  onClick={async () => {
                    await handleSaveSupplier();
                    setWizardStep(1);
                  }}
                  className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-sm active:scale-95"
                >
                  {editingSupplier ? "Save Changes" : "Complete Registration"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-md">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-2">
              Delete Supplier?
            </h3>
            <p className="text-sm font-medium text-zinc-500 mb-8">
              This will permanently remove{" "}
              <strong className="text-zinc-900 dark:text-zinc-100">
                {editingSupplier?.name}
              </strong>{" "}
              from the database. This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setEditingSupplier(null);
                }}
                className="flex-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white py-3 rounded-xl font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteSupplier}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold transition-colors shadow-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Supplier Modal (Kept simple as per request, but standardized to fit aesthetic) */}
      {isViewModalOpen && viewingSupplier && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-md">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-6 md:p-8 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white">
                  {viewingSupplier.name}
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mt-2 bg-zinc-200/50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {viewingSupplier.status === "active" ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <XCircle className="w-3 h-3 text-zinc-400" />
                  )}
                  {viewingSupplier.status === "active"
                    ? "Active Vendor"
                    : "Inactive"}
                </span>
              </div>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                    Contact Person
                  </span>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white">
                    {viewingSupplier.contact_person || "—"}
                  </p>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                    Email Address
                  </span>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white break-all">
                    {viewingSupplier.email || "—"}
                  </p>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                    Phone Number
                  </span>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white">
                    {viewingSupplier.phone || "—"}
                  </p>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                    Website
                  </span>
                  {viewingSupplier.website ? (
                    <a
                      href={viewingSupplier.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {viewingSupplier.website}
                    </a>
                  ) : (
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">
                      —
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                    Physical Address
                  </span>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white">
                    {[
                      viewingSupplier.address,
                      viewingSupplier.city,
                      viewingSupplier.country,
                      viewingSupplier.postal_code,
                    ]
                      .filter(Boolean)
                      .join(", ") || "No address provided"}
                  </p>
                </div>
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                    Items Tracked
                  </span>
                  <p className="text-lg font-black text-blue-600 dark:text-blue-400">
                    {viewingSupplier.item_count}
                  </p>
                </div>
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                    Inventory Value
                  </span>
                  <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    ₱
                    {viewingSupplier.total_inventory_value?.toLocaleString() ||
                      "0"}
                  </p>
                </div>
                {viewingSupplier.notes && (
                  <div className="md:col-span-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                      Notes
                    </span>
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                      {viewingSupplier.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 md:p-8 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-6 py-3 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold transition-all"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleEditSupplier(viewingSupplier);
                }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-sm"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SupplierManagement;
