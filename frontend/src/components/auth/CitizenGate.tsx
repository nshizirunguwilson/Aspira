"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Spinner } from "@/components/ui/Spinner";
import { useAuthStore } from "@/store/auth";

export function CitizenGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, status } = useAuthStore();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated" && user?.type !== "citizen") {
      router.replace("/");
    }
  }, [status, user, router]);

  if (status !== "authenticated" || user?.type !== "citizen") {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner size={28} />
      </div>
    );
  }

  return <>{children}</>;
}
