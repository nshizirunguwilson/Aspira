import Link from "next/link";
import { FileX } from "lucide-react";

import { Button } from "@/components/ui/Button";

export default function FeedbackNotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-32">
      <div className="text-center flex flex-col items-center gap-3 max-w-md">
        <FileX size={36} className="text-text-tertiary" />
        <p className="text-xs uppercase tracking-widest text-text-tertiary">
          Not found
        </p>
        <h1 className="font-display text-3xl text-primary-950">
          This feedback doesn&apos;t exist.
        </h1>
        <p className="text-sm text-text-secondary">
          It may have been removed, or the link might be incorrect.
        </p>
        <Link href="/" className="mt-4">
          <Button>Browse all feedback</Button>
        </Link>
      </div>
    </main>
  );
}
