"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUp, ChevronRight, MapPin } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Timeline } from "@/components/feedback/Timeline";
import { Spinner } from "@/components/ui/Spinner";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tag } from "@/components/ui/Tag";
import {
  feedback as feedbackApi,
  apiErrorMessage,
} from "@/lib/api";
import { citizenId, feedbackId, relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import type { FeedbackDetail } from "@/types";

export default function FeedbackDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const user = useAuthStore((s) => s.user);
  const [detail, setDetail] = useState<FeedbackDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingUpvote, setPendingUpvote] = useState(false);

  useEffect(() => {
    if (Number.isNaN(id)) {
      setError("Invalid feedback id");
      return;
    }
    feedbackApi
      .detail(id)
      .then(({ data }) => setDetail(data))
      .catch((err) => setError(apiErrorMessage(err, "Could not load feedback")));
  }, [id]);

  async function toggleUpvote() {
    if (!detail) return;
    if (!user || user.type !== "citizen") {
      toast.info("Sign in as a citizen to upvote.");
      return;
    }
    setPendingUpvote(true);
    const previous = {
      upvotes: detail.upvotes,
      upvoted_by_me: detail.upvoted_by_me ?? false,
    };
    setDetail({
      ...detail,
      upvotes: detail.upvotes + (previous.upvoted_by_me ? -1 : 1),
      upvoted_by_me: !previous.upvoted_by_me,
    });
    try {
      const { data } = await feedbackApi.toggleUpvote(id);
      setDetail({ ...detail, upvotes: data.upvotes, upvoted_by_me: data.upvoted });
    } catch (err) {
      setDetail({ ...detail, ...previous });
      toast.error(apiErrorMessage(err, "Could not record your upvote"));
    } finally {
      setPendingUpvote(false);
    }
  }

  if (error) {
    return (
      <div className="max-w-content mx-auto px-6 py-20 text-center">
        <p className="text-status-cancelled">{error}</p>
        <Link href="/" className="mt-6 inline-block text-text-accent hover:underline">
          Back to all feedback
        </Link>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size={28} />
      </div>
    );
  }

  return (
    <div className="max-w-content mx-auto px-6 py-12">
      <nav
        className="flex items-center gap-2 text-sm text-text-tertiary mb-8"
        aria-label="Breadcrumb"
      >
        <Link href="/" className="hover:text-text-primary">
          All feedback
        </Link>
        <ChevronRight size={14} />
        <span>{detail.service_name}</span>
        <ChevronRight size={14} />
        <span className="text-text-primary font-mono">
          {feedbackId(detail.feedback_id)}
        </span>
      </nav>

      <div className="grid lg:grid-cols-12 gap-10">
        <article className="lg:col-span-7 flex flex-col gap-8">
          <header className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <Tag>{detail.service_name}</Tag>
              <StatusBadge status={detail.status} />
            </div>
            <h1 className="font-display text-3xl text-primary-950 leading-snug">
              {detail.feedback_text.split("\n")[0].slice(0, 120)}
              {detail.feedback_text.split("\n")[0].length > 120 ? "…" : ""}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
              <span className="font-mono text-text-tertiary">
                {feedbackId(detail.feedback_id)}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                {detail.location}
              </span>
              <span>·</span>
              <span>Submitted {relativeTime(detail.date)}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleUpvote}
                disabled={pendingUpvote}
                aria-pressed={Boolean(detail.upvoted_by_me)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors duration-fast",
                  detail.upvoted_by_me
                    ? "border-accent-500 bg-accent-100 text-primary-900"
                    : "border-border text-text-primary hover:border-border-strong",
                )}
              >
                <ArrowUp size={14} />
                {detail.upvotes} community upvote
                {detail.upvotes === 1 ? "" : "s"}
              </button>
            </div>
          </header>

          <div className="prose prose-sm max-w-[65ch]">
            <p className="text-base text-text-primary leading-relaxed whitespace-pre-wrap">
              {detail.feedback_text}
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-x-8 gap-y-5 pt-6 border-t border-border-subtle">
            <div>
              <dt className="text-xs uppercase tracking-widest text-text-tertiary">
                Service type
              </dt>
              <dd className="text-text-primary mt-1">{detail.service_name}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-text-tertiary">
                Location
              </dt>
              <dd className="text-text-primary mt-1">{detail.location}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-text-tertiary">
                Frequency
              </dt>
              <dd className="text-text-primary mt-1 capitalize">
                {detail.frequency}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-text-tertiary">
                Date submitted
              </dt>
              <dd className="text-text-primary mt-1">
                {format(new Date(detail.date), "MMMM d, yyyy")}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-text-tertiary">
                Citizen
              </dt>
              <dd className="text-text-primary mt-1 font-mono">
                {citizenId(detail.citizen_id)}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-text-tertiary">
                Community support
              </dt>
              <dd className="text-text-primary mt-1">
                {detail.upvotes} upvote{detail.upvotes === 1 ? "" : "s"}
              </dd>
            </div>
          </dl>
        </article>

        <aside className="lg:col-span-5">
          <div className="lg:sticky" style={{ top: "calc(var(--nav-height) + 2rem)" }}>
            <p className="text-xs uppercase tracking-widest text-text-tertiary mb-6">
              Progress timeline
            </p>
            <Timeline events={detail.timeline} />
          </div>
        </aside>
      </div>
    </div>
  );
}
