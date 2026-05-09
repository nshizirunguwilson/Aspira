"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUp, MapPin } from "lucide-react";
import { toast } from "sonner";

import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tag } from "@/components/ui/Tag";
import { feedback as feedbackApi, apiErrorMessage } from "@/lib/api";
import { feedbackId, relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import type { FeedbackItem } from "@/types";

export function FeedbackCard({ item }: { item: FeedbackItem }) {
  const user = useAuthStore((s) => s.user);
  const [upvotes, setUpvotes] = useState(item.upvotes);
  const [upvoted, setUpvoted] = useState(Boolean(item.upvoted_by_me));
  const [pending, setPending] = useState(false);

  async function toggle() {
    if (!user || user.type !== "citizen") {
      toast.info("Sign in as a citizen to upvote.");
      return;
    }
    setPending(true);
    const previous = { upvotes, upvoted };
    setUpvotes((n) => n + (upvoted ? -1 : 1));
    setUpvoted((v) => !v);
    try {
      const { data } = await feedbackApi.toggleUpvote(item.feedback_id);
      setUpvotes(data.upvotes);
      setUpvoted(data.upvoted);
    } catch (error) {
      setUpvotes(previous.upvotes);
      setUpvoted(previous.upvoted);
      toast.error(apiErrorMessage(error, "Could not record your upvote"));
    } finally {
      setPending(false);
    }
  }

  return (
    <article className="bg-bg-elevated border border-border-subtle rounded-xl p-5 flex flex-col gap-3 hover:border-border transition-colors duration-fast">
      <div className="flex items-center justify-between">
        <Tag>{item.service_name}</Tag>
        <StatusBadge status={item.status} />
      </div>

      <Link
        href={`/feedback/${item.feedback_id}`}
        className="group flex flex-col gap-1.5"
      >
        <h3 className="text-text-primary font-medium leading-snug group-hover:text-primary-700 transition-colors line-clamp-2">
          {item.feedback_text.slice(0, 120)}
          {item.feedback_text.length > 120 ? "…" : ""}
        </h3>
        <p className="font-mono text-xs text-text-tertiary">
          {feedbackId(item.feedback_id)}
        </p>
      </Link>

      <div className="flex items-center gap-3 text-xs text-text-tertiary">
        <span className="flex items-center gap-1">
          <MapPin size={12} />
          {item.location}
        </span>
        <span>·</span>
        <span>{relativeTime(item.date)}</span>
      </div>

      <div className="mt-auto pt-3 border-t border-border-subtle flex items-center justify-between">
        <button
          type="button"
          onClick={toggle}
          disabled={pending}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors duration-fast",
            upvoted
              ? "border-accent-500 bg-accent-100 text-primary-900"
              : "border-border text-text-secondary hover:border-border-strong",
          )}
          aria-pressed={upvoted}
        >
          <ArrowUp size={12} />
          {upvotes}
        </button>
        <Link
          href={`/feedback/${item.feedback_id}`}
          className="text-xs text-text-accent hover:underline"
        >
          View →
        </Link>
      </div>
    </article>
  );
}
