import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../design-system/utils";
import { AnimateHeight } from "../animations";

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultExpandedIds?: string[];
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  allowMultiple = false,
  defaultExpandedIds = [],
  className,
}) => {
  const [expandedIds, setExpandedIds] = useState<string[]>(defaultExpandedIds);

  const handleToggle = (id: string) => {
    setExpandedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return allowMultiple ? [...prev, id] : [id];
      }
    });
  };

  return (
    <div className={cn("space-y-2 select-none", className)}>
      {items.map((item) => {
        const isExpanded = expandedIds.includes(item.id);

        return (
          <div
            key={item.id}
            className="border border-border rounded-card bg-white dark:bg-gray-900 dark:border-gray-800 overflow-hidden"
          >
            {/* Header Trigger */}
            <button
              onClick={() => handleToggle(item.id)}
              className="w-full flex items-center justify-between px-5 py-4 text-xs font-bold uppercase tracking-wider text-text-primary hover:bg-background/50 transition duration-150 outline-none dark:text-white dark:hover:bg-gray-850"
              aria-expanded={isExpanded}
            >
              <span>{item.title}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-text-muted transition-transform duration-200",
                  isExpanded && "transform rotate-180"
                )}
              />
            </button>

            {/* Content Drawer */}
            <AnimateHeight isOpen={isExpanded}>
              <div className="px-5 pb-5 pt-1 text-xs text-text-secondary dark:text-gray-300 leading-relaxed border-t border-divider/40 dark:border-gray-800/40">
                {item.content}
              </div>
            </AnimateHeight>
          </div>
        );
      })}
    </div>
  );
};

export default Accordion;
