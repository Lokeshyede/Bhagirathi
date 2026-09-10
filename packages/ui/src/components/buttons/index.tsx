import React, { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "../../design-system/utils";

// CVA variants definition
const buttonVariants = cva(
  "inline-flex items-center justify-center font-bold uppercase tracking-wider select-none outline-none transition duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 rounded-button focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white hover:bg-primary-hover focus:ring-primary/45 border border-transparent",
        secondary: "bg-white text-text-primary border border-border hover:bg-background focus:ring-text-primary/15 dark:bg-gray-900 dark:border-gray-800 dark:text-white dark:hover:bg-gray-850",
        outline: "bg-transparent text-text-primary border border-border hover:bg-background focus:ring-primary/45 dark:text-white dark:border-gray-800 dark:hover:bg-gray-850",
        ghost: "bg-transparent text-text-secondary hover:bg-background hover:text-text-primary border border-transparent focus:ring-text-secondary/15 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white",
        success: "bg-success text-white hover:bg-success/90 focus:ring-success/45 border border-transparent",
        danger: "bg-danger text-white hover:bg-danger/90 focus:ring-danger/45 border border-transparent",
      },
      size: {
        sm: "h-9 px-3.5 text-[10px] gap-1.5",
        md: "h-10 px-5 text-xs gap-2",
        lg: "h-12 px-6.5 text-sm gap-2.5",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color">,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant,
      size,
      fullWidth,
      isLoading = false,
      disabled = false,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      type = "button",
      ...props
    },
    ref
  ) => {
    const isBtnDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isBtnDisabled}
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin h-3.5 w-3.5 shrink-0 text-current"
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

        {!isLoading && LeftIcon && <LeftIcon className={cn(size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4", "shrink-0")} />}
        <span>{children}</span>
        {!isLoading && RightIcon && <RightIcon className={cn(size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4", "shrink-0")} />}
      </button>
    );
  }
);

Button.displayName = "Button";

// Reusable IconButton Component
export interface IconButtonProps extends Omit<ButtonProps, "leftIcon" | "rightIcon" | "children"> {
  icon: LucideIcon;
  "aria-label": string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon: Icon, className, size = "md", variant = "secondary", ...props }, ref) => {
    const iconButtonSizes = {
      sm: "h-9 w-9 p-0 rounded-full",
      md: "h-10 w-10 p-0 rounded-full",
      lg: "h-12 w-12 p-0 rounded-full",
    };

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(iconButtonSizes[size || "md"], className)}
        {...props}
      >
        <Icon className={size === "sm" ? "h-4 w-4" : "h-4.5 w-4.5"} />
      </Button>
    );
  }
);

IconButton.displayName = "IconButton";

// Reusable FloatingActionButton (FAB)
export interface FloatingButtonProps extends Omit<ButtonProps, "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> {
  icon: LucideIcon;
}

export const FloatingButton = forwardRef<HTMLButtonElement, FloatingButtonProps>(
  ({ icon: Icon, children, className, variant = "primary", isLoading, leftIcon, rightIcon, fullWidth, size, ...props }, ref) => {
    return (
      <motion.button
        whileHover={{ y: -3, scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        type="button"
        className={cn(
          "fixed bottom-8 right-8 z-40 flex items-center justify-center gap-2 rounded-full px-5 py-3.5 shadow-lg select-none outline-none focus:ring-2 focus:ring-offset-2",
          variant === "primary" ? "bg-primary hover:bg-primary-hover text-white focus:ring-primary/45" : "bg-white text-text-primary hover:bg-background focus:ring-text-primary/15 border border-border dark:bg-gray-900 dark:border-gray-800 dark:text-white dark:hover:bg-gray-850",
          className
        )}
        {...props}
      >
        <Icon className="h-5 w-5" />
        {children && <span className="text-xs font-bold uppercase tracking-wider pr-1">{children}</span>}
      </motion.button>
    );
  }
);

FloatingButton.displayName = "FloatingButton";

// Reusable ButtonGroup Wrapper
export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        "inline-flex rounded-button overflow-hidden border border-border dark:border-gray-800 divide-x divide-border dark:divide-gray-800 shadow-sm",
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          const childEl = child as React.ReactElement<{ className?: string }>;
          return React.cloneElement(childEl, {
            className: cn(
              childEl.props.className,
              "rounded-none border-none shadow-none first:rounded-l-button last:rounded-r-button active:scale-100"
            ),
          });
        }
        return child;
      })}
    </div>
  );
};

