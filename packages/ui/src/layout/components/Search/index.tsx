import React, { useState, useEffect, useRef } from "react";
import { Search, CornerDownLeft, Sparkles, Building2, Users, Home, CreditCard, MessageSquare, Megaphone, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../../design-system/utils";
import { SearchOption } from "../../types";

// 1. SEARCH TRIGGER
export interface SearchTriggerProps {
  onClick: () => void;
  className?: string;
  placeholder?: string;
}

export const SearchTrigger: React.FC<SearchTriggerProps> = ({
  onClick,
  className,
  placeholder = "Search or type command...",
}) => {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMac(/Mac|iPod|iPhone|iPad/.test(navigator.platform));
    }
  }, []);

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex h-9 w-full max-w-xs items-center justify-between gap-3 rounded-input border border-border bg-sidebar hover:bg-white px-3 text-xs text-text-secondary select-none outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition dark:bg-gray-850 dark:border-gray-800 dark:hover:bg-gray-800 dark:text-gray-400",
        className
      )}
    >
      <div className="flex items-center gap-2 truncate">
        <Search className="h-3.5 w-3.5 shrink-0 text-text-muted" />
        <span className="truncate">{placeholder}</span>
      </div>
      <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-bold text-text-muted dark:bg-gray-900 dark:border-gray-800">
        <span>{isMac ? "⌘" : "Ctrl"}</span>
        <span>K</span>
      </kbd>
    </button>
  );
};

// 2. COMMAND PALETTE MODAL
export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  options: SearchOption[];
  placeholder?: string;
}

const categoryIcons: Record<SearchOption["category"], any> = {
  hostel: Building2,
  building: Building2,
  floor: Building2,
  room: Home,
  bed: Home,
  tenant: Users,
  payment: CreditCard,
  complaint: MessageSquare,
  notice: Megaphone,
  action: Terminal,
};

const categoryLabels: Record<SearchOption["category"], string> = {
  hostel: "Hostels",
  building: "Buildings",
  floor: "Floors",
  room: "Rooms",
  bed: "Beds",
  tenant: "Tenants",
  payment: "Payments",
  complaint: "Complaints",
  notice: "Notices",
  action: "Actions",
};

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  options,
  placeholder = "Search tenants, rooms, actions...",
}) => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Filter options
  const filtered = options.filter((opt) => {
    const term = query.toLowerCase();
    return (
      opt.label.toLowerCase().includes(term) ||
      opt.description?.toLowerCase().includes(term) ||
      opt.category.toLowerCase().includes(term)
    );
  });

  // Group by category
  const groups: Record<string, SearchOption[]> = {};
  filtered.forEach((opt) => {
    if (!groups[opt.category]) {
      groups[opt.category] = [];
    }
    groups[opt.category].push(opt);
  });

  const categoriesOrder = Object.keys(groups);
  const flatItems = categoriesOrder.flatMap((cat) => groups[cat]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (flatItems.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % flatItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + flatItems.length) % flatItems.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = flatItems[selectedIndex];
      if (selected) {
        selected.onClick();
        onClose();
      }
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (containerRef.current) {
      const activeEl = containerRef.current.querySelector(".is-active-search-item");
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh]">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/45 backdrop-blur-[3px]"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -10 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="bg-white dark:bg-gray-900 rounded-dialog shadow-dialog w-full max-w-lg overflow-hidden flex flex-col border border-border dark:border-gray-800 z-10 max-h-[70vh]"
          >
            {/* Input Bar */}
            <div className="relative flex items-center border-b border-border dark:border-gray-800 p-4">
              <Search className="absolute left-4.5 h-4.5 w-4.5 text-text-muted" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="w-full pl-9 pr-4 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none dark:text-white"
              />
            </div>

            {/* Results */}
            <div
              ref={containerRef}
              className="flex-1 overflow-y-auto p-2 space-y-3"
            >
              {flatItems.length === 0 ? (
                <div className="text-center py-8 text-xs text-text-secondary select-none">
                  No matches found for <span className="font-semibold text-text-primary dark:text-white">"{query}"</span>
                </div>
              ) : (
                categoriesOrder.map((catKey) => {
                  const catItems = groups[catKey];
                  return (
                    <div key={catKey} className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-text-muted px-2.5 py-1">
                        {categoryLabels[catKey as SearchOption["category"]]}
                      </p>
                      {catItems.map((item) => {
                        // Find index of this item in the flat list
                        const itemIndex = flatItems.indexOf(item);
                        const isActive = itemIndex === selectedIndex;
                        const Icon = categoryIcons[item.category] || Sparkles;

                        return (
                          <div
                            key={item.id}
                            onClick={() => {
                              item.onClick();
                              onClose();
                            }}
                            onMouseEnter={() => setSelectedIndex(itemIndex)}
                            className={cn(
                              "flex items-center justify-between gap-3 px-3 py-2.5 rounded-button cursor-pointer select-none transition duration-150",
                              isActive
                                ? "bg-primary-light text-primary font-bold dark:bg-red-950/25 dark:text-red-400 is-active-search-item"
                                : "text-text-secondary hover:bg-background hover:text-text-primary dark:hover:bg-gray-800/60 dark:hover:text-gray-100"
                            )}
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <span className={cn(
                                "p-1.5 rounded-icon inline-flex items-center justify-center shrink-0",
                                isActive ? "bg-primary/10" : "bg-background dark:bg-gray-800"
                              )}>
                                <Icon className="h-4 w-4" />
                              </span>
                              <div className="overflow-hidden">
                                <p className={cn(
                                  "text-xs truncate",
                                  isActive ? "text-primary dark:text-red-400" : "text-text-primary dark:text-white"
                                )}>
                                  {item.label}
                                </p>
                                {item.description && (
                                  <p className="text-[10px] text-text-muted truncate mt-0.5 font-medium">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            {isActive && (
                              <span className="text-[10px] font-semibold text-primary/60 dark:text-red-400/60 inline-flex items-center gap-0.5 font-sans">
                                <span>Go</span>
                                <CornerDownLeft className="h-3 w-3" />
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>

            {/* Shortcut hints footer */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-border dark:border-gray-800 bg-sidebar dark:bg-gray-900/50 select-none text-[10px] text-text-muted font-bold tracking-wide uppercase">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="border border-border rounded px-1.5 bg-background dark:bg-gray-900 dark:border-gray-800">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="border border-border rounded px-1.5 bg-background dark:bg-gray-900 dark:border-gray-800">Enter</kbd>
                  Select
                </span>
              </div>
              <span>ESC to Close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
