"use client";

import { useEffect, useState } from "react";

import { Spinner } from "@/components/ui/Spinner";
import { feedback as feedbackApi } from "@/lib/api";
import type { FeedbackItem } from "@/types";

interface ServiceRow {
  service_name: string;
  count: number;
  share: number;
}

const PALETTE = [
  "var(--color-primary-200)",
  "var(--color-primary-400)",
  "var(--color-primary-600)",
  "var(--color-primary-800)",
];

function aggregate(items: FeedbackItem[]): ServiceRow[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    counts.set(item.service_name, (counts.get(item.service_name) ?? 0) + 1);
  }
  const total = items.length || 1;
  return [...counts.entries()]
    .map(([service_name, count]) => ({
      service_name,
      count,
      share: count / total,
    }))
    .sort((a, b) => b.count - a.count);
}

/** Compact stacked-bar viz of the last 30 feedback items by service. */
export function HeroDataViz() {
  const [items, setItems] = useState<FeedbackItem[] | null>(null);

  useEffect(() => {
    feedbackApi
      .list({ sort_by: "date", per_page: 30 })
      .then(({ data }) => setItems(data.items))
      .catch(() => setItems([]));
  }, []);

  if (items === null) {
    return (
      <div className="h-[260px] flex items-center justify-center bg-bg-elevated border border-border-subtle rounded-2xl">
        <Spinner />
      </div>
    );
  }

  const rows = aggregate(items);
  const total = items.length;
  const maxBar = rows[0]?.count ?? 1;

  return (
    <div className="bg-bg-elevated border border-border-subtle rounded-2xl p-6">
      <div className="flex items-baseline justify-between mb-4">
        <p className="text-xs uppercase tracking-widest text-text-tertiary">
          Live · last {total} submissions
        </p>
        {total > 0 ? (
          <p className="text-xs text-text-tertiary">{rows.length} services</p>
        ) : null}
      </div>

      {total === 0 ? (
        <p className="text-sm text-text-tertiary py-12 text-center">
          No feedback yet — be the first to submit.
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map((row, i) => {
            const width = Math.round((row.count / maxBar) * 100);
            const color = PALETTE[Math.min(i, PALETTE.length - 1)];
            return (
              <li key={row.service_name} className="flex items-center gap-3">
                <span className="text-xs text-text-secondary truncate flex-shrink-0 w-32">
                  {row.service_name}
                </span>
                <div className="flex-1 h-3 rounded-full bg-bg-subtle overflow-hidden">
                  <div
                    className="h-full rounded-full transition-[width] duration-slow ease-out-quart"
                    style={{
                      width: `${Math.max(width, 4)}%`,
                      background: color,
                    }}
                  />
                </div>
                <span className="text-xs font-mono text-text-tertiary w-6 text-right">
                  {row.count}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
