import { CitizenGate } from "@/components/auth/CitizenGate";
import { Footer } from "@/components/layout/Footer";
import { Topbar } from "@/components/layout/Topbar";

export default function CitizenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Topbar />
      <main className="flex-1">
        <CitizenGate>{children}</CitizenGate>
      </main>
      <Footer />
    </>
  );
}
