"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight, MapPin, Plus } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Timeline } from "@/components/feedback/Timeline";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tag } from "@/components/ui/Tag";
import { Textarea } from "@/components/ui/Textarea";
import { admin as adminApi, apiErrorMessage } from "@/lib/api";
import { citizenId, feedbackId, relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { FeedbackDetail, FeedbackStatus } from "@/types";

const STATUS_BUTTONS: { id: FeedbackStatus; label: string }[] = [
  { id: "pending", label: "Pending" },
  { id: "in_progress", label: "In progress" },
  { id: "solved", label: "Solved" },
  { id: "cancelled", label: "Cancelled" },
];

export default function AdminFeedbackRespondPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [detail, setDetail] = useState<FeedbackDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [pendingStatus, setPendingStatus] = useState<FeedbackStatus | null>(null);
  const [statusComment, setStatusComment] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);

  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  useEffect(() => {
    if (Number.isNaN(id)) return;
    adminApi
      .feedbackDetail(id)
      .then(({ data }) => setDetail(data))
      .catch((err) => setError(apiErrorMessage(err, "Could not load feedback")));
  }, [id]);

  const lastStatusChange = useMemo(
    () =>
      detail?.timeline
        .filter((e) => e.event_type === "status_change")
        .at(-1) ?? null,
    [detail],
  );

  async function reload() {
    const { data } = await adminApi.feedbackDetail(id);
    setDetail(data);
  }

  async function saveStatus() {
    if (!pendingStatus) return;
    if (statusComment.trim().length < 20) {
      toast.error("Add a comment explaining the change (20+ characters).");
      return;
    }
    setSavingStatus(true);
    try {
      await adminApi.updateStatus(id, {
        status: pendingStatus,
        comment: statusComment.trim(),
      });
      toast.success("Status updated and citizen will be notified.");
      setPendingStatus(null);
      setStatusComment("");
      await reload();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not update status"));
    } finally {
      setSavingStatus(false);
    }
  }

  async function postComment() {
    if (commentText.trim().length < 5) {
      toast.error("Comment must be at least 5 characters.");
      return;
    }
    setPostingComment(true);
    try {
      await adminApi.addComment(id, commentText.trim());
      toast.success("Comment posted.");
      setCommentText("");
      setShowCommentBox(false);
      await reload();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not post comment"));
    } finally {
      setPostingComment(false);
    }
  }

  if (error) {
    return (
      <div className="px-8 py-12">
        <div className="rounded-md border border-status-cancelled/30 bg-status-cancelled-bg px-3 py-2 text-sm text-status-cancelled">
          {error}
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex justify-center py-32">
        <Spinner size={28} />
      </div>
    );
  }

  return (
    <div className="px-8 py-10 max-w-6xl mx-auto">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-sm text-text-tertiary mb-8"
      >
        <Link href="/admin/feedback" className="hover:text-text-primary">
          Feedback
        </Link>
        <ChevronRight size={14} />
        <span>{detail.service_name}</span>
        <ChevronRight size={14} />
        <span className="font-mono text-text-primary">
          {feedbackId(detail.feedback_id)}
        </span>
      </nav>

      <div className="grid lg:grid-cols-12 gap-8">
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
          </header>

          <p className="text-base text-text-primary leading-relaxed whitespace-pre-wrap max-w-[65ch]">
            {detail.feedback_text}
          </p>

          <dl className="grid grid-cols-2 gap-x-8 gap-y-5 pt-6 border-t border-border-subtle">
            <div>
              <dt className="text-xs uppercase tracking-widest text-text-tertiary">
                Service
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

        <aside className="lg:col-span-5 flex flex-col gap-8">
          <section className="bg-bg-elevated border border-border-subtle rounded-xl p-5 space-y-3">
            <p className="text-xs uppercase tracking-widest text-text-tertiary">
              Current status
            </p>
            <StatusBadge status={detail.status} />
            {lastStatusChange ? (
              <p className="text-xs text-text-tertiary">
                Last updated {relativeTime(lastStatusChange.created_at)} by{" "}
                {lastStatusChange.admin_username}
              </p>
            ) : (
              <p className="text-xs text-text-tertiary">No status changes yet.</p>
            )}
          </section>

          <section className="bg-bg-elevated border border-border-subtle rounded-xl p-5 space-y-4">
            <p className="text-xs uppercase tracking-widest text-text-tertiary">
              Update status
            </p>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_BUTTONS.map((btn) => {
                const isCurrent = detail.status === btn.id && pendingStatus === null;
                const isPending = pendingStatus === btn.id;
                return (
                  <button
                    key={btn.id}
                    type="button"
                    onClick={() =>
                      setPendingStatus(btn.id === detail.status ? null : btn.id)
                    }
                    className={cn(
                      "rounded-md border px-3 py-2 text-sm transition-colors duration-fast",
                      isPending
                        ? "border-2 border-primary-700 bg-primary-50 text-text-primary"
                        : isCurrent
                          ? "border-border-strong bg-bg-subtle text-text-primary"
                          : "border-border bg-bg-elevated text-text-secondary hover:border-border-strong",
                    )}
                  >
                    {btn.label}
                  </button>
                );
              })}
            </div>

            {pendingStatus ? (
              <div className="space-y-3 pt-2">
                <Textarea
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                  placeholder="Add a comment explaining this status change (required, 20+ characters)."
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-tertiary">
                    {statusComment.trim().length} / 2000
                  </span>
                  <Button onClick={saveStatus} disabled={savingStatus}>
                    {savingStatus ? (
                      <>
                        <Spinner size={14} className="text-text-inverse" />
                        Saving…
                      </>
                    ) : (
                      "Save status update"
                    )}
                  </Button>
                </div>
              </div>
            ) : null}
          </section>

          <section className="bg-bg-elevated border border-border-subtle rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-widest text-text-tertiary">
                Internal comment
              </p>
              {showCommentBox ? null : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCommentBox(true)}
                >
                  <Plus size={14} />
                  Add comment
                </Button>
              )}
            </div>

            {showCommentBox ? (
              <div className="space-y-3">
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add an internal comment (5-2000 characters)."
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowCommentBox(false);
                      setCommentText("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={postComment}
                    disabled={postingComment}
                  >
                    {postingComment ? (
                      <>
                        <Spinner size={14} />
                        Posting…
                      </>
                    ) : (
                      "Post comment"
                    )}
                  </Button>
                </div>
              </div>
            ) : null}
          </section>

          <section>
            <p className="text-xs uppercase tracking-widest text-text-tertiary mb-4">
              Progress timeline
            </p>
            <Timeline events={detail.timeline} />
          </section>
        </aside>
      </div>
    </div>
  );
}
