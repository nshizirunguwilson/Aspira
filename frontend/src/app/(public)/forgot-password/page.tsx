import Link from "next/link";
import { Building2 } from "lucide-react";

import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-32">
      <div className="text-center flex flex-col items-center gap-3 max-w-md">
        <Building2 size={36} className="text-text-tertiary" />
        <p className="text-xs uppercase tracking-widest text-text-tertiary">
          Account recovery
        </p>
        <h1 className="font-display text-3xl text-primary-950">
          Contact your district office.
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed">
          Self-service password reset isn&apos;t available yet. Visit the
          local district office with your national ID — staff will verify
          your identity and reset your password on the spot.
        </p>
        <Link href="/login" className="mt-4">
          <Button variant="secondary">Back to sign in</Button>
        </Link>
      </div>
    </main>
  );
}
