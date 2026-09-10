import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "../utils";
import { Icon } from "../icons";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "success" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  type = "button",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold transition-all duration-150 rounded-button select-none outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

  const variants = {
    primary: "bg-primary text-white hover:bg-primary-hover focus:ring-primary/45 border border-transparent",
    secondary: "bg-white text-text-primary border border-border hover:bg-background focus:ring-text-primary/15",
    outline: "bg-transparent text-text-primary border border-border hover:bg-background focus:ring-primary/45",
    ghost: "bg-transparent text-text-secondary hover:bg-background hover:text-text-primary border border-transparent focus:ring-text-secondary/15",
    success: "bg-success text-white hover:bg-success/90 focus:ring-success/45 border border-transparent",
    danger: "bg-danger text-white hover:bg-danger/90 focus:ring-danger/45 border border-transparent",
  };

  const sizes = {
    sm: "h-9 px-3 text-xs gap-1.5",
    md: "h-10 px-5 text-sm gap-2",
    lg: "h-12 px-6 text-base gap-2.5",
  };

  const isBtnDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      disabled={isBtnDisabled}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin h-4 w-4 shrink-0 text-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {!isLoading && leftIcon && <Icon icon={leftIcon} size={size === "sm" ? 16 : 18} />}
      <span className="truncate">{children}</span>
      {!isLoading && rightIcon && <Icon icon={rightIcon} size={size === "sm" ? 16 : 18} />}
    </button>
  );
};

// Specialized Icon Button
export interface IconButtonProps extends Omit<ButtonProps, "leftIcon" | "rightIcon" | "children"> {
  icon: LucideIcon;
  "aria-label": string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  className,
  size = "md",
  variant = "secondary",
  ...props
}) => {
  const iconButtonSizes = {
    sm: "h-9 w-9 p-0",
    md: "h-10 w-10 p-0",
    lg: "h-12 w-12 p-0",
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(iconButtonSizes[size], "rounded-full", className)}
      {...props}
    >
      <Icon icon={icon} size={size === "sm" ? 18 : 20} />
    </Button>
  );
};

// Floating Action Button (FAB)
export interface FloatingButtonProps extends ButtonProps {
  icon: LucideIcon;
}

export const FloatingButton: React.FC<FloatingButtonProps> = ({
  icon,
  children,
  className,
  variant = "primary",
  size,
  isLoading,
  leftIcon,
  rightIcon,
  fullWidth,
  onDrag,
  onDragStart,
  onDragEnd,
  onAnimationStart,
  ...props
}) => {
  return (
    <motion.button
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      type="button"
      className={cn(
        "fixed bottom-8 right-8 z-40 flex items-center justify-center gap-2 rounded-full px-5 py-3.5 shadow-lg select-none outline-none focus:ring-2 focus:ring-offset-2",
        variant === "primary" ? "bg-primary hover:bg-primary-hover text-white focus:ring-primary/45" : "bg-white text-text-primary hover:bg-background focus:ring-text-primary/15 border border-border",
        className
      )}
      {...props}
    >
      <Icon icon={icon} size={20} />
      {children && <span className="text-sm font-semibold tracking-wide pr-1">{children}</span>}
    </motion.button>
  );
};
export default Button;
