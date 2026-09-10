import React from "react";
import { Search as SearchIcon, Clock, ArrowRight } from "lucide-react";
import { cn } from "../../design-system/utils";

// 1. RE-EXPORTS TO MAINTAIN SINGLE SOURCE OF TRUTH
export { SearchTrigger, CommandPalette } from "../../layout/components/Search";
export type { SearchTriggerProps, CommandPaletteProps } from "../../layout/components/Search";
export { SearchInput } from "../inputs";

// 2. SEARCH SUGGESTIONS
export interface SearchSuggestionsProps {
  suggestions: { label: string; category?: string; onClick: () => void }[];
  onSelect: (val: string) => void;
  className?: string;
}

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  suggestions,
  onSelect,
  className,
}) => {
  return (
    <div className={cn("p-2 select-none", className)}>
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-text-muted px-2.5 py-1">
        Suggestions
      </p>
      <div className="space-y-0.5 mt-1">
        {suggestions.map((item, idx) => (
          <div
            key={idx}
            onClick={() => {
              item.onClick();
              onSelect(item.label);
            }}
            className="flex items-center justify-between px-3 py-2 rounded-button text-xs text-text-secondary hover:bg-background hover:text-text-primary dark:text-gray-400 dark:hover:bg-gray-850 dark:hover:text-white transition duration-150 cursor-pointer select-none"
          >
            <div className="flex items-center gap-2.5">
              <SearchIcon className="h-3.5 w-3.5 text-text-muted shrink-0" />
              <span>{item.label}</span>
            </div>
            {item.category && (
              <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted bg-background dark:bg-gray-800 px-1.5 py-0.5 rounded-badge">
                {item.category}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// 3. RECENT SEARCHES PANEL
export interface RecentSearchProps {
  searches: string[];
  onSelect: (val: string) => void;
  onClearRecent?: () => void;
  className?: string;
}

export const RecentSearch: React.FC<RecentSearchProps> = ({
  searches,
  onSelect,
  onClearRecent,
  className,
}) => {
  if (searches.length === 0) return null;

  return (
    <div className={cn("p-2 select-none", className)}>
      <div className="flex items-center justify-between px-2.5 py-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-text-muted">
          Recent Searches
        </p>
        {onClearRecent && (
          <button
            onClick={onClearRecent}
            className="text-[9px] font-bold text-primary hover:underline uppercase tracking-wider cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>
      <div className="space-y-0.5 mt-1">
        {searches.map((term, idx) => (
          <div
            key={idx}
            onClick={() => onSelect(term)}
            className="flex items-center justify-between px-3 py-2 rounded-button text-xs text-text-secondary hover:bg-background hover:text-text-primary dark:text-gray-400 dark:hover:bg-gray-855 dark:hover:text-white transition duration-150 cursor-pointer select-none"
          >
            <div className="flex items-center gap-2.5">
              <Clock className="h-3.5 w-3.5 text-text-muted shrink-0" />
              <span>{term}</span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition" />
          </div>
        ))}
      </div>
    </div>
  );
};

// 4. EMPTY SEARCH RESULT
export interface EmptyResultProps {
  query: string;
  className?: string;
}

export const EmptyResult: React.FC<EmptyResultProps> = ({ query, className }) => {
  return (
    <div className={cn("text-center py-8 px-4 select-none flex flex-col items-center justify-center", className)}>
      <SearchIcon className="h-8 w-8 text-text-muted mb-2" />
      <p className="text-xs font-semibold text-text-secondary">
        No matches found for <span className="font-bold text-text-primary dark:text-white">"{query}"</span>
      </p>
      <p className="text-[10px] text-text-muted mt-1 leading-normal max-w-xs">
        Check spelling or try search tags like "room", "floor", or "payment".
      </p>
    </div>
  );
};
