"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { WeekStat } from "@/types";

export function SubmissionsByWeekChart({ data }: { data: WeekStat[] }) {
  if (!data.length) {
    return (
      <p className="text-sm text-text-tertiary py-12 text-center">
        Not enough recent activity to chart.
      </p>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid
          stroke="var(--color-border-subtle)"
          strokeDasharray="3 3"
          vertical={false}
        />
        <XAxis
          dataKey="label"
          tick={{ fill: "var(--color-text-tertiary)", fontSize: 11 }}
          axisLine={{ stroke: "var(--color-border-subtle)" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "var(--color-text-tertiary)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
          width={32}
        />
        <Tooltip
          cursor={{ fill: "var(--color-primary-100)" }}
          contentStyle={{
            background: "var(--color-bg-elevated)",
            border: "1px solid var(--color-border-subtle)",
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: "var(--color-text-secondary)" }}
        />
        <Bar
          dataKey="count"
          fill="var(--color-primary-700)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
