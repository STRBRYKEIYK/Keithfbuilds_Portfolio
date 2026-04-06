import { 
  X, 
  Trash2, 
  BellRing, 
  Clock, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle2 
} from "lucide-react"
import { useAuth } from "../../../contexts/AuthContext"

export default function NotificationModal({ 
  notification, 
  isOpen, 
  onClose, 
  onMarkAsRead, 
  onDismiss, 
  isDarkMode: forcedDarkMode 
}) {
  // Allow parent to pass isDarkMode, else fall back to context
  const { isDarkMode: contextDark } = useAuth()
  const isDarkMode = typeof forcedDarkMode === 'boolean' ? forcedDarkMode : contextDark

  if (!isOpen || !notification) return null

  const handleMarkAsRead = () => {
    onMarkAsRead(notification.id)
    onClose()
  }

  const handleDismiss = () => {
    onDismiss(notification.id)
    onClose()
  }

  // Priority-based color schemes using soft Tailwind semantic tokens
  const getPriorityTheme = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
      case 'urgent':
      case 'critical':
        return {
          baseColor: 'red',
          bg: 'bg-red-50 dark:bg-red-500/10',
          border: 'border-red-200 dark:border-red-500/20',
          text: 'text-red-600 dark:text-red-400',
          button: 'bg-red-600 hover:bg-red-700 text-white',
          glow: 'shadow-[0_0_30px_-5px_rgba(239,68,68,0.3)]',
          icon: AlertTriangle
        }
      case 'medium':
      case 'warning':
        return {
          baseColor: 'amber',
          bg: 'bg-amber-50 dark:bg-amber-500/10',
          border: 'border-amber-200 dark:border-amber-500/20',
          text: 'text-amber-600 dark:text-amber-400',
          button: 'bg-amber-600 hover:bg-amber-700 text-white',
          glow: 'shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)]',
          icon: AlertCircle
        }
      case 'low':
        return {
          baseColor: 'emerald',
          bg: 'bg-emerald-50 dark:bg-emerald-500/10',
          border: 'border-emerald-200 dark:border-emerald-500/20',
          text: 'text-emerald-600 dark:text-emerald-400',
          button: 'bg-emerald-600 hover:bg-emerald-700 text-white',
          glow: 'shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]',
          icon: Info
        }
      default:
        return {
          baseColor: 'blue',
          bg: 'bg-blue-50 dark:bg-blue-500/10',
          border: 'border-blue-200 dark:border-blue-500/20',
          text: 'text-blue-600 dark:text-blue-400',
          button: 'bg-blue-600 hover:bg-blue-700 text-white',
          glow: 'shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]',
          icon: BellRing
        }
    }
  }

  const theme = getPriorityTheme(notification.priority)
  const ThemeIcon = theme.icon

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Click-away backdrop catcher */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Modal Card */}
      <div 
        className="relative w-full max-w-md bg-white dark:bg-zinc-950 rounded-[2rem] shadow-2xl border border-zinc-200/60 dark:border-zinc-800/60 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors z-10 focus:outline-none"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 flex flex-col items-center text-center">
          
          {/* Priority Icon */}
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 border transition-all ${theme.bg} ${theme.border} ${theme.text} ${theme.glow}`}>
            <ThemeIcon className="w-8 h-8" />
          </div>

          {/* Priority Badge */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider mb-4 border ${theme.bg} ${theme.border} ${theme.text}`}>
            {notification.priority || 'Normal'} Priority
          </div>

          {/* Title & Meta */}
          <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-3 leading-tight">
            {notification.title}
          </h2>

          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-6">
            <Clock className="w-3.5 h-3.5" />
            <span>{notification.time}</span>
            {!notification.read && (
              <span className="flex h-2 w-2 relative ml-1">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${theme.text.split(' ')[0].replace('text', 'bg')}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${theme.text.split(' ')[0].replace('text', 'bg')}`}></span>
              </span>
            )}
          </div>

          {/* Message Content Area */}
          <div className="w-full bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-5 border border-zinc-100 dark:border-zinc-800/80 mb-8">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300 leading-relaxed text-left">
              {notification.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            <button
              onClick={handleDismiss}
              className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-zinc-600 dark:text-zinc-300 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700"
            >
              <Trash2 className="w-4 h-4" />
              <span>Dismiss</span>
            </button>

            {!notification.read && (
              <button
                onClick={handleMarkAsRead}
                className={`w-full sm:flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition-all shadow-sm active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-zinc-950 ${theme.button}`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark as Read</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}