import { create } from "zustand";
import { User, AuthState } from "@bhagirathi/types";

// Portal-specific storage keys — isolated from Admin & Tenant portals
const TOKEN_KEY = "maintenance_auth_token";
const REFRESH_KEY = "maintenance_refresh_token";
const USER_KEY = "maintenance_auth_user";

interface AuthActions {
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const getStoredToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

const getStoredUser = (): User | null => {
  if (typeof window === "undefined") return null;
  try {
    const u = localStorage.getItem(USER_KEY);
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState & AuthActions>((set) => {
  const token = getStoredToken();
  const user = getStoredUser();

  return {
    user,
    token,
    isAuthenticated: !!token && !!user,

    login: (user: User, accessToken: string, refreshToken: string) => {
      localStorage.setItem(TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_KEY, refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      set({ user, token: accessToken, isAuthenticated: true });
    },

    logout: () => {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_KEY);
      localStorage.removeItem(USER_KEY);
      set({ user: null, token: null, isAuthenticated: false });
    },

    updateUser: (updatedUser: User) => {
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      set({ user: updatedUser });
    },
  };
});
