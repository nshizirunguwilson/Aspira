import { forwardRef } from "react";
import type { SelectHTMLAttributes } from "react";

import { RWANDA_DISTRICTS } from "@/lib/districts";
import { cn } from "@/lib/utils";

export interface DistrictSelectProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
  includeOther?: boolean;
}

export const DistrictSelect = forwardRef<HTMLSelectElement, DistrictSelectProps>(
  ({ className, invalid, includeOther = true, ...rest }, ref) => (
    <select
      ref={ref}
      className={cn(
        "h-11 w-full rounded-md border bg-bg-elevated px-3 text-sm text-text-primary outline-none transition-colors duration-fast",
        invalid
          ? "border-status-cancelled focus:border-status-cancelled"
          : "border-border focus:border-border-focus",
        className,
      )}
      {...rest}
    >
      <option value="">Choose a district…</option>
      {RWANDA_DISTRICTS.map((group) => (
        <optgroup key={group.province} label={group.province}>
          {group.districts.map((district) => (
            <option key={district} value={district}>
              {district}
            </option>
          ))}
        </optgroup>
      ))}
      {includeOther ? <option value="Other">Other</option> : null}
    </select>
  ),
);

DistrictSelect.displayName = "DistrictSelect";
