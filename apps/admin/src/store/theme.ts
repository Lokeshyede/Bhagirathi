import { create } from "zustand";

interface ThemeState {
  isDarkMode: boolean;
  toggleTheme: () => void;
  initializeTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDarkMode: false,
  toggleTheme: () => set((state) => {
    const nextMode = !state.isDarkMode;
    if (nextMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("bhagirathi_dark_mode", String(nextMode));
    return { isDarkMode: nextMode };
  }),
  initializeTheme: () => {
    const saved = localStorage.getItem("bhagirathi_dark_mode") === "true";
    if (saved) {
      document.documentElement.classList.add("dark");
      set({ isDarkMode: true });
    } else {
      document.documentElement.classList.remove("dark");
      set({ isDarkMode: false });
    }
  }
}));
