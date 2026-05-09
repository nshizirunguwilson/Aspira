export type FeedbackStatus =
  | "pending"
  | "in_progress"
  | "solved"
  | "cancelled";

export type FeedbackFrequency = "once" | "weekly" | "daily" | "ongoing";

export interface ServiceItem {
  service_id: number;
  service_name: string;
  icon_name: string;
  description: string | null;
}

export interface FeedbackItem {
  feedback_id: number;
  service_id: number;
  service_name: string;
  location: string;
  frequency: FeedbackFrequency;
  feedback_text: string;
  status: FeedbackStatus;
  upvotes: number;
  upvoted_by_me?: boolean;
  date: string;
  attachment_urls: string[];
  citizen_id: number;
}

export interface TimelineEvent {
  event_id: number;
  event_type: "submission" | "comment" | "status_change";
  description: string;
  comment_text: string | null;
  old_status: string | null;
  new_status: string | null;
  admin_username: string | null;
  created_at: string;
}

export interface FeedbackDetail extends FeedbackItem {
  timeline: TimelineEvent[];
}

export interface FeedbackListResponse {
  items: FeedbackItem[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface CitizenSummary {
  id: number;
  name: string;
}

export interface AdminSummary {
  id: number;
  username: string;
  email: string;
  role: "super_admin" | "service_admin";
}

export interface CurrentUser {
  type: "citizen" | "admin";
  id: number;
  name: string;
}

export interface ServiceStat {
  service_id: number;
  service_name: string;
  count: number;
}

export interface WeekStat {
  week_start: string;
  label: string;
  count: number;
}

export interface AdminStats {
  total_submissions: number;
  open_issues: number;
  resolved_this_month: number;
  avg_response_hours: number;
  submissions_by_service: ServiceStat[];
  submissions_by_week: WeekStat[];
  change_vs_last_month: number;
}

export interface AdminActivityEvent {
  event_id: number;
  feedback_id: number;
  service_name: string;
  location: string;
  description: string;
  event_type: "comment" | "status_change";
  new_status: string | null;
  created_at: string;
}

export interface AdminCommentItem {
  comment_id: number;
  feedback_id: number;
  admin_username: string;
  comment_text: string;
  event_type: "comment" | "status_change";
  old_status: string | null;
  new_status: string | null;
  created_at: string;
}
