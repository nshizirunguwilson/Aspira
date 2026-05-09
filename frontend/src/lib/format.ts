import { formatDistanceToNowStrict, parseISO } from "date-fns";

export function relativeTime(value: string | Date): string {
  const date = typeof value === "string" ? parseISO(value) : value;
  return formatDistanceToNowStrict(date, { addSuffix: true });
}

export function feedbackId(id: number): string {
  return `#FB-${id.toString().padStart(5, "0")}`;
}

export function citizenId(id: number): string {
  return `#C-${id.toString().padStart(5, "0")}`;
}
