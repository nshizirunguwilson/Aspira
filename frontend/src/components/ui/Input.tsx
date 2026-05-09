import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, leadingIcon, trailingIcon, ...rest }, ref) => (
    <div
      className={cn(
        "flex items-center h-11 rounded-md border bg-bg-elevated px-3 transition-colors duration-fast",
        invalid
          ? "border-status-cancelled focus-within:border-status-cancelled"
          : "border-border focus-within:border-border-focus",
      )}
    >
      {leadingIcon ? (
        <span className="mr-2 text-text-tertiary flex-shrink-0">{leadingIcon}</span>
      ) : null}
      <input
        ref={ref}
        className={cn(
          "flex-1 bg-transparent outline-none text-sm text-text-primary placeholder:text-text-tertiary",
          className,
        )}
        {...rest}
      />
      {trailingIcon ? (
        <span className="ml-2 text-text-tertiary flex-shrink-0">{trailingIcon}</span>
      ) : null}
    </div>
  ),
);

Input.displayName = "Input";
