import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-bg-elevated border border-border-subtle rounded-xl p-6",
        className,
      )}
      {...rest}
    />
  );
}
