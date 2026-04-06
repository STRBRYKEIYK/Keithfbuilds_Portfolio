import React from "react";
import {
  PackagePlus,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";

function InventoryListView({
  items,
  visibleCount,
  setVisibleCount,
  onItemClick,
  onStockManagement,
  onDeleteItem,
  formatCurrency,
}) {
  return (
    <div className="bg-white dark:bg-zinc-900/50 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="bg-zinc-50 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-700/80">
            <tr>
              <th className="px-5 py-4 text-[11px] font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Item Details
              </th>
              <th className="px-5 py-4 text-[11px] font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Brand & Location
              </th>
              <th className="px-5 py-4 text-center text-[11px] font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Balance
              </th>
              <th className="px-5 py-4 text-center text-[11px] font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                ROP / MOQ
              </th>
              <th className="px-5 py-4 text-right text-[11px] font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Unit Price
              </th>
              <th className="px-5 py-4 text-center text-[11px] font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-5 py-4 text-right text-[11px] font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
            {items.slice(0, visibleCount).map((item) => {
              // Status logic
              const bal = Number(item.balance) || 0;
              const min = Number(item.min_stock) || 0;

              let statusConfig = {
                bg: "bg-emerald-50 dark:bg-emerald-500/10",
                text: "text-emerald-700 dark:text-emerald-400",
                icon: CheckCircle2,
                label: "In Stock",
              };

              if (bal === 0) {
                statusConfig = {
                  bg: "bg-red-50 dark:bg-red-500/10",
                  text: "text-red-700 dark:text-red-400",
                  icon: XCircle,
                  label: "Out of Stock",
                };
              } else if (min > 0 && bal < min) {
                statusConfig = {
                  bg: "bg-amber-50 dark:bg-amber-500/10",
                  text: "text-amber-700 dark:text-amber-400",
                  icon: AlertTriangle,
                  label: "Low Stock",
                };
              }

              const StatusIcon = statusConfig.icon;

              return (
                <tr
                  key={item.item_no}
                  onClick={() => onItemClick(item)}
                  className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer"
                >
                  {/* Item Details */}
                  <td className="px-5 py-3">
                    <div className="flex flex-col">
                      <span className="font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {item.item_name}
                      </span>
                      <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 mt-0.5">
                        #{item.item_no}
                      </span>
                    </div>
                  </td>

                  {/* Brand & Location */}
                  <td className="px-5 py-3">
                    <div className="flex flex-col">
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                        {item.brand || "—"}
                      </span>
                      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-500 mt-0.5">
                        {item.location || "Unassigned"}
                      </span>
                    </div>
                  </td>

                  {/* Balance */}
                  <td className="px-5 py-3 text-center">
                    <div className="inline-flex items-baseline gap-1">
                      <span className="text-lg font-black text-zinc-900 dark:text-white">
                        {item.balance || 0}
                      </span>
                      <span className="text-xs font-bold text-zinc-400 uppercase">
                        {item.unit_of_measure || ""}
                      </span>
                    </div>
                  </td>

                  {/* ROP / MOQ */}
                  <td className="px-5 py-3 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                        {item.min_stock || 0}{" "}
                        <span className="text-zinc-400 text-xs font-normal ml-0.5">
                          ROP
                        </span>
                      </span>
                      <span className="text-xs font-medium text-zinc-500 mt-0.5">
                        {item.moq || 0} MOQ
                      </span>
                    </div>
                  </td>

                  {/* Unit Price */}
                  <td className="px-5 py-3 text-right">
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {item.price_per_unit
                        ? formatCurrency(item.price_per_unit)
                        : "—"}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3">
                    <div className="flex justify-center">
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusConfig.bg} ${statusConfig.text}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusConfig.label}
                      </div>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onStockManagement(item);
                        }}
                        title="Manage Stock"
                        className="p-2 bg-zinc-100 hover:bg-blue-100 text-zinc-600 hover:text-blue-600 dark:bg-zinc-800 dark:hover:bg-blue-500/20 dark:text-zinc-400 dark:hover:text-blue-400 rounded-lg transition-colors"
                      >
                        <PackagePlus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteItem(item.item_no);
                        }}
                        title="Delete Item"
                        className="p-2 bg-zinc-100 hover:bg-red-100 text-zinc-600 hover:text-red-600 dark:bg-zinc-800 dark:hover:bg-red-500/20 dark:text-zinc-400 dark:hover:text-red-400 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Load More Footer */}
      {items.length > visibleCount && (
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 flex justify-center">
          <button
            onClick={() =>
              setVisibleCount((c) => Math.min(c + 20, items.length))
            }
            className="flex items-center gap-2 px-6 py-2 bg-white hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 font-bold rounded-xl transition-all shadow-sm text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Load More ({Math.min(20, items.length - visibleCount)} remaining)
          </button>
        </div>
      )}
    </div>
  );
}

export default InventoryListView;
