import React, { useEffect } from "react";
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info as InfoIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../design-system/utils";

// 1. ALERT BANNER
const alertVariants = cva(
  "relative p-4 rounded-card border flex gap-3 text-xs leading-relaxed transition-all select-none",
  {
    variants: {
      variant: {
        success: "bg-success-light border-success/20 text-success dark:bg-green-950/20 dark:border-green-900/30 dark:text-green-400",
        error: "bg-danger-light border-danger/20 text-danger dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400",
        warning: "bg-warning-light border-warning/20 text-warning dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400",
        info: "bg-info-light border-info/20 text-info dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-400",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
);

const alertIcons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: InfoIcon,
};

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  onClose?: () => void;
  title?: string;
}

export const Alert: React.FC<AlertProps> = ({
  children,
  className,
  variant = "info",
  title,
  onClose,
  ...props
}) => {
  const Icon = alertIcons[variant || "info"];

  return (
    <div className={cn(alertVariants({ variant, className }))} {...props}>
      <span className="p-0.5 shrink-0">
        <Icon className="h-4.5 w-4.5" />
      </span>
      <div className="flex-1 space-y-1">
        {title && <p className="font-extrabold tracking-wide uppercase text-[10px]">{title}</p>}
        <div>{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded-button hover:bg-black/5 dark:hover:bg-white/5 transition self-start shrink-0 cursor-pointer"
          aria-label="Close alert"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};

// 2. TOAST NOTIFICATIONS
export interface ToastItem {
  id: string;
  message: string;
  title?: string;
  variant?: "success" | "error" | "warning" | "info";
  duration?: number;
}

export interface ToastProps extends ToastItem {
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  title,
  message,
  variant = "info",
  duration = 4000,
  onClose,
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => onClose(id), duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const Icon = alertIcons[variant];
  const borderColors = {
    success: "border-success",
    error: "border-danger",
    warning: "border-warning",
    info: "border-info",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.16 }}
      className={cn(
        "flex gap-3.5 p-4 w-80 bg-white dark:bg-gray-900 border-l-4 rounded-r-card shadow-dialog border-border dark:border-gray-800",
        borderColors[variant]
      )}
    >
      <span className={cn(
        "p-1.5 rounded-icon flex items-center justify-center shrink-0 h-8 w-8",
        variant === "success" && "bg-success/10 text-success",
        variant === "error" && "bg-danger/10 text-danger",
        variant === "warning" && "bg-warning/10 text-warning",
        variant === "info" && "bg-info/10 text-info"
      )}>
        <Icon className="h-4.5 w-4.5" />
      </span>

      <div className="flex-1 overflow-hidden">
        {title && (
          <p className="text-xs font-bold text-text-primary dark:text-white truncate leading-none mb-1">
            {title}
          </p>
        )}
        <p className="text-[10px] text-text-secondary dark:text-gray-300 leading-normal">
          {message}
        </p>
      </div>

      <button
        onClick={() => onClose(id)}
        className="p-1 text-text-muted hover:text-text-primary dark:hover:text-white transition shrink-0 self-start cursor-pointer"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
};

// 3. TOAST CONTAINER STACK
export interface ToastContainerProps {
  toasts: ToastItem[];
  onClose: (id: string) => void;
  position?: "top-right" | "bottom-right" | "top-left" | "bottom-left";
}

const positionStacks = {
  "top-right": "top-5 right-5 flex-col-reverse",
  "bottom-right": "bottom-5 right-5 flex-col",
  "top-left": "top-5 left-5 flex-col-reverse",
  "bottom-left": "bottom-5 left-5 flex-col",
};

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onClose,
  position = "top-right",
}) => {
  return (
    <div className={cn("fixed z-50 flex gap-2.5 pointer-events-auto", positionStacks[position])}>
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export * from "./ErrorBoundary";
