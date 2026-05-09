"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface to whatever logging is wired up in the deployment.
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 items-center justify-center min-h-screen px-6 py-20">
      <div className="text-center flex flex-col items-center gap-3 max-w-md">
        <AlertTriangle size={36} className="text-text-tertiary" />
        <p className="text-xs uppercase tracking-widest text-text-tertiary">
          Server error
        </p>
        <h1 className="font-display text-3xl text-primary-950">
          Something went wrong on our end.
        </h1>
        <p className="text-sm text-text-secondary">
          This has been logged. Please try again in a moment.
        </p>
        <Button variant="secondary" onClick={() => reset()} className="mt-4">
          Try again
        </Button>
      </div>
    </main>
  );
}
