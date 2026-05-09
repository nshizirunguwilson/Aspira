"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FileText, Plus } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tag } from "@/components/ui/Tag";
import {
  feedback as feedbackApi,
  apiErrorMessage,
} from "@/lib/api";
import { feedbackId, relativeTime } from "@/lib/format";
import { useAuthStore } from "@/store/auth";
import type { FeedbackDetail } from "@/types";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function CitizenDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [items, setItems] = useState<FeedbackDetail[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    feedbackApi
      .mine()
      .then(({ data }) => setItems(data))
      .catch((err) => setError(apiErrorMessage(err, "Could not load your feedback")));
  }, []);

  const openCount = items?.filter(
    (f) => f.status === "pending" || f.status === "in_progress",
  ).length ?? 0;

  const firstName = (user?.name ?? "").split(" ")[0];

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <header className="flex flex-col gap-2 mb-10">
        <p className="text-xs uppercase tracking-widest text-text-tertiary">
          My feedback
        </p>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl text-primary-950">
              {greeting()}, {firstName || "there"}.
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              {items === null
                ? "Loading your submissions…"
                : openCount === 0
                  ? "All your past issues have been resolved or closed."
                  : `You have ${openCount} open ${openCount === 1 ? "issue" : "issues"}.`}
            </p>
          </div>
          <Link href="/submit">
            <Button variant="accent">
              <Plus size={16} />
              Submit new
            </Button>
          </Link>
        </div>
      </header>

      {items === null && !error ? (
        <div className="flex justify-center py-20">
          <Spinner size={28} />
        </div>
      ) : error ? (
        <div className="rounded-md border border-status-cancelled/30 bg-status-cancelled-bg px-3 py-2 text-sm text-status-cancelled">
          {error}
        </div>
      ) : items && items.length === 0 ? (
        <div className="text-center py-20 flex flex-col items-center gap-3">
          <FileText size={36} className="text-text-tertiary" />
          <p className="text-text-primary">
            You haven&apos;t submitted any feedback yet.
          </p>
          <p className="text-sm text-text-tertiary max-w-sm">
            When you do, you&apos;ll track its progress right here.
          </p>
          <Link href="/submit" className="mt-4">
            <Button variant="accent">Submit your first feedback →</Button>
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-border-subtle">
          {items?.map((item) => (
            <li key={item.feedback_id} className="py-6 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Tag>{item.service_name}</Tag>
                <StatusBadge status={item.status} />
              </div>
              <div>
                <h3 className="text-text-primary font-medium leading-snug">
                  {item.feedback_text.slice(0, 140)}
                  {item.feedback_text.length > 140 ? "…" : ""}
                </h3>
                <p className="font-mono text-xs text-text-tertiary mt-1">
                  {feedbackId(item.feedback_id)} · {item.location}
                </p>
              </div>
              <p className="text-sm text-text-secondary">
                Submitted {relativeTime(item.date)} · {item.upvotes} community
                upvote{item.upvotes === 1 ? "" : "s"}
              </p>
              <div>
                <Link
                  href={`/feedback/${item.feedback_id}`}
                  className="text-sm text-text-accent hover:underline"
                >
                  View details →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
