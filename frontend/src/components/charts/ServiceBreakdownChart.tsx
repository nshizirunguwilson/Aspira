"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ServiceStat } from "@/types";

const PALETTE = [
  "var(--color-primary-200)",
  "var(--color-primary-300)",
  "var(--color-primary-400)",
  "var(--color-primary-500)",
  "var(--color-primary-600)",
  "var(--color-primary-700)",
  "var(--color-primary-800)",
];

function colorFor(index: number, total: number): string {
  if (total <= 1) return PALETTE[PALETTE.length - 1];
  const stride = (PALETTE.length - 1) / (total - 1);
  return PALETTE[Math.round(index * stride)];
}

export function ServiceBreakdownChart({ data }: { data: ServiceStat[] }) {
  if (!data.length) {
    return (
      <p className="text-sm text-text-tertiary py-12 text-center">
        No service breakdown yet.
      </p>
    );
  }
  const sorted = [...data].sort((a, b) => a.count - b.count);
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        layout="vertical"
        data={sorted}
        margin={{ top: 8, right: 16, bottom: 0, left: 24 }}
      >
        <XAxis
          type="number"
          tick={{ fill: "var(--color-text-tertiary)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <YAxis
          type="category"
          dataKey="service_name"
          tick={{ fill: "var(--color-text-secondary)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={140}
        />
        <Tooltip
          cursor={{ fill: "var(--color-primary-100)" }}
          contentStyle={{
            background: "var(--color-bg-elevated)",
            border: "1px solid var(--color-border-subtle)",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {sorted.map((entry, i) => (
            <Cell key={entry.service_id} fill={colorFor(i, sorted.length)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
