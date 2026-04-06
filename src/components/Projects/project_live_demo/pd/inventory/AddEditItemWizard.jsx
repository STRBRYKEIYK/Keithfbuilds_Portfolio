import { useEffect, useState } from "react";
import ModalPortal from "../shared/ModalPortal";
import apiService, { items as itemsService } from "../../../utils/api/api-service.js";
import {
  Package, DollarSign, MapPin, CheckCircle2, ChevronRight, ChevronLeft,
  Eye, Upload, Trash2, RefreshCw, AlertTriangle, Info, Image as ImageIcon,
  Check, X, Loader2, CheckCheck,
} from "lucide-react";

// ─── Combobox (logic unchanged) ───────────────────────────────────────────────
function Combobox({ value, onChange, options, placeholder, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [debounceTimer, setDebounceTimer] = useState(null);

  const computeFiltered = (text, opts) => {
    const term = (text || "").trim().toLowerCase();
    if (!term) return opts;
    const base = opts.filter((o) => o !== "─────────");
    const ranked = base.map((opt) => {
      const lower = opt.toLowerCase();
      const starts = lower.startsWith(term);
      const contains = !starts && lower.includes(term);
      const score = starts ? 0 : contains ? 1 : 2;
      return { opt, score };
    }).filter((x) => x.score !== 2).sort((a, b) => a.score - b.score || a.opt.localeCompare(b.opt)).map((x) => x.opt);
    if ("+ Add New Supplier".toLowerCase().includes(term) || ranked.length === 0) ranked.push("+ Add New Supplier");
    return ranked;
  };

  useEffect(() => { setInputValue(value || ""); }, [value]);
  useEffect(() => { setFilteredOptions(computeFiltered(inputValue, options)); }, [options, inputValue]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);
    if (debounceTimer) clearTimeout(debounceTimer);
    const t = setTimeout(() => {
      onChange(newValue);
      const newFiltered = computeFiltered(newValue, options);
      setFilteredOptions(newFiltered);
      const firstValid = newFiltered.findIndex((o) => o !== "─────────" && o !== "+ Add New Supplier");
      setHighlightedIndex(firstValid >= 0 ? firstValid : -1);
    }, 180);
    setDebounceTimer(t);
  };

  const handleOptionSelect = (option) => {
    if (option === "─────────" || option === "+ Add New Supplier") {
      if (option === "+ Add New Supplier") onChange("__add_custom");
      setIsOpen(false); setHighlightedIndex(-1); return;
    }
    setInputValue(option); onChange(option); setIsOpen(false); setHighlightedIndex(-1);
  };

  const handleFocus = () => {
    setIsOpen(true);
    const f = computeFiltered(inputValue, options);
    setFilteredOptions(f);
    const first = f.findIndex((o) => o !== "─────────" && o !== "+ Add New Supplier");
    setHighlightedIndex(first >= 0 ? first : -1);
  };

  const handleBlur = () => { setTimeout(() => { setIsOpen(false); setHighlightedIndex(-1); }, 150); };

  const handleKeyDown = (e) => {
    if (!isOpen || !filteredOptions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => { let n = prev + 1; while (n < filteredOptions.length && (filteredOptions[n] === "─────────" || filteredOptions[n] === "+ Add New Supplier")) n++; return n < filteredOptions.length ? n : prev; });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => { let n = prev - 1; while (n >= 0 && (filteredOptions[n] === "─────────" || filteredOptions[n] === "+ Add New Supplier")) n--; return n >= 0 ? n : prev; });
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) handleOptionSelect(filteredOptions[highlightedIndex]);
    } else if (e.key === "Escape") { setIsOpen(false); setHighlightedIndex(-1); }
  };

  return (
    <div className="relative">
      <input
        type="text" value={inputValue} onChange={handleInputChange} onFocus={handleFocus}
        onBlur={handleBlur} onKeyDown={handleKeyDown} placeholder={placeholder}
        className={`w-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl px-3 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${className}`}
      />
      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-xl max-h-48 overflow-y-auto">
          {filteredOptions.slice(0, 8).map((option, index) => (
            <div key={index} onClick={() => handleOptionSelect(option)}
              className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                option === "─────────"
                  ? "cursor-default bg-zinc-50 dark:bg-zinc-800 text-zinc-400 select-none text-[10px] font-bold uppercase tracking-wider"
                  : option === "+ Add New Supplier"
                  ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 font-semibold"
                  : index === highlightedIndex
                  ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300"
                  : "text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              }`}
            >{option}</div>
          ))}
          {filteredOptions.length > 8 && (
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 text-center border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
              +{filteredOptions.length - 8} more
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── field wrapper ────────────────────────────────────────────────────────────
function Field({ label, required, error, hint, children }) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{error}</p>}
      {hint && !error && <p className="text-[11px] text-zinc-400 mt-1">{hint}</p>}
    </div>
  );
}

// ─── main wizard ──────────────────────────────────────────────────────────────
function AddEditItemWizard({ isOpen, onClose, onSave, selectedItem = null }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});

  const [wizardData, setWizardData] = useState({
    item_name: "", brand: "", item_type: "", supplier: "", supplier_id: null, custom_supplier: "",
    balance: 0, min_stock: 0, moq: 0, unit_of_measure: "", price_per_unit: 0,
    location: "", item_status: "In Stock",
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [existingImages, setExistingImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadQueue, setUploadQueue] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(new Set());
  const [suppliersList, setSuppliersList] = useState([]);
  const [filterOptions, setFilterOptions] = useState({ brands: [], item_types: [], unit_of_measures: [], locations: [] });

  const steps = [
    { number: 1, title: "Basic Info",     Icon: Package },
    { number: 2, title: "Stock & Price",  Icon: DollarSign },
    { number: 3, title: "Location",       Icon: MapPin },
    { number: 4, title: "Review",         Icon: CheckCircle2 },
  ];

  // ── load data (LOGIC UNCHANGED) ────────────────────────────────────────────
  useEffect(() => {
    if (isOpen && selectedItem) {
      setWizardData({
        item_name: selectedItem?.item_name || "", brand: selectedItem?.brand || "",
        item_type: selectedItem?.item_type || "", supplier: selectedItem?.supplier || "",
        supplier_id: selectedItem?.supplier_id || null, custom_supplier: "",
        balance: selectedItem?.balance || 0, min_stock: selectedItem?.min_stock || 0,
        moq: selectedItem?.moq || 0, unit_of_measure: selectedItem?.unit_of_measure || "",
        price_per_unit: selectedItem?.price_per_unit || 0, location: selectedItem?.location || "",
        item_status: selectedItem?.item_status || "In Stock",
      });
      if (selectedItem?.item_no) {
        (async () => {
          try {
            const res = await itemsService.getItemImages(selectedItem.item_no);
            const list = (res?.data || []).map((img) => ({ ...img, url: `${itemsService.getItemImageUrl(selectedItem.item_no, img.filename)}?t=${Date.now()}` }));
            setExistingImages(list);
            setCurrentImageUrl(`${itemsService.getItemLatestImageUrl(selectedItem.item_no)}?t=${Date.now()}`);
          } catch {
            setExistingImages([]);
            setCurrentImageUrl(`${itemsService.getItemLatestImageUrl(selectedItem.item_no)}?t=${Date.now()}`);
          }
        })();
      }
    }
  }, [isOpen, selectedItem]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try { const opts = await apiService.suppliers.getSuppliersForSelect(); if (mounted) setSuppliersList(opts || []); } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await itemsService.getFilterOptions();
        if (mounted && res.success) setFilterOptions(res.data || { brands: [], item_types: [], unit_of_measures: [], locations: [] });
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (selectedItem?.item_no && uploadQueue.length > 0) {
      uploadQueue.forEach((item, index) => { if (!item.error && !uploadingImages.has(index)) autoUploadImage(item.file, index); });
    }
  }, [uploadQueue, selectedItem?.item_no]);

  const canProceedFromStep1 = (wizardData.item_name || "").trim().length > 0;
  const canProceedFromStep2 = (Number(wizardData.balance) || 0) >= 0 && (Number(wizardData.min_stock) || 0) >= 0 && (Number(wizardData.price_per_unit) || 0) >= 0;

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1 && !wizardData.item_name.trim()) newErrors.item_name = "Item name is required";
    if (step === 2) {
      if (wizardData.balance < 0) newErrors.balance = "Balance cannot be negative";
      if (wizardData.min_stock < 0) newErrors.min_stock = "Minimum stock cannot be negative";
      if (wizardData.price_per_unit < 0) newErrors.price_per_unit = "Price cannot be negative";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => { if (validateStep(currentStep)) { setCurrentStep(currentStep + 1); setErrors({}); } };
  const handlePrevious = () => { setCurrentStep(currentStep - 1); setErrors({}); };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      const payload = { ...wizardData };
      if (wizardData.supplier_id === "__custom") payload.supplier = (wizardData.custom_supplier || "").trim();
      else if (wizardData.supplier_id) { const found = suppliersList.find((s) => s.id === wizardData.supplier_id); payload.supplier = found?.label || wizardData.supplier || ""; }
      else payload.supplier = (wizardData.supplier || "").trim();
      delete payload.supplier_id; delete payload.custom_supplier;
      onSave(payload); handleClose();
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setWizardData({ item_name: "", brand: "", item_type: "", supplier: "", balance: 0, min_stock: 0, moq: 0, unit_of_measure: "", price_per_unit: 0, location: "", item_status: "In Stock" });
    setErrors({}); setSelectedImage(null); setPreviewUrl(""); setCurrentImageUrl(""); setExistingImages([]); setUploadError("");
    uploadQueue.forEach((item) => { if (item.previewUrl) URL.revokeObjectURL(item.previewUrl); });
    setUploadQueue([]); setUploadingImages(new Set()); onClose();
  };

  const handleImageUpload = async (replace = false) => {
    if (!selectedImage || !selectedItem?.item_no) return;
    try {
      setUploading(true);
      if (replace) await itemsService.replaceItemImage(selectedItem.item_no, selectedImage);
      else await itemsService.uploadItemImage(selectedItem.item_no, selectedImage);
      setCurrentImageUrl(`${itemsService.getItemLatestImageUrl(selectedItem.item_no)}?t=${Date.now()}`);
      const fres = await itemsService.getItemImages(selectedItem.item_no);
      setExistingImages((fres?.data || []).map((img) => ({ ...img, url: `${itemsService.getItemImageUrl(selectedItem.item_no, img.filename)}?t=${Date.now()}` })));
      setSelectedImage(null); setPreviewUrl(""); setUploadError("");
    } catch (e) { setUploadError(e.message || "Upload failed"); } finally { setUploading(false); }
  };

  const autoUploadImage = async (file, index) => {
    if (!selectedItem?.item_no) return;
    try {
      setUploadingImages((prev) => new Set(prev).add(index));
      await itemsService.uploadItemImage(selectedItem.item_no, file);
      const fres = await itemsService.getItemImages(selectedItem.item_no);
      setExistingImages((fres?.data || []).map((img) => ({ ...img, url: `${itemsService.getItemImageUrl(selectedItem.item_no, img.filename)}?t=${Date.now()}` })));
      setUploadQueue((prev) => prev.filter((_, i) => i !== index));
      setUploadingImages((prev) => { const s = new Set(prev); s.delete(index); return s; });
    } catch (e) {
      setUploadQueue((prev) => prev.map((item, i) => i === index ? { ...item, error: e.message } : item));
      setUploadingImages((prev) => { const s = new Set(prev); s.delete(index); return s; });
    }
  };

  const handleFileSelect = (files) => {
    setUploadError("");
    Array.from(files).forEach((file) => {
      const allowed = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/bmp"];
      if (!allowed.includes(file.type)) { setUploadError("Invalid file type. Use JPG, PNG, GIF, WEBP, or BMP."); return; }
      if (file.size > 10 * 1024 * 1024) { setUploadError("File too large (max 10MB)."); return; }
      setUploadQueue((prev) => [...prev, { file, previewUrl: URL.createObjectURL(file), name: file.name, size: file.size, error: null }]);
    });
  };

  const removeQueuedImage = (index) => {
    setUploadQueue((prev) => { const q = [...prev]; const removed = q.splice(index, 1)[0]; if (removed.previewUrl) URL.revokeObjectURL(removed.previewUrl); return q; });
  };

  const retryUpload = (index) => {
    const item = uploadQueue[index];
    if (item) { setUploadQueue((prev) => prev.map((q, i) => i === index ? { ...q, error: null } : q)); autoUploadImage(item.file, index); }
  };

  const handleImageDelete = async (filename) => {
    if (!selectedItem?.item_no) return;
    try {
      await itemsService.deleteItemImage(selectedItem.item_no, filename);
      const fres = await itemsService.getItemImages(selectedItem.item_no);
      setExistingImages((fres?.data || []).map((img) => ({ ...img, url: `${itemsService.getItemImageUrl(selectedItem.item_no, img.filename)}?t=${Date.now()}` })));
      setCurrentImageUrl(`${itemsService.getItemLatestImageUrl(selectedItem.item_no)}?t=${Date.now()}`);
    } catch (e) { console.error("Failed to delete image:", e); }
  };

  const canJumpToStep = (targetStep) => {
    if (targetStep <= currentStep) return true;
    if (targetStep === 2 && canProceedFromStep1) return true;
    if (targetStep === 3) return canProceedFromStep1 && canProceedFromStep2;
    if (targetStep === 4) return canProceedFromStep1 && canProceedFromStep2;
    return false;
  };

  // ── stock status helper ───────────────────────────────────────────────────
  const stockStatus = wizardData.balance === 0 ? "out"
    : wizardData.balance < wizardData.min_stock ? "low" : "good";

  const stockStatusClass = {
    out:  "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400",
    low:  "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400",
    good: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400",
  }[stockStatus];

  const stockStatusLabel = { out: "Out of Stock", low: "Low Stock Alert", good: "Stock Level Good" }[stockStatus];

  if (!isOpen) return null;

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-2 sm:p-4 backdrop-blur-md bg-zinc-900/40 dark:bg-black/60">
        <div className="w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">

          {/* ── Modal header / step bar ── */}
          <div className="px-6 pt-5 pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-lg text-zinc-900 dark:text-white leading-tight">
                  {selectedItem ? "Edit Item" : "Add New Item"}
                </h2>
                <p className="text-[11px] text-zinc-500 mt-0.5">Step {currentStep} of {steps.length}</p>
              </div>
              <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 active:scale-95 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step pills */}
            <div className="flex items-center">
              {steps.map((step, idx) => {
                const { Icon } = step;
                const done = currentStep > step.number;
                const active = currentStep === step.number;
                return (
                  <div key={step.number} className="flex items-center flex-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (!canJumpToStep(step.number)) { setErrors((p) => ({ ...p, global: "Complete required fields first." })); return; }
                        setErrors({}); setCurrentStep(step.number);
                      }}
                      className={`flex items-center gap-2 shrink-0 transition-all active:scale-95 ${active ? "opacity-100" : "opacity-60 hover:opacity-80"}`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${done ? "bg-emerald-500 text-white" : active ? "bg-blue-600 text-white shadow-sm" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"}`}>
                        {done ? <Check className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                      </div>
                      <span className={`hidden sm:block text-xs font-semibold ${active ? "text-zinc-900 dark:text-white" : "text-zinc-400"}`}>{step.title}</span>
                    </button>
                    {idx < steps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 rounded-full ${done ? "bg-emerald-400" : "bg-zinc-100 dark:bg-zinc-800"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Scrollable body ── */}
          <div className="overflow-y-auto flex-1 p-6 bg-zinc-50 dark:bg-zinc-950/40">

            {/* ── Step 1: Basic Info ── */}
            {currentStep === 1 && (
              <div className="max-w-2xl mx-auto space-y-5">
                <div className="text-center mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-base text-zinc-900 dark:text-white">Basic Information</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Essential details about this item</p>
                </div>

                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5 space-y-4">
                  <Field label="Item Name" required error={errors.item_name}>
                    <input
                      type="text" value={wizardData.item_name}
                      onChange={(e) => setWizardData({ ...wizardData, item_name: e.target.value })}
                      placeholder="Enter the item name"
                      className={`w-full border ${errors.item_name ? "border-red-400 focus:ring-red-400" : "border-zinc-200 dark:border-zinc-700 focus:ring-blue-500"} bg-zinc-50 dark:bg-zinc-800/60 rounded-xl px-3 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 transition-all`}
                    />
                  </Field>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Brand">
                      <Combobox value={wizardData.brand} onChange={(v) => setWizardData({ ...wizardData, brand: v })} options={filterOptions.brands} placeholder="e.g., Samsung, Nike" />
                    </Field>
                    <Field label="Item Type">
                      <Combobox value={wizardData.item_type} onChange={(v) => setWizardData({ ...wizardData, item_type: v })} options={filterOptions.item_types} placeholder="e.g., Electronics, Tools" />
                    </Field>
                  </div>

                  <Field label="Supplier" hint={wizardData.supplier_id === "__custom" ? "Custom supplier will be saved with the item" : undefined}>
                    <Combobox
                      value={wizardData.supplier_id === "__custom" ? wizardData.custom_supplier || "" : wizardData.supplier || ""}
                      onChange={(value) => {
                        if (value === "__add_custom") { setWizardData({ ...wizardData, supplier_id: "__custom", custom_supplier: "", supplier: "" }); }
                        else {
                          const existing = suppliersList.find((s) => s.label === value);
                          if (existing) setWizardData({ ...wizardData, supplier_id: existing.id, supplier: existing.label, custom_supplier: "" });
                          else setWizardData({ ...wizardData, supplier: value, custom_supplier: value, supplier_id: "__custom" });
                        }
                      }}
                      options={[...suppliersList.map((s) => s.label), "─────────", "+ Add New Supplier"]}
                      placeholder="Select or type supplier"
                    />
                  </Field>

                  {/* Quick preview */}
                  {wizardData.item_name && (
                    <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                      <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-0.5">Preview</p>
                        <p className="text-xs text-blue-800 dark:text-blue-300">
                          <strong>{wizardData.item_name}</strong>
                          {wizardData.brand && ` · ${wizardData.brand}`}
                          {wizardData.item_type && ` · ${wizardData.item_type}`}
                          {wizardData.supplier && ` · ${wizardData.supplier}`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Step 2: Stock & Price ── */}
            {currentStep === 2 && (
              <div className="max-w-2xl mx-auto space-y-5">
                <div className="text-center mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-base text-zinc-900 dark:text-white">Stock & Pricing</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Set inventory levels and pricing information</p>
                </div>

                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {!selectedItem ? (
                      <Field label="Initial Balance" required error={errors.balance}>
                        <input type="number" min="0" value={wizardData.balance}
                          onChange={(e) => setWizardData({ ...wizardData, balance: parseInt(e.target.value) || 0 })}
                          placeholder="Initial quantity"
                          className={`w-full border ${errors.balance ? "border-red-400" : "border-zinc-200 dark:border-zinc-700"} bg-zinc-50 dark:bg-zinc-800/60 rounded-xl px-3 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                        />
                      </Field>
                    ) : (
                      <Field label="Current Balance" hint="Use Stock Management to modify">
                        <input type="text" value={selectedItem.balance} disabled
                          className="w-full border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-500 cursor-not-allowed"
                        />
                      </Field>
                    )}

                    <Field label="ROP (Re-Order Point)" required error={errors.min_stock} hint="Stored as min_stock">
                      <input type="number" min="0" value={wizardData.min_stock}
                        onChange={(e) => setWizardData({ ...wizardData, min_stock: parseInt(e.target.value) || 0 })}
                        placeholder="Alert threshold"
                        className={`w-full border ${errors.min_stock ? "border-red-400" : "border-zinc-200 dark:border-zinc-700"} bg-zinc-50 dark:bg-zinc-800/60 rounded-xl px-3 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="MOQ" hint="If > 0, purchase orders enforce this minimum">
                      <input type="number" min="0" value={wizardData.moq}
                        onChange={(e) => setWizardData({ ...wizardData, moq: parseInt(e.target.value) || 0 })}
                        placeholder="e.g., 10"
                        className="w-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl px-3 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </Field>
                    <Field label="Unit of Measure">
                      <Combobox value={wizardData.unit_of_measure} onChange={(v) => setWizardData({ ...wizardData, unit_of_measure: v })} options={filterOptions.unit_of_measures} placeholder="e.g., pcs, kg, ltr" />
                    </Field>
                  </div>

                  <Field label="Price per Unit" error={errors.price_per_unit}>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-sm">₱</span>
                      <input type="number" min="0" step="0.01" value={wizardData.price_per_unit}
                        onChange={(e) => setWizardData({ ...wizardData, price_per_unit: e.target.value === "" ? 0 : Number(e.target.value) })}
                        placeholder="0.00"
                        className={`w-full border ${errors.price_per_unit ? "border-red-400" : "border-zinc-200 dark:border-zinc-700"} bg-zinc-50 dark:bg-zinc-800/60 rounded-xl pl-8 pr-3 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                      />
                    </div>
                  </Field>

                  {/* Stock indicator */}
                  {wizardData.balance >= 0 && wizardData.min_stock >= 0 && (
                    <div className={`flex items-start gap-2.5 p-3.5 rounded-xl border ${stockStatusClass}`}>
                      <Info className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold">{stockStatusLabel}</p>
                        <p className="text-[11px] mt-0.5">
                          Current: {wizardData.balance} {wizardData.unit_of_measure || "units"} · Min: {wizardData.min_stock} {wizardData.unit_of_measure || "units"}
                          {wizardData.price_per_unit > 0 && ` · Value: ₱${(wizardData.balance * wizardData.price_per_unit).toFixed(2)}`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Step 3: Location & Media ── */}
            {currentStep === 3 && (
              <div className="max-w-2xl mx-auto space-y-5">
                <div className="text-center mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-base text-zinc-900 dark:text-white">Location & Media</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Where is it stored and what does it look like?</p>
                </div>

                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5 space-y-5">
                  <Field label="Storage Location">
                    <Combobox value={wizardData.location} onChange={(v) => setWizardData({ ...wizardData, location: v })} options={filterOptions.locations} placeholder="e.g., Warehouse A, Shelf 1-A, Bin 23" />
                  </Field>

                  {/* Status selector */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Item Status</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: "In Stock",     Icon: CheckCircle2, color: "emerald" },
                        { value: "Low In Stock", Icon: AlertTriangle, color: "amber" },
                        { value: "Out Of Stock", Icon: X,             color: "red" },
                      ].map((s) => {
                        const active = wizardData.item_status === s.value;
                        const colorMap = {
                          emerald: active ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 ring-2 ring-emerald-500/20" : "",
                          amber:   active ? "border-amber-500 bg-amber-50 dark:bg-amber-500/10 ring-2 ring-amber-500/20" : "",
                          red:     active ? "border-red-500 bg-red-50 dark:bg-red-500/10 ring-2 ring-red-500/20" : "",
                        };
                        const iconColor = { emerald: "text-emerald-600 dark:text-emerald-400", amber: "text-amber-600 dark:text-amber-400", red: "text-red-600 dark:text-red-400" };
                        return (
                          <label key={s.value} className={`cursor-pointer rounded-xl p-4 border-2 transition-all text-center ${active ? colorMap[s.color] : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"}`}>
                            <s.Icon className={`w-5 h-5 mx-auto mb-1.5 ${active ? iconColor[s.color] : "text-zinc-400"}`} />
                            <p className={`text-xs font-semibold leading-tight ${active ? iconColor[s.color] : "text-zinc-600 dark:text-zinc-400"}`}>{s.value}</p>
                            <input type="radio" name="item_status" value={s.value} checked={active} onChange={(e) => setWizardData({ ...wizardData, item_status: e.target.value })} className="sr-only" />
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Images */}
                  <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2 mb-3">
                      <ImageIcon className="w-4 h-4 text-zinc-400" />
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Item Images</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Thumbnail */}
                      <div className="w-36 h-36 shrink-0 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 overflow-hidden flex items-center justify-center bg-zinc-50 dark:bg-zinc-800/40">
                        {previewUrl || currentImageUrl ? (
                          <img src={previewUrl || currentImageUrl} alt="Preview" className="w-full h-full object-contain" onError={() => setCurrentImageUrl("")} />
                        ) : (
                          <div className="text-center p-4">
                            <ImageIcon className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-1" />
                            <p className="text-[10px] text-zinc-400">No image</p>
                          </div>
                        )}
                      </div>

                      {/* Upload zone */}
                      <div className="flex-1">
                        <label className="block">
                          <div
                            className="relative border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl p-4 hover:border-blue-400 dark:hover:border-blue-500 bg-zinc-50 dark:bg-zinc-800/40 transition-colors cursor-pointer"
                            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-blue-400"); }}
                            onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-blue-400"); }}
                            onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-blue-400"); handleFileSelect(e.dataTransfer.files); }}
                          >
                            <input type="file" accept="image/*" multiple onChange={(e) => { handleFileSelect(e.target.files); e.target.value = ""; }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            <div className="text-center">
                              <Upload className="w-6 h-6 text-zinc-400 mx-auto mb-1.5" />
                              <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Drop images or click to select</p>
                              <p className="text-[10px] text-zinc-400 mt-0.5">JPG, PNG, GIF, WEBP, BMP · max 10MB</p>
                            </div>
                          </div>
                        </label>

                        {/* Queue */}
                        {uploadQueue.length > 0 && (
                          <div className="mt-3">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Uploading ({uploadQueue.length})</p>
                            <div className="grid grid-cols-4 gap-2">
                              {uploadQueue.map((item, index) => (
                                <div key={index} className="relative group rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 aspect-square bg-zinc-100 dark:bg-zinc-800">
                                  <img src={item.previewUrl} alt={item.name} className="w-full h-full object-cover" />
                                  <div className={`absolute inset-0 flex items-center justify-center transition-colors ${uploadingImages.has(index) || item.error ? "bg-black/60" : "bg-black/0 group-hover:bg-black/60"}`}>
                                    {uploadingImages.has(index) ? (
                                      <div className="text-white text-center">
                                        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1" />
                                        <span className="text-[10px]">Uploading...</span>
                                      </div>
                                    ) : item.error ? (
                                      <div className="flex flex-col gap-1.5 items-center">
                                        <button type="button" onClick={() => retryUpload(index)} className="flex items-center gap-1 text-[10px] font-semibold bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-lg">
                                          <RefreshCw className="w-3 h-3" /> Retry
                                        </button>
                                        <button type="button" onClick={() => removeQueuedImage(index)} className="flex items-center gap-1 text-[10px] font-semibold bg-zinc-600 hover:bg-zinc-700 text-white px-2 py-1 rounded-lg">
                                          <X className="w-3 h-3" /> Remove
                                        </button>
                                      </div>
                                    ) : (
                                      <button type="button" onClick={() => removeQueuedImage(index)} className="opacity-0 group-hover:opacity-100 p-1.5 bg-red-600 hover:bg-red-700 rounded-lg active:scale-95 transition-all">
                                        <Trash2 className="w-3.5 h-3.5 text-white" />
                                      </button>
                                    )}
                                  </div>
                                  {item.error && <div className="absolute bottom-0 inset-x-0 bg-red-600 text-white text-[9px] text-center py-0.5">Failed</div>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {uploadError && <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{uploadError}</p>}

                        {!selectedItem?.item_no && (
                          <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                            <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-amber-700 dark:text-amber-400">Images upload automatically after the item is created.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Existing images */}
                    {existingImages.length > 0 && (
                      <div className="mt-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Existing ({existingImages.length})</p>
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                          {existingImages.map((img) => (
                            <div key={img.filename} className="relative group rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 aspect-square bg-zinc-100 dark:bg-zinc-800">
                              <img src={img.url} alt={img.filename} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                                <button type="button" onClick={() => handleImageDelete(img.filename)} className="opacity-0 group-hover:opacity-100 p-1 bg-red-600 rounded-lg active:scale-95 transition-all">
                                  <Trash2 className="w-3.5 h-3.5 text-white" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 4: Review ── */}
            {currentStep === 4 && (
              <div className="max-w-2xl mx-auto space-y-5">
                <div className="text-center mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <CheckCircle2 className="w-6 h-6 text-white dark:text-zinc-900" />
                  </div>
                  <h3 className="font-bold text-base text-zinc-900 dark:text-white">Review & Confirm</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Check all details before submitting</p>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      label: "Basic Info", Icon: Package, color: "blue",
                      rows: [
                        ["Name", wizardData.item_name],
                        ["Brand", wizardData.brand || "—"],
                        ["Type", wizardData.item_type || "—"],
                        ["Supplier", wizardData.supplier_id === "__custom" ? wizardData.custom_supplier || "—" : wizardData.supplier || "—"],
                      ],
                    },
                    {
                      label: "Stock & Price", Icon: DollarSign, color: "emerald",
                      rows: [
                        ["Balance", `${wizardData.balance} ${wizardData.unit_of_measure || "units"}`],
                        ["ROP", `${wizardData.min_stock} ${wizardData.unit_of_measure || "units"}`],
                        ["MOQ", `${wizardData.moq} ${wizardData.unit_of_measure || "units"}`],
                        ["Price", `₱${(Number(wizardData.price_per_unit) || 0).toFixed(2)}`],
                        ["Value", `₱${((wizardData.balance || 0) * (Number(wizardData.price_per_unit) || 0)).toFixed(2)}`],
                      ],
                    },
                    {
                      label: "Location", Icon: MapPin, color: "violet",
                      rows: [
                        ["Location", wizardData.location || "—"],
                        ["Status", wizardData.item_status],
                        ["Images", `${existingImages.length} uploaded`],
                      ],
                    },
                  ].map(({ label, Icon, color, rows }) => (
                    <div key={label} className={`rounded-2xl border p-4 ${
                      color === "blue" ? "border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10"
                      : color === "emerald" ? "border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10"
                      : "border-violet-200 dark:border-violet-500/20 bg-violet-50 dark:bg-violet-500/10"
                    }`}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color === "blue" ? "bg-blue-600" : color === "emerald" ? "bg-emerald-600" : "bg-violet-600"}`}>
                          <Icon className="w-3.5 h-3.5 text-white" />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{label}</p>
                      </div>
                      <div className="space-y-1.5">
                        {rows.map(([k, v]) => (
                          <div key={k} className="flex justify-between gap-2">
                            <span className="text-[11px] text-zinc-500">{k}</span>
                            <span className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 text-right">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Full details table */}
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Complete Item Details</p>
                  </div>
                  <div className="p-5 grid grid-cols-2 gap-x-8 gap-y-2.5 text-xs">
                    {[
                      ["Item Name", wizardData.item_name],
                      ["Brand", wizardData.brand || "N/A"],
                      ["Item Type", wizardData.item_type || "N/A"],
                      ["Supplier", wizardData.supplier_id === "__custom" ? wizardData.custom_supplier || "N/A" : wizardData.supplier || "N/A"],
                      ["Balance", wizardData.balance],
                      ["ROP", wizardData.min_stock],
                      ["MOQ", wizardData.moq],
                      ["Unit of Measure", wizardData.unit_of_measure || "N/A"],
                      ["Price per Unit", `₱${(Number(wizardData.price_per_unit) || 0).toFixed(2)}`],
                      ["Location", wizardData.location || "N/A"],
                      ["Status", wizardData.item_status],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-2">
                        <span className="text-zinc-400">{k}</span>
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-right">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Image thumbs */}
                {existingImages.length > 0 && (
                  <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-3">Attached Images ({existingImages.length})</p>
                    <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                      {existingImages.map((img) => (
                        <img key={img.filename} src={img.url} alt={img.filename} className="aspect-square w-full object-cover rounded-xl border border-zinc-200 dark:border-zinc-700" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
            {!selectedItem && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-700 dark:text-amber-400">
                  <strong>Duplicate handling:</strong> if this item matches an existing record by Item Name + Brand, saving will update the existing item instead.
                </p>
              </div>
            )}

            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => { if (currentStep > 1) handlePrevious(); else handleClose(); }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 active:scale-95 transition-all"
              >
                {currentStep === 1 ? <><X className="w-4 h-4" /> Cancel</> : <><ChevronLeft className="w-4 h-4" /> Back</>}
              </button>

              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Step {currentStep}/{steps.length}</p>

              <button
                onClick={() => { if (currentStep < 4) handleNext(); else handleSubmit(); }}
                disabled={(currentStep === 1 && !canProceedFromStep1) || (currentStep === 2 && !canProceedFromStep2)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-semibold shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-300 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {currentStep === 4
                  ? <><CheckCheck className="w-4 h-4" /> {selectedItem ? "Update Item" : "Create / Update Item"}</>
                  : <>Continue <ChevronRight className="w-4 h-4" /></>
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

export default AddEditItemWizard;