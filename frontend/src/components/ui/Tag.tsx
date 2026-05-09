import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Tag({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md bg-primary-100 text-primary-800 text-xs font-medium uppercase tracking-wide",
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
