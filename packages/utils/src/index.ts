import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Tailwind Class Merger
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Currency Formatter (INR default)
export function formatCurrency(amount: number, locale = "en-IN", currency = "INR"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(amount);
}

// Date Formatter (e.g. "31 Jul 2026")
export function formatDate(dateString: string | Date, includeTime = false): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return "Invalid Date";
  
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  
  if (includeTime) {
    options.hour = "2-digit";
    options.minute = "2-digit";
  }
  
  return new Intl.DateTimeFormat("en-IN", options).format(date);
}

// Local Storage Handler
export const localStorageHelper = {
  getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("Error setting localStorage key: " + key, e);
    }
  },
  removeItem(key: string): void {
    localStorage.removeItem(key);
  }
};

// Parse API error messages safely, extract details or validation messages, and guarantee a string return
export function parseApiError(err: any, fallbackMessage = "Operation failed. Please try again."): string {
  if (!err) return fallbackMessage;
  const detail = err?.response?.data?.detail;
  if (!detail) {
    return err.message || fallbackMessage;
  }
  if (typeof detail === "string") {
    return detail;
  }
  if (Array.isArray(detail)) {
    const first = detail[0];
    if (first && typeof first === "object") {
      return first.msg || first.message || JSON.stringify(first);
    }
    return String(first || fallbackMessage);
  }
  if (typeof detail === "object") {
    return detail.msg || detail.message || JSON.stringify(detail);
  }
  return String(detail);
}
