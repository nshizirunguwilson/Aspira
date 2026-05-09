import type { ReactNode } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";

export function StatBlock({
  label,
  value,
  trendPercent,
  trendLabel,
  hint,
}: {
  label: string;
  value: ReactNode;
  trendPercent?: number;
  trendLabel?: string;
  hint?: string;
}) {
  const trendColor =
    trendPercent === undefined
      ? "text-text-tertiary"
      : trendPercent > 0
        ? "text-status-solved"
        : trendPercent < 0
          ? "text-status-cancelled"
          : "text-text-tertiary";
  const TrendIcon =
    trendPercent !== undefined && trendPercent < 0 ? TrendingDown : TrendingUp;

  return (
    <div className="bg-bg-elevated border border-border-subtle rounded-xl p-6 flex flex-col gap-2">
      <p className="text-xs uppercase tracking-widest text-text-tertiary">
        {label}
      </p>
      <p className="font-display text-4xl text-primary-900">{value}</p>
      {trendPercent !== undefined ? (
        <p className={cn("text-xs flex items-center gap-1", trendColor)}>
          <TrendIcon size={12} />
          {trendPercent >= 0 ? "+" : ""}
          {trendPercent.toFixed(1)}%
          <span className="text-text-tertiary">
            {trendLabel ?? "vs last month"}
          </span>
        </p>
      ) : hint ? (
        <p className="text-xs text-text-tertiary">{hint}</p>
      ) : null}
    </div>
  );
}
