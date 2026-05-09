import { Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import type { FeedbackStatus } from "@/types";

const STATUS_LABEL: Record<FeedbackStatus, string> = {
  pending: "Pending",
  in_progress: "In progress",
  solved: "Solved",
  cancelled: "Cancelled",
};

const STATUS_STYLE: Record<FeedbackStatus, string> = {
  pending: "bg-status-pending-bg text-status-pending",
  in_progress: "bg-status-progress-bg text-status-progress",
  solved: "bg-status-solved-bg text-status-solved",
  cancelled: "bg-status-cancelled-bg text-status-cancelled",
};

const STATUS_ICON: Record<FeedbackStatus, typeof Clock> = {
  pending: Clock,
  in_progress: Loader2,
  solved: CheckCircle2,
  cancelled: XCircle,
};

export function StatusBadge({
  status,
  className,
}: {
  status: FeedbackStatus;
  className?: string;
}) {
  const Icon = STATUS_ICON[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        STATUS_STYLE[status],
        className,
      )}
    >
      <Icon size={12} />
      {STATUS_LABEL[status]}
    </span>
  );
}
