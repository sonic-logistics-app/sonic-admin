import AuthService from "../../../services/AuthService";
import type { Audience, BroadcastCounts, Channel } from "../../broadcast";

/** Broadcast endpoints. Every call throws an Error carrying the server's message; `code` and `counts` come from the server too. */

const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/api/admin";
const authService = new AuthService();

export class BroadcastApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public counts?: { email: number; sms: number; in_app: number },
    public smsSegments?: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<{ data: T; meta?: { total: number; page: number; limit: number } }> {
  let res: Response;
  try {
    res = await fetch(`${apiUrl}${path}`, {
      ...init,
      headers: { ...authService.getAuthHeaders(), "Content-Type": "application/json", ...(init.headers || {}) },
    });
  } catch {
    throw new BroadcastApiError("Could not reach the server. Check your connection and try again.", 0, "NETWORK");
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      res.status === 429
        ? body?.message || "Too many requests. Please wait a moment and try again."
        : res.status >= 500
          ? "Something went wrong on the server. Nothing was sent. Please try again."
          : body?.message || `Request failed (${res.status})`;
    throw new BroadcastApiError(message, res.status, body?.error?.error_code, body?.error?.counts, body?.error?.sms_segments);
  }
  return { data: body.data as T, meta: body.meta };
}

export interface BroadcastConfig {
  dry_run: boolean;
  max_sms_recipients: number;
  sms_unit_cost_ngn: number | null;
  /** Movers also get a saved notification in the Mover app (off until the app can show it) */
  mover_inbox: boolean;
  audiences: Record<Audience, { label: string; segments: Record<string, string> }>;
}

export interface PreviewResult {
  total_accounts: number;
  counts: { email: number; sms: number; in_app: number };
  sms: {
    characters: number;
    encoding: string;
    segments_per_message: number;
    total_segments: number;
    estimated_cost_ngn: number | null;
  } | null;
}

export interface BroadcastRecord {
  id: string;
  admin_email: string | null;
  audience: Audience;
  segment: string;
  channels: Channel[];
  title: string;
  message: string;
  sms_text: string | null;
  status: "sending" | "done" | "dry_run" | "failed";
  dry_run: boolean;
  counts: BroadcastCounts;
  /** How many people each channel can still be retried for */
  retryable: { email: number; sms: number; in_app: number };
  retry_count: number;
  created_at: string;
  finished_at: string | null;
}

export interface Draft {
  audience: Audience;
  segment: string;
  channels: Channel[];
  title: string;
  message: string;
  sms_text?: string | null;
}

export const getBroadcastConfig = () => request<BroadcastConfig>("/broadcast/config");

export const previewBroadcast = (draft: Draft) =>
  request<PreviewResult>("/broadcast/preview", { method: "POST", body: JSON.stringify(draft) });

export const sendBroadcast = (
  draft: Draft & {
    confirm: { email: number; sms: number; in_app: number; sms_segments?: number };
    confirm_sms: boolean;
    idempotency_key: string;
  },
) => request<BroadcastRecord>("/broadcast/send", { method: "POST", body: JSON.stringify(draft) });

export const sendTestBroadcast = (body: { channel: "email" | "sms"; to: string; title: string; message: string; sms_text?: string | null }) =>
  request<{ sent: boolean; dry_run: boolean; segments?: number }>("/broadcast/test", { method: "POST", body: JSON.stringify(body) });

export const getBroadcast = (id: string) => request<BroadcastRecord>(`/broadcast/${id}`);

export const listBroadcasts = (page = 1, limit = 10) =>
  request<{ broadcasts: BroadcastRecord[] }>(`/broadcast?page=${page}&limit=${limit}`);

export interface RetryPreview {
  counts: { email: number; sms: number; in_app: number };
  channels: Channel[];
  sms: PreviewResult["sms"];
  /** retry_count seen now; sent back so a stale screen cannot start the same retry twice */
  attempt: number;
}

export const previewRetry = (id: string) => request<RetryPreview>(`/broadcast/${id}/retry-preview`);

export const retryBroadcast = (
  id: string,
  body: { confirm: { email: number; sms: number; in_app: number; sms_segments?: number }; confirm_sms: boolean; attempt: number },
) => request<BroadcastRecord>(`/broadcast/${id}/retry`, { method: "POST", body: JSON.stringify(body) });
