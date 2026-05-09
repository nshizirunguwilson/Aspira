"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { PartyPopper } from "lucide-react";

import { StatBlock } from "@/components/admin/StatBlock";
import { ServiceBreakdownChart } from "@/components/charts/ServiceBreakdownChart";
import { SubmissionsByWeekChart } from "@/components/charts/SubmissionsByWeekChart";
import { Spinner } from "@/components/ui/Spinner";
import { admin as adminApi, apiErrorMessage } from "@/lib/api";
import { feedbackId, relativeTime } from "@/lib/format";
import type { AdminActivityEvent, AdminStats } from "@/types";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activity, setActivity] = useState<AdminActivityEvent[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([adminApi.stats(), adminApi.activity()])
      .then(([statsRes, activityRes]) => {
        setStats(statsRes.data);
        setActivity(activityRes.data);
      })
      .catch((err) => setError(apiErrorMessage(err, "Could not load dashboard")));
  }, []);

  if (error) {
    return (
      <div className="p-12">
        <div className="rounded-md border border-status-cancelled/30 bg-status-cancelled-bg px-3 py-2 text-sm text-status-cancelled">
          {error}
        </div>
      </div>
    );
  }

  if (!stats || !activity) {
    return (
      <div className="flex justify-center py-32">
        <Spinner size={28} />
      </div>
    );
  }

  return (
    <div className="px-8 py-10 max-w-6xl mx-auto space-y-10">
      <header>
        <p className="text-xs uppercase tracking-widest text-text-tertiary">
          Admin dashboard
        </p>
        <h1 className="font-display text-3xl text-primary-950 mt-2">Overview</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {format(new Date(), "EEEE, d MMMM yyyy")}
        </p>
      </header>

      {stats.total_submissions > 0 && stats.open_issues === 0 ? (
        <div className="flex items-center gap-4 rounded-xl border border-status-solved/30 bg-status-solved-bg px-6 py-5">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-status-solved/15 text-status-solved">
            <PartyPopper size={20} />
          </span>
          <div>
            <p className="font-medium text-text-primary">All caught up.</p>
            <p className="text-sm text-text-secondary">
              There are no open issues right now. Great work.
            </p>
          </div>
        </div>
      ) : null}

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBlock
          label="Total submissions"
          value={stats.total_submissions.toLocaleString()}
          trendPercent={stats.change_vs_last_month}
        />
        <StatBlock
          label="Open issues"
          value={stats.open_issues.toLocaleString()}
          hint="Pending + in progress"
        />
        <StatBlock
          label="Resolved this month"
          value={stats.resolved_this_month.toLocaleString()}
          hint="Solved status only"
        />
        <StatBlock
          label="Avg response time"
          value={`${stats.avg_response_hours.toFixed(1)}h`}
          hint="Submission to first comment"
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-bg-elevated border border-border-subtle rounded-xl p-6">
          <div className="flex items-baseline justify-between mb-4">
            <p className="text-xs uppercase tracking-widest text-text-tertiary">
              Submissions over time
            </p>
            <p className="text-xs text-text-tertiary">Last 12 weeks</p>
          </div>
          <SubmissionsByWeekChart data={stats.submissions_by_week} />
        </div>

        <div className="bg-bg-elevated border border-border-subtle rounded-xl p-6">
          <div className="flex items-baseline justify-between mb-4">
            <p className="text-xs uppercase tracking-widest text-text-tertiary">
              Service breakdown
            </p>
            <p className="text-xs text-text-tertiary">All time</p>
          </div>
          <ServiceBreakdownChart data={stats.submissions_by_service} />
        </div>
      </section>

      <section>
        <p className="text-xs uppercase tracking-widest text-text-tertiary mb-4">
          Recent activity
        </p>
        {activity.length === 0 ? (
          <p className="text-sm text-text-tertiary">
            No admin actions recorded yet.
          </p>
        ) : (
          <ol className="bg-bg-elevated border border-border-subtle rounded-xl divide-y divide-border-subtle">
            {activity.map((event) => (
              <li key={event.event_id}>
                <Link
                  href={`/admin/feedback/${event.feedback_id}`}
                  className="flex items-start gap-3 px-5 py-4 hover:bg-bg-subtle transition-colors duration-fast"
                >
                  <span
                    className={
                      "mt-2 inline-block h-2 w-2 rounded-full " +
                      (event.event_type === "status_change"
                        ? "bg-status-solved"
                        : "bg-primary-700")
                    }
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary">
                      {event.description}
                    </p>
                    <p className="text-xs text-text-tertiary mt-0.5">
                      {feedbackId(event.feedback_id)} · {event.service_name} ·{" "}
                      {event.location}
                    </p>
                  </div>
                  <span className="text-xs text-text-tertiary shrink-0">
                    {relativeTime(event.created_at)}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
