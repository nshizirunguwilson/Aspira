"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";

import { ServiceBreakdownChart } from "@/components/charts/ServiceBreakdownChart";
import { SubmissionsByWeekChart } from "@/components/charts/SubmissionsByWeekChart";
import { Spinner } from "@/components/ui/Spinner";
import { admin as adminApi, apiErrorMessage } from "@/lib/api";
import type { AdminStats } from "@/types";

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .stats()
      .then(({ data }) => setStats(data))
      .catch((err) => setError(apiErrorMessage(err, "Could not load analytics")));
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
  if (!stats) {
    return (
      <div className="flex justify-center py-32">
        <Spinner size={28} />
      </div>
    );
  }

  const peakWeek = [...stats.submissions_by_week].sort(
    (a, b) => b.count - a.count,
  )[0];
  const topService = stats.submissions_by_service[0];
  const totalThisWindow = stats.submissions_by_week.reduce(
    (s, w) => s + w.count,
    0,
  );

  return (
    <div className="px-8 py-10 max-w-6xl mx-auto space-y-10">
      <header>
        <p className="text-xs uppercase tracking-widest text-text-tertiary">
          Analytics
        </p>
        <h1 className="font-display text-3xl text-primary-950 mt-2">
          Submission patterns
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          The view across services and weeks. Use this to spot the hot
          categories and the rhythm of citizen activity.
        </p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-bg-elevated border border-border-subtle rounded-xl p-6">
          <p className="text-xs uppercase tracking-widest text-text-tertiary">
            Submissions in window
          </p>
          <p className="font-display text-3xl text-primary-900 mt-1">
            {totalThisWindow.toLocaleString()}
          </p>
          <p className="text-xs text-text-tertiary mt-1">Last 12 weeks</p>
        </div>
        <div className="bg-bg-elevated border border-border-subtle rounded-xl p-6">
          <p className="text-xs uppercase tracking-widest text-text-tertiary">
            Peak week
          </p>
          <p className="font-display text-3xl text-primary-900 mt-1">
            {peakWeek ? peakWeek.count : 0}
          </p>
          <p className="text-xs text-text-tertiary mt-1">
            {peakWeek
              ? `Week of ${format(parseISO(peakWeek.week_start), "MMM d")}`
              : "No data yet"}
          </p>
        </div>
        <div className="bg-bg-elevated border border-border-subtle rounded-xl p-6">
          <p className="text-xs uppercase tracking-widest text-text-tertiary">
            Top service
          </p>
          <p className="font-display text-3xl text-primary-900 mt-1">
            {topService ? topService.count : 0}
          </p>
          <p className="text-xs text-text-tertiary mt-1">
            {topService ? topService.service_name : "No data yet"}
          </p>
        </div>
      </section>

      <section className="bg-bg-elevated border border-border-subtle rounded-xl p-6">
        <p className="text-xs uppercase tracking-widest text-text-tertiary mb-1">
          Submissions over time
        </p>
        <p className="text-xs text-text-tertiary mb-5">Last 12 weeks</p>
        <SubmissionsByWeekChart data={stats.submissions_by_week} />
      </section>

      <section className="bg-bg-elevated border border-border-subtle rounded-xl p-6">
        <p className="text-xs uppercase tracking-widest text-text-tertiary mb-1">
          Service breakdown
        </p>
        <p className="text-xs text-text-tertiary mb-5">All time</p>
        <ServiceBreakdownChart data={stats.submissions_by_service} />
      </section>

      <section>
        <p className="text-xs uppercase tracking-widest text-text-tertiary mb-4">
          Service detail
        </p>
        <div className="bg-bg-elevated border border-border-subtle rounded-xl divide-y divide-border-subtle">
          {stats.submissions_by_service.map((entry) => {
            const pct = totalThisWindow
              ? Math.round((entry.count / Math.max(totalThisWindow, 1)) * 100)
              : 0;
            return (
              <div
                key={entry.service_id}
                className="flex items-center justify-between px-5 py-4"
              >
                <div>
                  <p className="text-text-primary text-sm font-medium">
                    {entry.service_name}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {entry.count.toLocaleString()} submission
                    {entry.count === 1 ? "" : "s"} · {pct}% of recent volume
                  </p>
                </div>
                <div className="w-40 h-2 rounded-full bg-bg-subtle overflow-hidden">
                  <div
                    className="h-full bg-primary-700"
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
