import { create } from "zustand";
import { ToastItem } from "@bhagirathi/ui";

interface ToastStore {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, "id">) => void;
  removeToast: (id: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
}

let toastCounter = 0;
const generateId = () => `toast-${Date.now()}-${toastCounter++}`;

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = generateId();
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
  success: (message, title = "Success") => {
    set((state) => ({
      toasts: [...state.toasts, { id: generateId(), message, title, variant: "success", duration: 4000 }],
    }));
  },
  error: (message, title = "Error") => {
    set((state) => ({
      toasts: [...state.toasts, { id: generateId(), message, title, variant: "error", duration: 6000 }],
    }));
  },
  info: (message, title = "Info") => {
    set((state) => ({
      toasts: [...state.toasts, { id: generateId(), message, title, variant: "info", duration: 4000 }],
    }));
  },
  warning: (message, title = "Warning") => {
    set((state) => ({
      toasts: [...state.toasts, { id: generateId(), message, title, variant: "warning", duration: 5000 }],
    }));
  },
}));
