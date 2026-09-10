import React from "react";
import { cn } from "../utils";

export type BadgeVariant =
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "reserved"
  | "maintenance"
  | "neutral"
  | "paid"
  | "pending"
  | "cancelled";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  outline?: boolean;
  showDot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = "neutral",
  outline = false,
  showDot = false,
  ...props
}) => {
  const baseStyles = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-badge text-xs font-semibold select-none border transition-colors duration-150";

  const variants = {
    neutral: outline
      ? "bg-transparent text-text-secondary border-border"
      : "bg-gray-150 text-text-primary border-transparent dark:bg-gray-800 dark:text-gray-200",
    success: outline
      ? "bg-transparent text-success border-success/30"
      : "bg-success-light text-success border-transparent",
    danger: outline
      ? "bg-transparent text-danger border-danger/30"
      : "bg-danger-light text-danger border-transparent",
    warning: outline
      ? "bg-transparent text-warning border-warning/30"
      : "bg-warning-light text-warning border-transparent",
    info: outline
      ? "bg-transparent text-info border-info/30"
      : "bg-info-light text-info border-transparent",
    reserved: outline
      ? "bg-transparent text-reserved border-reserved/30"
      : "bg-purple-100 text-reserved border-transparent",
    maintenance: outline
      ? "bg-transparent text-maintenance border-maintenance/30"
      : "bg-gray-200 text-maintenance border-transparent",
    // Special payment/billing states
    paid: outline
      ? "bg-transparent text-success border-success/30"
      : "bg-success-light text-success border-transparent",
    pending: outline
      ? "bg-transparent text-warning border-warning/30"
      : "bg-warning-light text-warning border-transparent",
    cancelled: outline
      ? "bg-transparent text-danger border-danger/30"
      : "bg-danger-light text-danger border-transparent",
  };

  const dotColors = {
    neutral: "bg-text-secondary",
    success: "bg-success",
    danger: "bg-danger",
    warning: "bg-warning",
    info: "bg-info",
    reserved: "bg-reserved",
    maintenance: "bg-maintenance",
    paid: "bg-success",
    pending: "bg-warning",
    cancelled: "bg-danger",
  };

  return (
    <span className={cn(baseStyles, variants[variant], className)} {...props}>
      {showDot && (
        <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotColors[variant])} />
      )}
      {children}
    </span>
  );
};

export default Badge;
