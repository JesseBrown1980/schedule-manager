import {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { cn } from "@/lib/cn";
import {
  CheckCircleIcon,
  AlertCircleIcon,
  AlertTriangleIcon,
  InfoIcon,
  XIcon,
} from "./icons";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback(
    (title: string, description?: string) => {
      addToast({ type: "success", title, description, duration: 4000 });
    },
    [addToast]
  );

  const error = useCallback(
    (title: string, description?: string) => {
      addToast({ type: "error", title, description, duration: 6000 });
    },
    [addToast]
  );

  const warning = useCallback(
    (title: string, description?: string) => {
      addToast({ type: "warning", title, description, duration: 5000 });
    },
    [addToast]
  );

  const info = useCallback(
    (title: string, description?: string) => {
      addToast({ type: "info", title, description, duration: 4000 });
    },
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, success, error, warning, info }}
    >
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-[100]",
        "flex flex-col gap-2",
        "max-w-sm w-full pointer-events-none"
      )}
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const timerRef = useRef<number | null>(null);
  const [isExiting, setIsExiting] = useState(false);

  const dismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(toast.id);
    }, 200);
  }, [onDismiss, toast.id]);

  useEffect(() => {
    const duration = toast.duration ?? 4000;
    timerRef.current = window.setTimeout(dismiss, duration);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [dismiss, toast.duration]);

  const handleMouseEnter = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const handleMouseLeave = () => {
    const duration = toast.duration ?? 4000;
    timerRef.current = window.setTimeout(dismiss, duration / 2);
  };

  const styles = {
    success: {
      bg: "bg-white",
      border: "border-green-200",
      icon: <CheckCircleIcon size={20} className="text-green-500" />,
    },
    error: {
      bg: "bg-white",
      border: "border-red-200",
      icon: <AlertCircleIcon size={20} className="text-red-500" />,
    },
    warning: {
      bg: "bg-white",
      border: "border-amber-200",
      icon: <AlertTriangleIcon size={20} className="text-amber-500" />,
    },
    info: {
      bg: "bg-white",
      border: "border-blue-200",
      icon: <InfoIcon size={20} className="text-blue-500" />,
    },
  };

  const style = styles[toast.type];

  return (
    <div
      className={cn(
        "pointer-events-auto",
        "rounded-xl border shadow-lg",
        "p-4 flex items-start gap-3",
        style.bg,
        style.border,
        isExiting
          ? "animate-out fade-out slide-out-to-right duration-200"
          : "animate-in fade-in slide-in-from-right duration-300"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">{style.icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-content">{toast.title}</p>
        {toast.description && (
          <p className="mt-1 text-sm text-content-secondary">
            {toast.description}
          </p>
        )}
      </div>
      <button
        onClick={dismiss}
        className={cn(
          "flex-shrink-0 p-1 rounded-lg",
          "text-content-tertiary hover:text-content",
          "hover:bg-slate-100 transition-colors"
        )}
        aria-label="Dismiss notification"
      >
        <XIcon size={16} />
      </button>
    </div>
  );
}
