import React from "react";
import bhagirathiLogoImg from "../../assets/bhagirathi-logo.png";
import { cn } from "../../design-system/utils";

export const BHAGIRATHI_LOGO_URL = bhagirathiLogoImg;

export interface BhagirathiLogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "custom";
  className?: string;
}

const sizeClasses: Record<string, string> = {
  xs: "h-7 w-auto max-h-[28px]",
  sm: "h-8 w-auto max-h-[32px]",
  md: "h-10 w-auto max-h-[40px]",
  lg: "h-12 w-auto max-h-[48px]",
  xl: "h-20 w-auto max-h-[80px]",
  "2xl": "h-24 w-auto max-h-[96px]",
  custom: "",
};

export const BhagirathiLogo: React.FC<BhagirathiLogoProps> = ({
  size = "md",
  className,
  alt = "Bhagirathi Hostel & PG",
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
