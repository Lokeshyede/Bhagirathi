import React from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search..."
}) => {
  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted dark:text-gray-500 pointer-events-none" />
      <input
        type="text"
        className="
          w-full h-10 pl-10 pr-10
          bg-white dark:bg-gray-900
          border border-border dark:border-gray-700
          rounded-input
          text-sm text-primaryText dark:text-white
          placeholder-muted dark:placeholder-gray-600
          focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
          transition-all duration-150
        "
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-secondaryText dark:hover:text-gray-300 cursor-pointer transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
