import { useState, createContext, useContext, useCallback, memo } from "react";
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  Loader2, 
  X 
} from "lucide-react";

// Toast Context
const ToastContext = createContext();

// Custom hook for using toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

// Toast Provider Component
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // Check for duplicates within 1 second
  const isDuplicate = useCallback((newToast) => {
    const now = Date.now();
    return toasts.some(toast => 
      toast.title === newToast.title &&
      toast.message === newToast.message &&
      toast.type === newToast.type &&
      (now - toast.timestamp) < 1000
    );
  }, [toasts]);

  const showToast = useCallback((title, message = "", type = "success", duration = 4000) => {
    const newToast = {
      id: Date.now() + Math.random(),
      title,
      message,
      type,
      timestamp: Date.now(),
      duration
    };

    // Prevent duplicates
    if (isDuplicate(newToast)) {
      return;
    }

    setToasts(prev => {
      // Limit to 3 toasts max to prevent screen clutter
      const updated = [newToast, ...prev].slice(0, 3);
      return updated;
    });

    // Auto dismiss
    if (duration > 0) {
      setTimeout(() => {
        dismissToast(newToast.id);
      }, duration);
    }
  }, [isDuplicate]);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const value = {
    toasts,
    showToast,
    dismissToast,
    success: (title, message = "") => showToast(title, message, "success", 4000),
    error: (title, message = "") => showToast(title, message, "error", 6000),
    warning: (title, message = "") => showToast(title, message, "warning", 5000),
    info: (title, message = "") => showToast(title, message, "info", 4000),
    loading: (title, message = "") => showToast(title, message, "loading", 0)
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

// Toast Container Component (Memoized)
const ToastContainer = memo(function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[10000] flex flex-col gap-3 pointer-events-none max-w-sm w-full px-4 sm:px-0">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
});

// Individual Toast Component (Memoized)
const ToastItem = memo(function ToastItem({ toast, onDismiss }) {
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(toast.id);
    }, 400); // Matches the exit animation duration
  };

  const getToastStyles = () => {
    switch (toast.type) {
      case "success":
        return {
          icon: <CheckCircle2 className="w-5 h-5" />,
          iconContainer: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20"
        };
      case "error":
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          iconContainer: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border border-red-100 dark:border-red-500/20"
        };
      case "warning":
        return {
          icon: <AlertTriangle className="w-5 h-5" />,
          iconContainer: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20"
        };
      case "info":
        return {
          icon: <Info className="w-5 h-5" />,
          iconContainer: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20"
        };
      case "loading":
        return {
          icon: <Loader2 className="w-5 h-5 animate-spin" />,
          iconContainer: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700"
        };
      default:
        return {
          icon: <Info className="w-5 h-5" />,
          iconContainer: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700"
        };
    }
  };

  const styles = getToastStyles();

  return (
    <div
      className={`
        pointer-events-auto w-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-xl rounded-2xl p-4
        transform transition-all duration-400 ease-out
        ${isExiting 
          ? 'translate-x-full opacity-0 scale-90' 
          : 'translate-x-0 opacity-100 scale-100 animate-toast-slide-in'
        }
        hover:shadow-2xl hover:-translate-y-0.5
      `}
      role="alert"
      aria-live={toast.type === "error" ? "assertive" : "polite"}
    >
      <div className="flex items-start gap-3.5">
        <div className={`shrink-0 flex items-center justify-center w-10 h-10 rounded-xl shadow-sm ${styles.iconContainer}`}>
          {styles.icon}
        </div>
        
        <div className="flex-1 min-w-0 pt-0.5">
          {toast.title && (
            <h4 className="text-sm font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight mb-1">
              {toast.title}
            </h4>
          )}
          {toast.message && (
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {toast.message}
            </p>
          )}
        </div>
        
        {toast.type !== "loading" && (
          <button
            onClick={handleDismiss}
            className="shrink-0 p-1.5 -mr-1 -mt-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:text-zinc-300 dark:hover:bg-zinc-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
});

// Inject custom spring animation styles
const animationStyles = `
  @keyframes toast-slide-in {
    0% {
      transform: translateX(100%) scale(0.9);
      opacity: 0;
    }
    100% {
      transform: translateX(0) scale(1);
      opacity: 1;
    }
  }

  .animate-toast-slide-in {
    animation: toast-slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
`;

if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = animationStyles;
  document.head.appendChild(styleElement);
}

export default ToastProvider;