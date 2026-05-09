import { Suspense } from "react";

import { AdminGate } from "@/components/auth/AdminGate";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { Spinner } from "@/components/ui/Spinner";

function GateFallback() {
  return (
    <div className="flex items-center justify-center py-32">
      <Spinner size={28} />
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 min-h-screen">
      <AdminSidebar />
      <main className="flex-1 min-w-0">
        <Suspense fallback={<GateFallback />}>
          <AdminGate>{children}</AdminGate>
        </Suspense>
      </main>
    </div>
  );
}
