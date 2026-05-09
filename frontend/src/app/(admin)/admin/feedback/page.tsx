"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUp, Download, Search } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  admin as adminApi,
  services as servicesApi,
  apiErrorMessage,
} from "@/lib/api";
import { feedbackId, relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { FeedbackItem, ServiceItem } from "@/types";

type StatusFilter =
  | "all"
  | "pending"
  | "in_progress"
  | "solved"
  | "cancelled";

const STATUS_OPTIONS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "in_progress", label: "In progress" },
  { id: "solved", label: "Solved" },
  { id: "cancelled", label: "Cancelled" },
];

export default function AdminFeedbackListPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [serviceId, setServiceId] = useState<number | "all">("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "upvotes">("date");
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    servicesApi.list().then(({ data }) => setServices(data)).catch(() => {});
  }, []);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    adminApi
      .listFeedback({
        service_id: serviceId === "all" ? undefined : serviceId,
        status: statusFilter === "all" ? undefined : statusFilter,
        search: debouncedSearch || undefined,
        sort_by: sortBy,
        per_page: 50,
      })
      .then(({ data }) => {
        if (cancelled) return;
        setItems(data.items);
        setTotal(data.total);
      })
      .catch((err) => {
        if (!cancelled) setError(apiErrorMessage(err, "Could not load feedback"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [serviceId, statusFilter, debouncedSearch, sortBy]);

  const openCount = items.filter(
    (i) => i.status === "pending" || i.status === "in_progress",
  ).length;

  return (
    <div className="px-8 py-10 max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-widest text-text-tertiary">
          Feedback management
        </p>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl text-primary-950">
              All submissions
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              {total.toLocaleString()} total · {openCount.toLocaleString()} open
              in this view
            </p>
          </div>
          <a href={adminApi.exportCsvUrl()} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost">
              <Download size={14} />
              Export CSV
            </Button>
          </a>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leadingIcon={<Search size={16} />}
          placeholder="Search location or text…"
          className="lg:max-w-[300px]"
        />
        <select
          value={serviceId === "all" ? "all" : String(serviceId)}
          onChange={(e) =>
            setServiceId(
              e.target.value === "all" ? "all" : Number(e.target.value),
            )
          }
          className="h-11 rounded-md border border-border bg-bg-elevated px-3 text-sm text-text-primary focus:border-border-focus outline-none"
        >
          <option value="all">All services</option>
          {services.map((service) => (
            <option key={service.service_id} value={service.service_id}>
              {service.service_name}
            </option>
          ))}
        </select>
        <div className="flex flex-wrap items-center gap-1 rounded-md border border-border bg-bg-elevated p-1">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setStatusFilter(option.id)}
              className={cn(
                "px-3 h-8 rounded-md text-xs font-medium transition-colors duration-fast",
                statusFilter === option.id
                  ? "bg-primary-900 text-text-inverse"
                  : "text-text-secondary hover:bg-bg-subtle",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "date" | "upvotes")}
          className="h-11 rounded-md border border-border bg-bg-elevated px-3 text-sm text-text-primary focus:border-border-focus outline-none lg:ml-auto"
        >
          <option value="date">Most recent</option>
          <option value="upvotes">Most upvotes</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size={28} />
        </div>
      ) : error ? (
        <div className="rounded-md border border-status-cancelled/30 bg-status-cancelled-bg px-3 py-2 text-sm text-status-cancelled">
          {error}
        </div>
      ) : items.length === 0 ? (
        <p className="text-center text-sm text-text-tertiary py-20">
          No submissions match these filters.
        </p>
      ) : (
        <>
          <div className="hidden md:block bg-bg-elevated border border-border-subtle rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-bg-subtle text-text-tertiary text-xs uppercase tracking-widest">
                <tr>
                  <th className="text-left px-4 py-3 font-medium w-[110px]">ID</th>
                  <th className="text-left px-4 py-3 font-medium w-[140px]">
                    Service
                  </th>
                  <th className="text-left px-4 py-3 font-medium">Summary</th>
                  <th className="text-left px-4 py-3 font-medium w-[140px]">
                    Location
                  </th>
                  <th className="text-left px-4 py-3 font-medium w-[120px]">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 font-medium w-[100px]">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 font-medium w-[80px]">
                    Upvotes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {items.map((item) => (
                  <tr
                    key={item.feedback_id}
                    className="hover:bg-bg-subtle transition-colors duration-fast"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-text-tertiary">
                      <Link
                        href={`/admin/feedback/${item.feedback_id}`}
                        className="hover:text-text-primary"
                      >
                        {feedbackId(item.feedback_id)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {item.service_name}
                    </td>
                    <td className="px-4 py-3 text-text-primary">
                      <Link
                        href={`/admin/feedback/${item.feedback_id}`}
                        className="hover:text-primary-700"
                      >
                        {item.feedback_text.slice(0, 90)}
                        {item.feedback_text.length > 90 ? "…" : ""}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {item.location}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3 text-text-tertiary text-xs">
                      {relativeTime(item.date)}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      <span className="inline-flex items-center gap-1">
                        <ArrowUp size={12} />
                        {item.upvotes}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="md:hidden divide-y divide-border-subtle">
            {items.map((item) => (
              <li key={item.feedback_id} className="py-4">
                <Link
                  href={`/admin/feedback/${item.feedback_id}`}
                  className="flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-text-tertiary">
                      {feedbackId(item.feedback_id)}
                    </span>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="text-text-primary">
                    {item.feedback_text.slice(0, 100)}
                    {item.feedback_text.length > 100 ? "…" : ""}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {item.service_name} · {item.location} · {relativeTime(item.date)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
