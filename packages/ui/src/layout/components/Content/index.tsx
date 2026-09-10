import React from "react";
import { cn } from "../../../design-system/utils";

// 1. PAGE CONTAINER
export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "flex-1 flex flex-col min-w-0 overflow-hidden bg-background dark:bg-gray-950",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// 2. PAGE CONTENT WRAPPER
export interface PageContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  isFluid?: boolean; // If true, ignore max-w constraint
}

export const PageContent: React.FC<PageContentProps> = ({
  children,
  className,
  isFluid = false,
  ...props
}) => {
  return (
    <main
      className={cn(
        "flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-5 lg:p-6 focus:outline-none",
        isFluid ? "w-full" : "w-full max-w-7xl mx-auto",
        className
      )}
      {...props}
    >
      {children}
    </main>
  );
};

// 3. SECTION CONTAINER
export interface SectionContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  spacing?: "sm" | "md" | "lg";
}

const spacingClasses = {
  sm: "space-y-4",
  md: "space-y-6",
  lg: "space-y-8",
};

export const SectionContainer: React.FC<SectionContainerProps> = ({
  children,
  className,
  spacing = "md",
  ...props
}) => {
  return (
    <div
      className={cn(spacingClasses[spacing], className)}
      {...props}
    >
      {children}
    </div>
  );
};
