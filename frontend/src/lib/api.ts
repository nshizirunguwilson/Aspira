import axios, { AxiosError, AxiosInstance } from "axios";

import type {
  AdminActivityEvent,
  AdminCommentItem,
  AdminStats,
  AdminSummary,
  CitizenSummary,
  CurrentUser,
  FeedbackDetail,
  FeedbackItem,
  FeedbackListResponse,
  FeedbackStatus,
  ServiceItem,
} from "@/types";

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const api: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: string }>) => {
    if (error.response?.status === 401) {
      // Auth store handles redirect; just propagate.
    }
    return Promise.reject(error);
  },
);

export function apiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError<{ detail?: string }>(error)) {
    return error.response?.data?.detail ?? error.message ?? fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

export interface CitizenRegisterPayload {
  full_name: string;
  phone_number: string;
  id_number: string;
  address: string;
  password: string;
  confirm_password: string;
}

export interface CitizenLoginPayload {
  phone_number: string;
  password: string;
}

export interface AdminLoginPayload {
  username: string;
  password: string;
}

export const auth = {
  registerCitizen: (payload: CitizenRegisterPayload) =>
    api.post<{ citizen_id: number; message: string }>(
      "/api/auth/citizen/register",
      payload,
    ),
  loginCitizen: (payload: CitizenLoginPayload) =>
    api.post<{ access_token: string; citizen: CitizenSummary }>(
      "/api/auth/citizen/login",
      payload,
    ),
  loginAdmin: (payload: AdminLoginPayload) =>
    api.post<{ access_token: string; admin: AdminSummary }>(
      "/api/auth/admin/login",
      payload,
    ),
  logout: () => api.post("/api/auth/logout"),
  me: () => api.get<CurrentUser>("/api/auth/me"),
};

export interface ListFeedbackParams {
  service_id?: number;
  status?: "pending" | "in_progress" | "solved" | "cancelled";
  search?: string;
  sort_by?: "upvotes" | "date";
  page?: number;
  per_page?: number;
}

export interface CreateFeedbackPayload {
  service_id: number;
  location: string;
  frequency: "once" | "weekly" | "daily" | "ongoing";
  feedback_text: string;
  attachment_urls?: string[];
}

export const feedback = {
  list: (params: ListFeedbackParams = {}) =>
    api.get<FeedbackListResponse>("/api/feedback", { params }),
  detail: (id: number) => api.get<FeedbackDetail>(`/api/feedback/${id}`),
  mine: () => api.get<FeedbackDetail[]>("/api/feedback/citizen/mine"),
  create: (payload: CreateFeedbackPayload) =>
    api.post<FeedbackItem>("/api/feedback", payload),
  toggleUpvote: (id: number) =>
    api.post<{ upvotes: number; upvoted: boolean }>(
      `/api/feedback/${id}/upvote`,
    ),
};

export const services = {
  list: () => api.get<ServiceItem[]>("/api/services"),
};

export type AdminListParams = ListFeedbackParams;

export interface AdminStatusUpdatePayload {
  status: FeedbackStatus;
  comment: string;
}

export const admin = {
  stats: () => api.get<AdminStats>("/api/admin/stats"),
  activity: () => api.get<AdminActivityEvent[]>("/api/admin/activity"),
  listFeedback: (params: AdminListParams = {}) =>
    api.get<FeedbackListResponse>("/api/admin/feedback", { params }),
  feedbackDetail: (id: number) =>
    api.get<FeedbackDetail>(`/api/admin/feedback/${id}`),
  updateStatus: (id: number, payload: AdminStatusUpdatePayload) =>
    api.patch<FeedbackItem>(`/api/admin/feedback/${id}/status`, payload),
  addComment: (id: number, comment_text: string) =>
    api.post<AdminCommentItem>(`/api/admin/feedback/${id}/comment`, {
      comment_text,
    }),
  exportCsvUrl: () => `${baseURL}/api/admin/feedback/export`,
};
