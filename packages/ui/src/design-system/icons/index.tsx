import React from "react";
import { LucideIcon, LucideProps } from "lucide-react";
import { cn } from "../utils";

export type IconSize = 16 | 18 | 20 | 24 | 32;

export const iconSizes: Record<IconSize, string> = {
  16: "h-4 w-4",
  18: "h-4.5 w-4.5",
  20: "h-5 w-5",
  24: "h-6 w-6",
  32: "h-8 w-8",
};

export interface IconProps extends Omit<LucideProps, "size"> {
  icon: LucideIcon;
  size?: IconSize;
}

export const Icon: React.FC<IconProps> = ({ icon: LucideIconComponent, size = 20, className, ...props }) => {
  return <LucideIconComponent className={cn(iconSizes[size], className)} {...props} />;
};

export interface IconContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  size?: IconSize;
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "info" | "reserved" | "maintenance";
  glow?: boolean;
  shape?: "square" | "circle";
  lightBg?: boolean;
}

export const IconContainer: React.FC<IconContainerProps> = ({
  icon: LucideIconComponent,
  size = 20,
  variant = "primary",
  glow = false,
  shape = "square",
  lightBg = true,
  className,
  ...props
}) => {
  const containerVariants = {
    primary: lightBg ? "bg-primary-light text-primary" : "bg-primary text-white",
    secondary: lightBg ? "bg-gray-100 text-text-secondary" : "bg-text-secondary text-white",
    success: lightBg ? "bg-success-light text-success" : "bg-success text-white",
    warning: lightBg ? "bg-warning-light text-warning" : "bg-warning text-white",
    danger: lightBg ? "bg-danger-light text-danger" : "bg-danger text-white",
    info: lightBg ? "bg-info-light text-info" : "bg-info text-white",
    reserved: lightBg ? "bg-purple-100 text-reserved" : "bg-reserved text-white",
    maintenance: lightBg ? "bg-gray-200 text-maintenance" : "bg-maintenance text-white",
  };

  const shapes = {
    square: "rounded-icon", // 12px
    circle: "rounded-full",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center p-2.5 transition-all duration-150 shrink-0 select-none",
        containerVariants[variant],
        shapes[shape],
        glow && "shadow-glow-primary",
        className
      )}
      {...props}
    >
      <Icon icon={LucideIconComponent} size={size} />
    </div>
  );
};
