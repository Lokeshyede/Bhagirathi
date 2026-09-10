import React from "react";
import { ChevronRight, LucideIcon } from "lucide-react";
import { cn } from "../utils";



// 2. TABS
export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTabId: string;
  onTabChange: (id: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTabId, onTabChange }) => {
  return (
    <div className="border-b border-divider flex items-center gap-6 overflow-x-auto w-full select-none dark:border-gray-800">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "pb-3.5 text-sm font-semibold relative transition duration-150 shrink-0 outline-none border-b-2 border-transparent",
              isActive
                ? "text-primary border-primary font-bold"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            <div className="flex items-center gap-2">
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={cn(
                    "px-2 py-0.5 text-[10px] rounded-full font-bold",
                    isActive ? "bg-primary-light text-primary" : "bg-background text-text-secondary dark:bg-gray-800"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

// 3. NAVIGATION CARDS
export interface NavCardItem {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
}

export interface NavigationCardsProps {
  items: NavCardItem[];
}

export const NavigationCards: React.FC<NavigationCardsProps> = ({ items }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 select-none">
      {items.map((item, idx) => {
        const IconComponent = item.icon;
        return (
          <div
            key={idx}
            onClick={item.onClick}
            className="p-5 bg-white border border-border rounded-card hover:border-primary/40 hover:shadow-hover cursor-pointer transition-all duration-200 flex flex-col justify-between group dark:bg-gray-900 dark:border-gray-800"
          >
            <div className="space-y-2">
              <div className="p-2.5 bg-primary-light text-primary rounded-xl inline-block group-hover:bg-primary group-hover:text-white transition duration-200">
                <IconComponent className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-text-primary dark:text-white mt-2 group-hover:text-primary transition duration-150">
                {item.title}
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                {item.description}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary mt-4">
              <span>Open Feature</span>
              <ChevronRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition duration-150" />
            </div>
          </div>
        );
      })}
    </div>
  );
};


