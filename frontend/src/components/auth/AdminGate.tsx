"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { Spinner } from "@/components/ui/Spinner";
import { useAuthStore } from "@/store/auth";

export function AdminGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() ?? "/admin";
  const search = useSearchParams();
  const { user, status } = useAuthStore();

  useEffect(() => {
    if (status === "unauthenticated") {
      const back = pathname + (search?.toString() ? `?${search}` : "");
      router.replace(`/admin-login?redirect=${encodeURIComponent(back)}`);
    } else if (status === "authenticated" && user?.type !== "admin") {
      router.replace("/");
    }
  }, [status, user, router, pathname, search]);

  if (status !== "authenticated" || user?.type !== "admin") {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner size={28} />
      </div>
    );
  }

  return <>{children}</>;
}
