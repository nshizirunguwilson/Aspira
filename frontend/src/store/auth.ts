import { create } from "zustand";

import { auth as authApi } from "@/lib/api";
import type { CurrentUser } from "@/types";

interface AuthState {
  user: CurrentUser | null;
  status: "idle" | "loading" | "authenticated" | "unauthenticated";
  refresh: () => Promise<void>;
  setUser: (user: CurrentUser | null) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "idle",

  setUser: (user) =>
    set({ user, status: user ? "authenticated" : "unauthenticated" }),

  refresh: async () => {
    set({ status: "loading" });
    try {
      const { data } = await authApi.me();
      set({ user: data, status: "authenticated" });
    } catch {
      set({ user: null, status: "unauthenticated" });
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } finally {
      set({ user: null, status: "unauthenticated" });
    }
  },
}));
