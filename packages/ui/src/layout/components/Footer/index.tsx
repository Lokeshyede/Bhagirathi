import React from "react";
import { cn } from "../../../design-system/utils";

export interface FooterProps {
  systemName?: string;
  version?: string;
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({
  systemName = "Bhagirathi Hostel & PG Management System",
  version = "v1.0",
  className,
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "flex-shrink-0 py-3.5 px-6 bg-white border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-text-secondary select-none dark:bg-gray-900 dark:border-gray-800",
        className
      )}
    >
      <p className="font-semibold text-center sm:text-left">
        {systemName} — {version}
      </p>
      <p className="text-text-muted dark:text-gray-500 font-medium">
        © {currentYear} All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
