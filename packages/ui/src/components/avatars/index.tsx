import React, { useState } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../design-system/utils";

const avatarVariants = cva(
  "inline-flex items-center justify-center font-bold uppercase select-none text-white overflow-hidden shrink-0 shadow-sm",
  {
    variants: {
      size: {
        xs: "h-6 w-6 text-[10px]",
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-12 w-12 text-base",
        xl: "h-16 w-16 text-xl",
      },
      shape: {
        circle: "rounded-full",
        square: "rounded-button",
      },
      gradient: {
        primary: "bg-gradient-to-br from-primary to-red-700",
        blue: "bg-gradient-to-br from-blue-500 to-indigo-700",
        green: "bg-gradient-to-br from-green-500 to-emerald-700",
        purple: "bg-gradient-to-br from-purple-500 to-indigo-700",
        amber: "bg-gradient-to-br from-amber-500 to-orange-700",
      },
    },
    defaultVariants: {
      size: "md",
      shape: "circle",
      gradient: "primary",
    },
  }
);

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  fallback?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "User Avatar",
  fallback = "?",
  size,
  shape,
  gradient,
  className,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);

  const initials = fallback
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={cn(avatarVariants({ size, shape, gradient, className }))}
      role="img"
      aria-label={alt}
      {...props}
    >
      {src && !hasError ? (
        <img
          src={src}
          alt={alt}
          onError={() => setHasError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

export default Avatar;
