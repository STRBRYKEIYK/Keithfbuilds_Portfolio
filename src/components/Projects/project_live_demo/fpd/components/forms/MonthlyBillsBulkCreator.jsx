import React, { useState, useEffect, useRef } from 'react';
import { 
  LuX, LuPlus, LuSave, LuChevronDown, LuChevronRight, 
  LuTrash2, LuFileText, LuMapPin, LuHash, LuDollarSign, 
  LuCalendar, LuBuilding2 
} from 'react-icons/lu';
import { useAuth } from "../../../../contexts/AuthContext";
import { MonthlyBillsService } from '../../../../utils/api/services/monthly-bills-service';

// ============================================================================
// Shared Constants & Helpers (Formerly in monthly-bills-config.js)
// ============================================================================

export const BILL_CATEGORIES = [
  { value: 'electricity', label: 'Electricity', color: 'yellow' },
  { value: 'water', label: 'Water', color: 'blue' },
  { value: 'communications', label: 'Communications/Internet', color: 'purple' },
  { value: 'payment_fees', label: 'Payment Fees', color: 'orange' },
  { value: 'other', label: 'Other Services', color: 'gray' }
];

export const JJC_LOCATIONS = [
  { value: 'robinsons_lot18', label: 'Robinsons Lot 18' },
  { value: 'mission_hills', label: 'Mission Hills' },
  { value: 'hinapo', label: 'Hinapo' },
  { value: 'main_office', label: 'Main Office' }
];

export const BILL_STATUS = [
  { value: 'draft', label: 'Draft', color: 'gray' },
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'paid', label: 'Paid', color: 'green' },
  { value: 'overdue', label: 'Overdue', color: 'red' },
  { value: 'cancelled', label: 'Cancelled', color: 'gray' }
];

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'check', label: 'Check' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'online', label: 'Online (GCash/PayMaya)' },
  { value: 'other', label: 'Other' }
];

export const MONTHS = [
  { value: 1, label: 'January' }, { value: 2, label: 'February' },
  { value: 3, label: 'March' }, { value: 4, label: 'April' },
  { value: 5, label: 'May' }, { value: 6, label: 'June' },
  { value: 7, label: 'July' }, { value: 8, label: 'August' },
  { value: 9, label: 'September' }, { value: 10, label: 'October' },
  { value: 11, label: 'November' }, { value: 12, label: 'December' }
];

export function getStatusLabel(status) {
  const st = BILL_STATUS.find(s => s.value === status);
  return st ? st.label : status;
}

export function getStatusColorClasses(status) {
  const colorMap = {
    draft: 'bg-stone-100 text-gray-800 dark:bg-stone-800 dark:text-gray-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    cancelled: 'bg-stone-100 text-gray-800 dark:bg-stone-800 dark:text-gray-300'
  };
  return colorMap[status] || colorMap.draft;
}

export function formatPeriod(month, year) {
  if (!month || !year) return '-';
  const m = MONTHS.find(mo => mo.value === month);
  return `${m ? m.label : ''} ${year}`;
}

// ============================================================================
// Main Bulk Creator Component
// ============================================================================

const monthlyBillsService = new MonthlyBillsService();

export default function MonthlyBillsBulkCreator({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isDarkMode: propIsDarkMode,
  user: propUser,
  editMode = false,
  initialData = null,
  initialDraft = null,
  initialDrafts = [],
}) {
  const { isDarkMode: authIsDarkMode, user: authUser } = useAuth();
  const isDarkMode = typeof propIsDarkMode !== 'undefined' ? propIsDarkMode : authIsDarkMode;
  const user = propUser ?? authUser;
  const [providers, setProviders] = useState([]);
  const modalRef = useRef(null);

  const normalizeProviderName = (value) => String(value || '').trim().replace(/\s+/g, ' ').toLowerCase();
  const normalizeCategory = (value) => String(value || '').trim().toLowerCase();

  const normalizeProviderRecord = (raw) => {
    if (!raw || typeof raw !== 'object') return null;

    const providerName = String(raw.provider_name || raw.providerName || '').trim();
    const category = String(raw.category || '').trim();
    if (!providerName || !category) return null;

    return {
      ...raw,
      id: raw.id,
      provider_name: providerName,
      category,
      is_active: raw.is_active,
    };
  };

  const mergeProviders = (incoming) => {
    setProviders((prev) => {
      const byKey = new Map();

      [...prev, ...(incoming || [])].forEach((raw) => {
        const normalized = normalizeProviderRecord(raw);
        if (!normalized) return;

        const key = `${normalizeCategory(normalized.category)}|${normalizeProviderName(normalized.provider_name)}`;
        byKey.set(key, normalized);
      });

      return Array.from(byKey.values()).sort((a, b) => {
        const categoryCompare = String(a.category).localeCompare(String(b.category));
        if (categoryCompare !== 0) return categoryCompare;
        return String(a.provider_name).localeCompare(String(b.provider_name));
      });
    });
  };

  const fetchProviders = async () => {
    try {
      const data = await monthlyBillsService.getProviders({ active_only: true });
      const normalized = (Array.isArray(data) ? data : [])
        .map((record) => normalizeProviderRecord(record))
        .filter(Boolean);
      mergeProviders(normalized);
      return normalized;
    } catch (error) {
      console.error('Failed to fetch providers for bulk creator:', error);
      setProviders([]);
      return [];
    }
  };

  const buildBillsFromInitialData = (data) => ([{
    id: data.id || `bill-${Date.now()}`,
    month: data.month || new Date().getMonth() + 1,
    year: data.year || new Date().getFullYear(),
    status: data.status || 'draft',
    payment_method: data.payment_method || '',
    payment_date: data.payment_date || '',
    items: data.items?.length > 0 ? data.items.map(item => ({ ...item, ui_id: `item-${Date.now()}-${Math.random()}` })) : [createEmptyItem()],
    expanded: true
  }]);

  // Initialize Bills State
  const [bills, setBills] = useState(() => {
    if (editMode && initialData) {
      return buildBillsFromInitialData(initialData);
    }
    return [createEmptyBill()];
  });

  useEffect(() => {
    if (!isOpen) return;

    if (editMode) {
      if (initialData) {
        setBills(buildBillsFromInitialData(initialData));
      }
      return;
    }

    if (Array.isArray(initialDrafts) && initialDrafts.length > 0) {
      setBills(
        initialDrafts.map((draft) => ({
          ...createEmptyBill(),
          ...draft,
          id: `bill-${Date.now()}-${Math.random()}`,
          items: Array.isArray(draft.items) && draft.items.length > 0
            ? draft.items.map((item) => ({
                ...createEmptyItem(),
                ...item,
                ui_id: `item-${Date.now()}-${Math.random()}`,
              }))
            : [createEmptyItem()],
        })),
      );
    } else if (initialDraft) {
      setBills([
        {
          ...createEmptyBill(),
          ...initialDraft,
          items: Array.isArray(initialDraft.items) && initialDraft.items.length > 0
            ? initialDraft.items.map((item) => ({
                ...createEmptyItem(),
                ...item,
                ui_id: `item-${Date.now()}-${Math.random()}`,
              }))
            : [createEmptyItem()],
        },
      ]);
    } else {
      setBills([createEmptyBill()]);
    }
  }, [isOpen, editMode, initialData?.id, initialDraft, initialDrafts]);

  // Fetch providers for the datalist on mount
  useEffect(() => {
    if (isOpen) {
      fetchProviders();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  function createEmptyBill() {
    return {
      id: `bill-${Date.now()}-${Math.random()}`,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      status: 'draft',
      payment_method: '',
      payment_date: '',
      items: [createEmptyItem()],
      expanded: true
    };
  }

  function createEmptyItem() {
    return {
      ui_id: `item-${Date.now()}-${Math.random()}`,
      category: '',
      provider_name: '',
      location: '',
      account_number: '',
      soa_number: '',
      fee_name: '',
      description: '',
      billing_period_start: '',
      billing_period_end: '',
      due_date: '',
      amount: ''
    };
  }

  const handleAddBills = (count) => {
    const newBills = Array.from({ length: count }, () => createEmptyBill());
    setBills(prev => [...prev, ...newBills]);
  };

  const handleDeleteBill = (billId) => {
    if (bills.length === 1) return alert('Cannot delete the last bill entry.');
    setBills(bills.filter(b => b.id !== billId));
  };

  const handleUpdateBill = (billId, updates) => {
    setBills(bills.map(b => b.id === billId ? { ...b, ...updates } : b));
  };

  const toggleExpanded = (billId) => {
    setBills(bills.map(b => b.id === billId ? { ...b, expanded: !b.expanded } : b));
  };

  const handleAddItem = (billId) => {
    setBills(bills.map(b => b.id === billId ? { ...b, items: [...b.items, createEmptyItem()] } : b));
  };

  const handleUpdateItem = (billId, itemUiId, updates) => {
    setBills(bills.map(b => {
      if (b.id !== billId) return b;
      return { ...b, items: b.items.map(item => item.ui_id === itemUiId ? { ...item, ...updates } : item) };
    }));
  };

  const handleDeleteItem = (billId, itemUiId) => {
    setBills(bills.map(b => {
      if (b.id !== billId) return b;
      let newItems = b.items.filter(item => item.ui_id !== itemUiId);
      if (newItems.length === 0) newItems = [createEmptyItem()];
      return { ...b, items: newItems };
    }));
  };

  // Provider Creation Helper
  const ensureProviderExists = async (providerName, category) => {
    const trimmedName = providerName?.trim();
    if (!trimmedName || !category) return;

    const normalizedName = normalizeProviderName(trimmedName);
    const normalizedCategory = normalizeCategory(category);

    const existing = providers.find((provider) =>
      normalizeProviderName(provider.provider_name) === normalizedName &&
      normalizeCategory(provider.category) === normalizedCategory,
    );

    if (existing) return existing;

    try {
      const created = await monthlyBillsService.createProvider({ provider_name: trimmedName, category, is_active: true });
      const providerData = normalizeProviderRecord(created?.provider || created?.data?.provider || created?.data) || {
        provider_name: trimmedName,
        category,
      };
      mergeProviders([providerData]);
      return providerData;
    } catch (e) {
      console.error("Provider auto-create failed:", e);
      const refreshedProviders = await fetchProviders();
      const refreshed = refreshedProviders.find((provider) =>
        normalizeProviderName(provider.provider_name) === normalizedName &&
        normalizeCategory(provider.category) === normalizedCategory,
      );
      if (refreshed) return refreshed;
    }
  };

  const handleSaveAll = async () => {
    try {
      // 1. Basic Validation
      for (const bill of bills) {
        if (!bill.month || !bill.year) return alert('Please select a valid Month and Year for all bills.');
        const validItems = bill.items.filter(item => parseFloat(item.amount) > 0);
        if (validItems.length === 0) return alert(`Bill for ${formatPeriod(bill.month, bill.year)} has no items with a valid amount.`);
        
        for (const item of validItems) {
          if (!item.category) return alert(`Please select a category for all valid items in ${formatPeriod(bill.month, bill.year)}.`);
        }
      }

      const providerKeysEnsured = new Set();

      // 2. Process and Submit
      for (const bill of bills) {
        const validItems = bill.items.filter(item => parseFloat(item.amount) > 0);
        
        // Auto-create missing providers
        for (const item of validItems) {
          if (item.provider_name && item.category) {
            const providerKey = `${normalizeCategory(item.category)}|${normalizeProviderName(item.provider_name)}`;
            if (!providerKeysEnsured.has(providerKey)) {
              await ensureProviderExists(item.provider_name, item.category);
              providerKeysEnsured.add(providerKey);
            }
          }
        }

        // Clean Payload
        const payload = {
          ...bill,
          prepared_by: user?.id || user?.uid || user?.employeeId || undefined,
          payment_method: bill.status === 'paid' ? bill.payment_method : undefined,
          payment_date: bill.status === 'paid' ? bill.payment_date : undefined,
          items: validItems.map(({ ui_id, ...rest }) => rest) // strip ui_id
        };

        if (editMode && initialData?.id) {
          await monthlyBillsService.updateBill(initialData.id, payload);
        } else {
          await monthlyBillsService.createMonthlyBill(payload);
        }
      }

      alert(editMode ? 'Bill updated successfully!' : `Successfully created ${bills.length} bill(s)!`);
      onClose();
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save bills: ' + (error.message || 'Unknown error'));
    }
  };

  const calculateGrandTotal = () => {
    let total = 0;
    bills.forEach(b => b.items.forEach(i => total += (parseFloat(i.amount) || 0)));
    return total;
  };

  if (!isOpen) return null;

  // Theme Helpers
  const bgBase = isDarkMode ? 'bg-stone-950' : 'bg-stone-100';
  const bgCard = isDarkMode ? 'bg-stone-900' : 'bg-white';
  const textPrimary = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const borderCol = isDarkMode ? 'border-gray-800' : 'border-gray-200';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 sm:p-6">
      
      {/* Native Datalists for Combobox behavior */}
      <datalist id="providers-list">
        {Array.from(new Set(providers.map((provider) => provider?.provider_name).filter(Boolean))).map((providerName) => (
          <option key={providerName} value={providerName} />
        ))}
      </datalist>
      <datalist id="locations-list">
        {JJC_LOCATIONS.map(l => <option key={l.value} value={l.label} />)}
      </datalist>

      <div 
        ref={modalRef}
        className={`w-full max-w-7xl max-h-[92vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border ${borderCol} ${bgBase} animate-in zoom-in-95 duration-200`}
      >
        {/* --- HEADER --- */}
        <div className={`sticky top-0 z-20 px-6 py-4 border-b ${borderCol} ${bgCard} flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0`}>
          <div>
            <h2 className={`text-xl font-bold flex items-center gap-2 ${textPrimary}`}>
               <LuFileText className="w-5 h-5 text-cyan-500" />
               {editMode ? 'Edit Monthly Bill' : 'Bulk Create Monthly Bills'}
            </h2>
            <div className={`mt-1 flex items-center gap-4 text-xs ${textSecondary}`}>
              <span>Rows: <strong className={textPrimary}>{bills.length}</strong></span>
              <span className="hidden sm:inline">|</span>
              <span className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 px-2 py-0.5 rounded">
                Total Amount: <strong className="text-sm">₱{calculateGrandTotal().toLocaleString(undefined, {minimumFractionDigits: 2})}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button 
              onClick={handleSaveAll}
              className="flex-1 sm:flex-none px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
            >
              <LuSave size={16} /> {editMode ? 'Update' : 'Save All'}
            </button>
            <button 
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-stone-800 text-gray-400' : 'hover:bg-stone-200 text-gray-500'}`}
            >
              <LuX size={20} />
            </button>
          </div>
        </div>

        {/* --- SCROLLABLE CONTENT --- */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {bills.map((bill) => (
            <BillCard
              key={bill.id}
              bill={bill}
              editMode={editMode}
              isDarkMode={isDarkMode}
              onUpdate={(u) => handleUpdateBill(bill.id, u)}
              onDelete={() => handleDeleteBill(bill.id)}
              onToggleExpanded={() => toggleExpanded(bill.id)}
              onAddItem={() => handleAddItem(bill.id)}
              onUpdateItem={(iid, u) => handleUpdateItem(bill.id, iid, u)}
              onDeleteItem={(iid) => handleDeleteItem(bill.id, iid)}
            />
          ))}

          {!editMode && (
             <button 
               onClick={() => handleAddBills(1)}
               className={`w-full py-4 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 transition-all opacity-60 hover:opacity-100 ${
                 isDarkMode ? 'border-gray-800 hover:border-gray-700 text-gray-400 hover:bg-stone-900' : 'border-gray-300 hover:border-gray-400 text-gray-500 hover:bg-white'
               }`}
             >
               <LuPlus size={20} /> Add Another Bill Entry
             </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Individual Bill Card
// ============================================================================

function BillCard({ 
  bill, 
  editMode,
  isDarkMode,
  onUpdate, 
  onDelete, 
  onToggleExpanded,
  onAddItem, 
  onUpdateItem, 
  onDeleteItem
}) {
  const billTotal = bill.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  const cardBg = isDarkMode ? 'bg-stone-900' : 'bg-white';
  const borderCol = isDarkMode ? 'border-gray-800' : 'border-gray-200';
  const inputBg = isDarkMode ? 'bg-stone-950 border-gray-700 focus:border-cyan-500 text-white' : 'bg-white border-gray-300 focus:border-cyan-500 text-gray-900';
  const labelCol = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className={`rounded-xl border shadow-sm transition-all duration-200 ${cardBg} ${borderCol}`}>
        
        {/* --- CARD HEADER --- */}
        <div className="p-4">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <button onClick={onToggleExpanded} className={`p-1 rounded-md transition-colors ${isDarkMode ? 'hover:bg-stone-800' : 'hover:bg-stone-100'}`}>
                    {bill.expanded ? <LuChevronDown size={18} /> : <LuChevronRight size={18} />}
                  </button>
                  <div className="flex flex-col leading-tight">
                    <span className={`text-sm font-bold px-2 py-1 rounded uppercase tracking-wide ${isDarkMode ? 'bg-stone-800 text-cyan-400' : 'bg-cyan-50 text-cyan-700'}`}>
                      {formatPeriod(bill.month, bill.year)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-right mr-2">
                        <p className={`text-[10px] uppercase font-bold tracking-wider ${labelCol}`}>Subtotal</p>
                        <p className="text-lg font-bold font-mono text-cyan-500">₱{billTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                    </div>
                    {!editMode && (
                        <button onClick={onDelete} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                            <LuTrash2 size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* Header Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-2">
                    <label className={`block text-xs font-medium mb-1 ${labelCol}`}>Month</label>
                    <select value={bill.month} onChange={(e) => onUpdate({ month: parseInt(e.target.value) })} className={`w-full px-3 py-1.5 text-sm rounded-lg border outline-none transition-all ${inputBg}`}>
                        {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label className={`block text-xs font-medium mb-1 ${labelCol}`}>Year</label>
                    <input type="number" value={bill.year} onChange={(e) => onUpdate({ year: parseInt(e.target.value) })} className={`w-full px-3 py-1.5 text-sm rounded-lg border outline-none transition-all ${inputBg}`} />
                </div>
                <div className="md:col-span-3">
                    <label className={`block text-xs font-medium mb-1 ${labelCol}`}>Status</label>
                    <select value={bill.status} onChange={(e) => onUpdate({ status: e.target.value })} className={`w-full px-3 py-1.5 text-sm rounded-lg border outline-none transition-all ${inputBg}`}>
                        {BILL_STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                </div>
                
                {bill.status === 'paid' && (
                  <>
                    <div className="md:col-span-3">
                        <label className={`block text-xs font-medium mb-1 ${labelCol}`}>Payment Method</label>
                        <select value={bill.payment_method} onChange={(e) => onUpdate({ payment_method: e.target.value })} className={`w-full px-3 py-1.5 text-sm rounded-lg border outline-none transition-all ${inputBg}`}>
                            <option value="">Select Method...</option>
                            {PAYMENT_METHODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className={`block text-xs font-medium mb-1 ${labelCol}`}>Payment Date</label>
                        <input type="date" value={bill.payment_date} onChange={(e) => onUpdate({ payment_date: e.target.value })} className={`w-full px-3 py-1.5 text-sm rounded-lg border outline-none transition-all ${inputBg}`} />
                    </div>
                  </>
                )}
            </div>
        </div>

        {/* --- BODY (Line Items) --- */}
        {bill.expanded && (
             <div className={`border-t ${borderCol}`}>
                {/* Desktop Table Header */}
                <div className={`hidden lg:grid grid-cols-[140px_1.5fr_1fr_1.5fr_1.5fr_120px_30px] gap-3 px-4 py-2 text-xs font-bold uppercase tracking-wider opacity-70 ${isDarkMode ? 'bg-stone-800/50' : 'bg-stone-50'}`}>
                    <div>Category</div>
                    <div>Provider / Desc</div>
                    <div>Location</div>
                    <div>Acct / Ref</div>
                    <div>Dates (Start-End / Due)</div>
                    <div className="text-right">Amount</div>
                    <div></div>
                </div>

                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                    {bill.items.map((item) => (
                         <div key={item.ui_id} className="group relative grid grid-cols-1 lg:grid-cols-[140px_1.5fr_1fr_1.5fr_1.5fr_120px_30px] gap-3 px-4 py-3 items-start hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                            
                            {/* Category */}
                            <div className="w-full">
                                <label className="lg:hidden text-[10px] uppercase font-bold text-gray-500 mb-1 block">Category</label>
                                <select value={item.category} onChange={(e) => onUpdateItem(item.ui_id, { category: e.target.value })} className={`w-full px-2 py-1.5 rounded text-xs border outline-none transition-all ${inputBg}`}>
                                    <option value="">Select...</option>
                                    {BILL_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                </select>
                            </div>

                            {/* Details (Provider/Desc stacked) */}
                            <div className="w-full flex flex-col gap-1.5">
                                <label className="lg:hidden text-[10px] uppercase font-bold text-gray-500 mb-1 block">Details</label>
                                {['electricity', 'water', 'communications'].includes(item.category) || !item.category ? (
                                    <div className="relative">
                                      <LuBuilding2 size={12} className={`absolute left-2 top-2 ${labelCol}`} />
                                      <input type="text" list="providers-list" placeholder="Provider Name" value={item.provider_name || ''} onChange={(e) => onUpdateItem(item.ui_id, { provider_name: e.target.value })} className={`w-full pl-6 pr-2 py-1.5 rounded text-xs border outline-none transition-all ${inputBg}`} />
                                    </div>
                                ) : item.category === 'payment_fees' ? (
                                    <input type="text" placeholder="Fee Name" value={item.fee_name || ''} onChange={(e) => onUpdateItem(item.ui_id, { fee_name: e.target.value })} className={`w-full px-2 py-1.5 rounded text-xs border outline-none transition-all ${inputBg}`} />
                                ) : (
                                    <input type="text" placeholder="Description" value={item.description || ''} onChange={(e) => onUpdateItem(item.ui_id, { description: e.target.value })} className={`w-full px-2 py-1.5 rounded text-xs border outline-none transition-all ${inputBg}`} />
                                )}
                            </div>

                            {/* Location */}
                            <div className="w-full">
                                <label className="lg:hidden text-[10px] uppercase font-bold text-gray-500 mb-1 block">Location</label>
                                <div className="relative">
                                  <LuMapPin size={12} className={`absolute left-2 top-2 ${labelCol}`} />
                                  <input type="text" list="locations-list" placeholder="Property / Location" value={item.location || ''} onChange={(e) => onUpdateItem(item.ui_id, { location: e.target.value })} disabled={!['electricity', 'water', 'communications'].includes(item.category)} className={`w-full pl-6 pr-2 py-1.5 rounded text-xs border outline-none transition-all disabled:opacity-30 ${inputBg}`} />
                                </div>
                            </div>

                            {/* Account / Ref */}
                            <div className="w-full flex flex-col gap-1.5">
                                <label className="lg:hidden text-[10px] uppercase font-bold text-gray-500 mb-1 block">Reference</label>
                                <div className="relative">
                                  <LuHash size={12} className={`absolute left-2 top-2 ${labelCol}`} />
                                  <input type="text" placeholder={item.category === 'communications' ? "Acct / SOA No." : "Account / Ref No."} value={item.account_number || item.soa_number || ''} onChange={(e) => onUpdateItem(item.ui_id, { account_number: e.target.value, soa_number: e.target.value })} className={`w-full pl-6 pr-2 py-1.5 rounded text-xs border outline-none transition-all ${inputBg}`} />
                                </div>
                            </div>

                            {/* Dates (Start, End, Due) */}
                            <div className="w-full flex flex-col gap-1.5">
                                <label className="lg:hidden text-[10px] uppercase font-bold text-gray-500 mb-1 block">Dates</label>
                                {['electricity', 'water'].includes(item.category) && (
                                  <div className="flex gap-1">
                                      <input type="date" title="Billing Period Start" value={item.billing_period_start || ''} onChange={(e) => onUpdateItem(item.ui_id, { billing_period_start: e.target.value })} className={`w-1/2 px-1.5 py-1.5 rounded text-[10px] border outline-none transition-all ${inputBg}`} />
                                      <input type="date" title="Billing Period End" value={item.billing_period_end || ''} onChange={(e) => onUpdateItem(item.ui_id, { billing_period_end: e.target.value })} className={`w-1/2 px-1.5 py-1.5 rounded text-[10px] border outline-none transition-all ${inputBg}`} />
                                  </div>
                                )}
                                <div className="relative">
                                  <LuCalendar size={12} className={`absolute left-2 top-2 ${labelCol}`} />
                                  <input type="date" title="Due Date" value={item.due_date || ''} onChange={(e) => onUpdateItem(item.ui_id, { due_date: e.target.value })} className={`w-full pl-6 pr-2 py-1.5 rounded text-xs border outline-none transition-all ${inputBg}`} />
                                </div>
                            </div>

                            {/* Amount */}
                            <div className="w-full">
                                <label className="lg:hidden text-[10px] uppercase font-bold text-gray-500 mb-1 block">Amount</label>
                                <div className="relative">
                                    <LuDollarSign size={12} className={`absolute left-2 top-2.5 ${labelCol}`} />
                                    <input type="number" value={item.amount || ''} onChange={(e) => onUpdateItem(item.ui_id, { amount: e.target.value })} placeholder="0.00" step="0.01" className={`w-full bg-transparent text-left lg:text-right pl-6 pr-2 py-1.5 rounded text-sm font-mono border border-transparent focus:border-cyan-500 hover:border-gray-300 dark:hover:border-gray-600 outline-none transition-all ${isDarkMode ? 'text-cyan-400 placeholder-gray-700' : 'text-cyan-600 placeholder-gray-300'}`} />
                                </div>
                            </div>

                            {/* Delete Button */}
                            <button onClick={() => onDeleteItem(item.ui_id)} className="absolute top-2 right-2 lg:static flex items-center justify-center pt-2 text-gray-400 hover:text-red-500 transition-colors lg:opacity-0 group-hover:opacity-100">
                                <LuX size={16} />
                            </button>
                         </div>
                    ))}
                </div>

                <div className={`px-4 py-3 ${isDarkMode ? 'bg-stone-800/30' : 'bg-stone-50'}`}>
                    <button onClick={onAddItem} className={`text-xs font-semibold flex items-center gap-1 transition-colors ${isDarkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-600 hover:text-cyan-700'}`}>
                        <LuPlus size={14} /> Add Line Item
                    </button>
                </div>
             </div>
        )}
    </div>
  );
}