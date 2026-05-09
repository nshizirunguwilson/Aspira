export type FeedbackStatus =
  | "pending"
  | "in_progress"
  | "solved"
  | "cancelled";

export interface FeedbackItem {
  feedback_id: number;
  service_id: number;
  service_name: string;
  location: string;
  frequency: "once" | "weekly" | "daily" | "ongoing";
  feedback_text: string;
  status: FeedbackStatus;
  upvotes: number;
  upvoted_by_me?: boolean;
  date: string;
  attachment_urls: string[];
  citizen_id: number;
}
