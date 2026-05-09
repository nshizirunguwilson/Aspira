import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...rest }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "block w-full rounded-md border bg-bg-elevated px-3 py-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none transition-colors duration-fast resize-y min-h-[8rem]",
        invalid
          ? "border-status-cancelled focus:border-status-cancelled"
          : "border-border focus:border-border-focus",
        className,
      )}
      {...rest}
    />
  ),
);

Textarea.displayName = "Textarea";
