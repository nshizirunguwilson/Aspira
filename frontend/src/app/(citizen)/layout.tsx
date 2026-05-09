import { Suspense } from "react";

import { CitizenGate } from "@/components/auth/CitizenGate";
import { Footer } from "@/components/layout/Footer";
import { Topbar } from "@/components/layout/Topbar";
import { Spinner } from "@/components/ui/Spinner";

function GateFallback() {
  return (
    <div className="flex items-center justify-center py-32">
      <Spinner size={28} />
    </div>
  );
}

export default function CitizenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Topbar />
      <main className="flex-1">
        <Suspense fallback={<GateFallback />}>
          <CitizenGate>{children}</CitizenGate>
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
