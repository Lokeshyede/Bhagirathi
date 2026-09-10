import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { LucideIcon, CheckCircle2, AlertTriangle, AlertCircle, Info, Clock, DollarSign, UserCheck, Home, CalendarRange, Wrench } from "lucide-react";
import { cn } from "../../design-system/utils";

// CVA variants definition
const badgeVariants = cva(
  "inline-flex items-center gap-1 font-bold uppercase tracking-wider select-none shrink-0",
  {
    variants: {
      variant: {
        success: "bg-success-light text-success dark:bg-green-950/20 dark:text-green-400",
        danger: "bg-danger-light text-danger dark:bg-red-950/20 dark:text-red-400",
        warning: "bg-warning-light text-warning dark:bg-amber-950/20 dark:text-amber-400",
        info: "bg-info-light text-info dark:bg-blue-950/20 dark:text-blue-400",
        pending: "bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400",
        paid: "bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-400",
        occupied: "bg-blue-100 text-blue-800 dark:bg-blue-950/20 dark:text-blue-400",
        vacant: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-350",
        reserved: "bg-purple-100 text-purple-800 dark:bg-purple-950/20 dark:text-purple-400",
        maintenance: "bg-orange-100 text-orange-800 dark:bg-orange-950/20 dark:text-orange-400",
        neutral: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-350",
        cancelled: "bg-danger-light text-danger dark:bg-red-950/20 dark:text-red-400",
      },
      size: {
        sm: "px-2 py-0.5 text-[9px] rounded-full",
        md: "px-2.5 py-1 text-[10px] rounded-full",
        lg: "px-3 py-1 text-[11px] rounded-full",
      },
      pill: {
        true: "rounded-full",
        false: "rounded-button",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "md",
      pill: true,
    },
  }
);

// Map badge types to default icons
const defaultBadgeIcons: Record<string, LucideIcon> = {
  success: CheckCircle2,
  paid: DollarSign,
  danger: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  pending: Clock,
  occupied: UserCheck,
  vacant: Home,
  reserved: CalendarRange,
  maintenance: Wrench,
  neutral: Info,
  cancelled: AlertCircle,
};

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  icon?: LucideIcon | boolean; // If true, use default icon for the variant
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = "info",
  size,
  pill,
  icon,
  ...props
}) => {
  let IconToRender: LucideIcon | null = null;
  if (icon && typeof icon === "object") {
    IconToRender = icon;
  } else if (icon === true) {
    IconToRender = defaultBadgeIcons[variant || "info"] || Info;
  }

  return (
    <span
      className={cn(badgeVariants({ variant, size, pill, className }))}
      {...props}
    >
      {IconToRender && (
        <IconToRender className={cn(size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5", "shrink-0")} />
      )}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
