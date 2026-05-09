"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock, Search, TrendingUp } from "lucide-react";

import { FeedbackCard } from "@/components/feedback/FeedbackCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import {
  feedback as feedbackApi,
  services as servicesApi,
  apiErrorMessage,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import type { FeedbackItem, ServiceItem } from "@/types";

type StatusFilter = "all" | "pending" | "in_progress" | "solved";
type SortBy = "upvotes" | "date";

const STATUS_OPTIONS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "in_progress", label: "In Progress" },
  { id: "solved", label: "Solved" },
];

export function FeedbackBoard() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [serviceId, setServiceId] = useState<number | "all">("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("upvotes");

  const [items, setItems] = useState<FeedbackItem[]>([]);
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
    feedbackApi
      .list({
        service_id: serviceId === "all" ? undefined : serviceId,
        status: statusFilter === "all" ? undefined : statusFilter,
        search: debouncedSearch || undefined,
        sort_by: sortBy,
        per_page: 24,
      })
      .then(({ data }) => {
        if (!cancelled) setItems(data.items);
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

  const isFiltering = useMemo(
    () =>
      Boolean(debouncedSearch) ||
      serviceId !== "all" ||
      statusFilter !== "all",
    [debouncedSearch, serviceId, statusFilter],
  );

  function clearFilters() {
    setServiceId("all");
    setStatusFilter("all");
    setSearch("");
  }

  return (
    <section className="space-y-6">
      <div className="sticky z-40 -mx-6 px-6 py-4 bg-bg-base/90 backdrop-blur-md border-b border-border-subtle"
        style={{ top: "var(--nav-height)" }}
      >
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

          <div className="lg:ml-auto flex items-center gap-1">
            <span className="text-xs uppercase tracking-widest text-text-tertiary mr-2">
              Sort
            </span>
            <Button
              variant={sortBy === "upvotes" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setSortBy("upvotes")}
              aria-pressed={sortBy === "upvotes"}
            >
              <TrendingUp size={14} />
              Upvotes
            </Button>
            <Button
              variant={sortBy === "date" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setSortBy("date")}
              aria-pressed={sortBy === "date"}
            >
              <Clock size={14} />
              Recent
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-48 rounded-xl bg-bg-subtle border border-border-subtle animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-status-cancelled/30 bg-status-cancelled-bg p-6 text-sm text-status-cancelled">
          {error}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-text-secondary mb-2">
            No feedback matches your filters.
          </p>
          <p className="text-sm text-text-tertiary mb-6">
            Try adjusting the service or status filter, or search for something
            different.
          </p>
          {isFiltering ? (
            <Button variant="ghost" onClick={clearFilters}>
              Clear filters
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <FeedbackCard key={item.feedback_id} item={item} />
          ))}
        </div>
      )}

      {!loading && items.length > 0 ? (
        <p className="text-center text-sm text-text-tertiary py-4">
          Showing {items.length} item{items.length === 1 ? "" : "s"}
        </p>
      ) : null}
    </section>
  );
}
