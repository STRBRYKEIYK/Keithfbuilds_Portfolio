import React, { useMemo, useState, useEffect } from "react";
import { buildInventoryDuplicateKey } from "../../../utils/inventory-duplicate-utils";
import {
  CheckSquare,
  Square,
  Trash2,
  Wand2,
  X,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

function getDuplicateGroups(items) {
  const grouped = new Map();

  items.forEach((item) => {
    const key = buildInventoryDuplicateKey(item);
    if (!key) return;

    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key).push(item);
  });

  return Array.from(grouped.entries())
    .map(([key, groupItems]) => ({
      key,
      items: [...groupItems].sort(
        (a, b) => (Number(a.item_no) || 0) - (Number(b.item_no) || 0),
      ),
    }))
    .filter((group) => group.items.length > 1)
    .sort((a, b) => b.items.length - a.items.length);
}

function DuplicateCheckView({
  items,
  onDeleteSelected,
  onItemClick,
  formatCurrency,
}) {
  const [selectedIds, setSelectedIds] = useState(new Set());

  const duplicateGroups = useMemo(() => getDuplicateGroups(items), [items]);

  const duplicateItemIds = useMemo(
    () =>
      duplicateGroups.flatMap((group) =>
        group.items.map((item) => item.item_no),
      ),
    [duplicateGroups],
  );

  const totalDuplicateItems = duplicateItemIds.length;

  useEffect(() => {
    setSelectedIds((prev) => {
      const valid = new Set(duplicateItemIds);
      const next = new Set();
      prev.forEach((id) => {
        if (valid.has(id)) next.add(id);
      });
      return next;
    });
  }, [duplicateItemIds, totalDuplicateItems]);

  const isSelected = (itemNo) => selectedIds.has(itemNo);

  const toggleSelect = (itemNo) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemNo)) next.delete(itemNo);
      else next.add(itemNo);
      return next;
    });
  };

  const selectAllDuplicates = () => {
    setSelectedIds(new Set(duplicateItemIds));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const selectSuggested = () => {
    const suggested = new Set();
    duplicateGroups.forEach((group) => {
      // Keep lowest item_no; suggest the rest for deletion
      group.items.slice(1).forEach((item) => suggested.add(item.item_no));
    });
    setSelectedIds(suggested);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    onDeleteSelected(Array.from(selectedIds));
  };

  // ─── Empty State ──────────────────────────────────────────────────────────
  if (duplicateGroups.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900/50 rounded-2xl p-12 shadow-sm border border-zinc-200 dark:border-zinc-800 text-center flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4 border border-emerald-100 dark:border-emerald-500/20">
          <ShieldCheck className="w-8 h-8 text-emerald-500" />
        </div>
        <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white mb-2">
          Database is Clean
        </h3>
        <p className="text-sm font-medium text-zinc-500 max-w-sm">
          No duplicate items were found based on the current naming and branding
          criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-10">
      {/* ─── Control Bar ──────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-zinc-900/80 rounded-2xl p-4 md:p-5 shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col xl:flex-row xl:items-center justify-between gap-4 sticky top-0 z-10 backdrop-blur-md">
        {/* Metric Summary */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-0.5">
              Issue Groups
            </span>
            <span className="text-xl font-black text-zinc-900 dark:text-white">
              {duplicateGroups.length}
            </span>
          </div>
          <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-700 hidden sm:block" />
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-0.5">
              Total Records
            </span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400">
              {totalDuplicateItems}
            </span>
          </div>
          <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-700 hidden sm:block" />
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-0.5">
              Selected to Delete
            </span>
            <span className="text-xl font-black text-red-600 dark:text-red-400">
              {selectedIds.size}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={selectSuggested}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-sm font-bold border border-amber-200 dark:border-amber-500/30 transition-colors"
          >
            <Wand2 className="w-4 h-4" />
            Auto-Select
          </button>

          <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700 hidden sm:block mx-1" />

          <button
            onClick={selectAllDuplicates}
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-bold transition-colors"
          >
            <CheckSquare className="w-4 h-4" />
            All
          </button>
          <button
            onClick={clearSelection}
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-bold transition-colors"
          >
            <X className="w-4 h-4" />
            Clear
          </button>

          <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700 hidden sm:block mx-1" />

          <button
            onClick={handleBulkDelete}
            disabled={selectedIds.size === 0}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-zinc-100 disabled:text-zinc-400 dark:disabled:bg-zinc-800/50 dark:disabled:text-zinc-600 text-white text-sm font-bold transition-all disabled:cursor-not-allowed disabled:border-transparent border border-red-500 shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            Delete Selected ({selectedIds.size})
          </button>
        </div>
      </div>

      {/* ─── Data Table ───────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-zinc-900/50 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-zinc-50 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-700/80">
              <tr>
                <th className="w-12 px-4 py-4 text-center">
                  <CheckSquare className="w-4 h-4 mx-auto text-zinc-400" />
                </th>
                <th className="px-5 py-4 text-[11px] font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Duplicate Cluster
                </th>
                <th className="px-5 py-4 text-[11px] font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Item Details
                </th>
                <th className="px-5 py-4 text-[11px] font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Brand & Location
                </th>
                <th className="px-5 py-4 text-center text-[11px] font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-5 py-4 text-right text-[11px] font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Unit Price
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {duplicateGroups.map((group, groupIndex) => {
                const keeperItemNo = group.items[0]?.item_no;
                // Alternate background color for entirely different groups for visual clustering
                const groupBg =
                  groupIndex % 2 === 0
                    ? "bg-white dark:bg-zinc-900/20"
                    : "bg-zinc-50/50 dark:bg-zinc-800/20";

                return group.items.map((item, itemIndex) => {
                  const isKeeper = item.item_no === keeperItemNo;
                  const selected = isSelected(item.item_no);

                  return (
                    <tr
                      key={`${group.key}-${item.item_no}`}
                      className={`
                        transition-colors group
                        ${groupBg}
                        ${selected ? "bg-red-50/50 dark:bg-red-900/10" : "hover:bg-zinc-100 dark:hover:bg-zinc-800/60"}
                        ${itemIndex === 0 ? "border-t-[3px] border-zinc-200 dark:border-zinc-700" : ""}
                      `}
                    >
                      {/* Checkbox Column */}
                      <td
                        className="px-4 py-3 text-center cursor-pointer"
                        onClick={() => toggleSelect(item.item_no)}
                      >
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center mx-auto transition-colors border ${selected ? "bg-red-500 border-red-500 text-white" : "bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-600 text-transparent hover:border-red-400"}`}
                        >
                          <CheckSquare className="w-3.5 h-3.5" />
                        </div>
                      </td>

                      {/* Group Label Column */}
                      <td className="px-5 py-3">
                        {itemIndex === 0 ? (
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                              Group {groupIndex + 1}
                            </span>
                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-500 mt-0.5 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />{" "}
                              {group.items.length} records
                            </span>
                          </div>
                        ) : (
                          <span className="text-zinc-300 dark:text-zinc-700">
                            ↳
                          </span>
                        )}
                      </td>

                      {/* Item Details Column */}
                      <td className="px-5 py-3">
                        <button
                          onClick={() => onItemClick(item)}
                          className="flex flex-col text-left group-hover/btn:opacity-80 transition-opacity"
                        >
                          <span
                            className={`font-bold transition-colors ${selected ? "text-red-700 dark:text-red-400 line-through decoration-red-300" : "text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400"}`}
                          >
                            {item.item_name}
                          </span>
                          <span className="text-xs font-semibold text-zinc-500 mt-0.5">
                            ID: #{item.item_no}
                          </span>
                        </button>
                        {isKeeper && (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 mt-2 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                            <ShieldCheck className="w-3 h-3" /> Keeper (Oldest)
                          </div>
                        )}
                      </td>

                      {/* Brand & Location Column */}
                      <td className="px-5 py-3">
                        <div className="flex flex-col">
                          <span
                            className={`font-semibold ${selected ? "text-red-600/70 dark:text-red-400/70" : "text-zinc-700 dark:text-zinc-300"}`}
                          >
                            {item.brand || "—"}
                          </span>
                          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-500 mt-0.5">
                            {item.location || "Unassigned"}
                          </span>
                        </div>
                      </td>

                      {/* Balance Column */}
                      <td className="px-5 py-3 text-center">
                        <span
                          className={`text-base font-black ${selected ? "text-red-600/70 dark:text-red-400/70" : "text-zinc-900 dark:text-white"}`}
                        >
                          {item.balance || 0}
                        </span>
                      </td>

                      {/* Unit Price Column */}
                      <td className="px-5 py-3 text-right">
                        <span
                          className={`text-sm font-bold ${selected ? "text-red-600/70 dark:text-red-400/70" : "text-zinc-900 dark:text-white"}`}
                        >
                          {item.price_per_unit
                            ? formatCurrency(item.price_per_unit)
                            : "—"}
                        </span>
                      </td>
                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DuplicateCheckView;
