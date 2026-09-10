import React from "react";
import { cn } from "../utils";

export type TypographyVariant =
  | "display"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "title"
  | "subtitle"
  | "body"
  | "small"
  | "caption"
  | "xxs";

export type FontWeight = "normal" | "medium" | "semibold" | "bold" | "extrabold";

const fontWeights: Record<FontWeight, string> = {
  normal: "font-normal", // 400
  medium: "font-medium", // 500
  semibold: "font-semibold", // 600
  bold: "font-bold", // 700
  extrabold: "font-extrabold", // 800
};

const typographyStyles: Record<TypographyVariant, string> = {
  display: "text-display font-extrabold",
  h1: "text-h1 font-extrabold tracking-tight",
  h2: "text-h2 font-bold tracking-tight",
  h3: "text-h3 font-semibold tracking-tight",
  h4: "text-h4 font-semibold",
  title: "text-title font-semibold",
  subtitle: "text-subtitle font-medium",
  body: "text-body font-normal text-text-primary",
  small: "text-small font-normal text-text-secondary",
  caption: "text-caption font-normal text-text-muted",
  xxs: "text-xxs font-normal uppercase tracking-wider text-text-muted",
};

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TypographyVariant;
  weight?: FontWeight;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div" | "label";
}

export const Typography: React.FC<TypographyProps> = ({
  children,
  variant = "body",
  weight,
  as: Component = "p",
  className,
  ...props
}) => {
  return (
    <Component
      className={cn(
        typographyStyles[variant],
        weight && fontWeights[weight],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

export const Text = Typography;
export default Typography;
