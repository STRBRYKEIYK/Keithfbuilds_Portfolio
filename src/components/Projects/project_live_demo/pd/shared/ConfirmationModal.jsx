import { memo } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import ModalPortal from "./ModalPortal";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";

function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning", // warning, danger, info
}) {
  const { isDarkMode } = useAuth();
  
  if (!isOpen) return null;

  // Dynamic semantic styling based on the type of confirmation
  const getTypeConfig = () => {
    switch (type) {
      case "danger":
        return {
          icon: AlertTriangle,
          iconWrapper: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border border-red-100 dark:border-red-500/20",
          confirmBtn: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500/50",
        };
      case "warning":
        return {
          icon: AlertCircle,
          iconWrapper: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20",
          confirmBtn: "bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500/50",
        };
      default: // info
        return {
          icon: Info,
          iconWrapper: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20",
          confirmBtn: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500/50",
        };
    }
  };

  const config = getTypeConfig();
  const Icon = config.icon;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <ModalPortal>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[10005] flex items-center justify-center p-4 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
        
        {/* Modal Card */}
        <div 
          className="relative w-full max-w-md bg-white dark:bg-zinc-950 rounded-[2rem] shadow-2xl border border-zinc-200/60 dark:border-zinc-800/60 overflow-hidden animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-8 flex flex-col items-center text-center">
            
            {/* Focal Icon */}
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 shadow-sm ${config.iconWrapper}`}>
              <Icon className="w-8 h-8" strokeWidth={2.5} />
            </div>
            
            {/* Text Content */}
            <h3 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-2 leading-tight">
              {title}
            </h3>
            
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
              {message}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row w-full gap-3">
              <button
                onClick={onClose}
                className="w-full sm:flex-1 py-3.5 px-4 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700"
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                className={`w-full sm:flex-1 py-3.5 px-4 font-bold rounded-xl transition-all shadow-sm active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-zinc-950 ${config.confirmBtn}`}
              >
                {confirmText}
              </button>
            </div>

          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

// Memoize to prevent unnecessary re-renders when parent states change
export default memo(ConfirmationModal);