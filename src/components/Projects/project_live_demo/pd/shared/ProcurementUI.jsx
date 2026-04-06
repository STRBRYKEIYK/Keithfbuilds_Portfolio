import React from "react";
import { useAuth } from "../../../contexts/AuthContext";

// ─── Refined Design Tokens ──────────────────────────────────────────────────
const colorStyles = {
  slate: {
    badge: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-300 ring-1 ring-zinc-200/50 dark:ring-zinc-700/50",
    iconBg: "bg-zinc-100 dark:bg-zinc-800",
    iconColor: "text-zinc-600 dark:text-zinc-400",
  },
  blue: {
    badge: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 ring-1 ring-blue-500/20",
    iconBg: "bg-blue-100 dark:bg-blue-500/20",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  green: {
    badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 ring-1 ring-emerald-500/20",
    iconBg: "bg-emerald-100 dark:bg-emerald-500/20",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  amber: {
    badge: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 ring-1 ring-amber-500/20",
    iconBg: "bg-amber-100 dark:bg-amber-500/20",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  red: {
    badge: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 ring-1 ring-red-500/20",
    iconBg: "bg-red-100 dark:bg-red-500/20",
    iconColor: "text-red-600 dark:text-red-400",
  },
  purple: {
    badge: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 ring-1 ring-purple-500/20",
    iconBg: "bg-purple-100 dark:bg-purple-500/20",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
};

// ─── Section Card ───────────────────────────────────────────────────────────
export function ProcurementSectionCard({
  title,
  description,
  action,
  children,
  className = "",
}) {
  return (
    <section
      className={`bg-white dark:bg-zinc-900/40 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm overflow-hidden transition-all ${className}`}
    >
      {(title || action || description) && (
        <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            {title && (
              <h3 className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
                {title}
              </h3>
            )}
            {description && (
              <p className="mt-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                {description}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </section>
  );
}

// ─── Stat Card ──────────────────────────────────────────────────────────────
export function ProcurementStatCard({
  label,
  value,
  helper,
  icon,
  color = "slate",
}) {
  const palette = colorStyles[color] || colorStyles.slate;

  return (
    <div className="group relative bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-800/80 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/50 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
      {/* Subtle top highlight on hover */}
      <div 
        className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-10 transition-opacity" 
        style={{ color: 'inherit' }} 
      />
      
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-1.5">
            {label}
          </p>
          <p className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            {value}
          </p>
          {helper && (
            <p className="mt-1.5 text-xs font-semibold text-zinc-400 dark:text-zinc-500 line-clamp-1">
              {helper}
            </p>
          )}
        </div>
        
        {icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${palette.iconBg} ${palette.iconColor}`}>
            {/* The icon prop should ideally be a Lucide React component instance, e.g., <Package className="w-5 h-5" /> */}
            <span className="flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5">
              {icon}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Status Pill ────────────────────────────────────────────────────────────
export function ProcurementPill({ children, color = "slate", className = "" }) {
  const palette = colorStyles[color] || colorStyles.slate;
  
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-bold shadow-sm backdrop-blur-sm ${palette.badge} ${className}`}
    >
      {children}
    </span>
  );
}