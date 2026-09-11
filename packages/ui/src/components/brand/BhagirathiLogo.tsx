import React from "react";
import bhagirathiLogoImg from "../../assets/bhagirathi-logo.png";
import { cn } from "../../design-system/utils";

export const BHAGIRATHI_LOGO_URL = bhagirathiLogoImg;

export interface BhagirathiLogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "custom";
  className?: string;
}

const sizeClasses: Record<string, string> = {
  xs: "h-7 w-7 min-w-[28px]",
  sm: "h-8 w-8 min-w-[32px]",
  md: "h-9 w-9 min-w-[36px]",
  lg: "h-10 w-10 min-w-[40px]",
  xl: "h-20 w-20 min-w-[80px]",
  "2xl": "h-24 w-24 min-w-[96px]",
  custom: "",
};

export const BhagirathiLogo: React.FC<BhagirathiLogoProps> = ({
  size = "md",
  className,
  alt = "Bhagirathi",
  ...props
}) => {
  return (
    <img
      src={BHAGIRATHI_LOGO_URL}
      alt={alt}
      className={cn(
        "object-contain shrink-0 select-none",
        sizeClasses[size] || sizeClasses.md,
        className
      )}
      {...props}
    />
  );
};

export default BhagirathiLogo;
