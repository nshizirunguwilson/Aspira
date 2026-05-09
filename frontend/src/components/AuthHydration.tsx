"use client";

import { useEffect } from "react";

import { useAuthStore } from "@/store/auth";

export function AuthHydration() {
  const refresh = useAuthStore((state) => state.refresh);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return null;
}
