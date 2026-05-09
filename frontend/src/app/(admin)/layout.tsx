import { AdminGate } from "@/components/auth/AdminGate";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 min-h-screen">
      <AdminSidebar />
      <main className="flex-1 min-w-0">
        <AdminGate>{children}</AdminGate>
      </main>
    </div>
  );
}
