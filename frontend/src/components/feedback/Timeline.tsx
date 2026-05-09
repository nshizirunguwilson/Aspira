"use client";

import { cn } from "@/lib/utils";
import { relativeTime } from "@/lib/format";
import type { TimelineEvent } from "@/types";

const DOT_COLOR: Record<TimelineEvent["event_type"], string> = {
  submission: "bg-accent-500",
  comment: "bg-primary-700",
  status_change: "bg-status-solved",
};

export function Timeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-text-tertiary italic">
        Waiting for response — an administrator will review and respond.
      </p>
    );
  }
  return (
    <ol className="relative">
      <span className="absolute left-[7px] top-2 bottom-2 w-px bg-border-subtle" aria-hidden />
      {events.map((event, idx) => {
        const isLast = idx === events.length - 1;
        return (
          <li
            key={`${event.event_type}-${event.event_id}-${idx}`}
            className="relative pl-8 pb-8 last:pb-0"
          >
            <span
              aria-hidden
              className={cn(
                "absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full ring-4 ring-bg-base",
                DOT_COLOR[event.event_type],
                isLast && "after:absolute after:inset-[-6px] after:rounded-full after:border-2 after:border-current after:animate-ping after:opacity-30",
              )}
            />
            <p className="text-text-primary font-medium">{event.description}</p>
            {event.comment_text ? (
              <p className="mt-1 text-sm text-text-secondary leading-relaxed">
                {event.comment_text}
              </p>
            ) : null}
            <p className="mt-1 text-xs text-text-tertiary">
              {event.admin_username ? `${event.admin_username} · ` : ""}
              {relativeTime(event.created_at)}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
