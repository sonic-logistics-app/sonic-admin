import AuthService from "../../../services/AuthService";

/**
 * Admin endpoints added for review tools, support cases, finance views and reporting.
 * Every call throws an Error carrying the server's message when the request fails.
 */

const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/api/admin";
const authService = new AuthService();

export interface Meta {
  total: number;
  page: number;
  limit: number;
}

interface Envelope<T> {
  data: T;
  meta?: Meta;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<Envelope<T>> {
  const res = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: { ...authService.getAuthHeaders(), "Content-Type": "application/json", ...(init.headers || {}) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.message || `Request failed (${res.status})`);
  return { data: body.data as T, meta: body.meta };
}

const query = (params: Record<string, string | number | undefined | null>) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : "";
};

const post = <T>(path: string, body: unknown) => request<T>(path, { method: "POST", body: JSON.stringify(body) });
const put = <T>(path: string, body: unknown) => request<T>(path, { method: "PUT", body: JSON.stringify(body) });

// ---------------------------------------------------------------- audit log
export interface AuditLog {
  id: string;
  admin_id: string | null;
  admin_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_name: string | null;
  reason: string | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export const getAuditLogs = (params: Record<string, string | number | undefined>) =>
  request<{ logs: AuditLog[] }>(`/audit-logs${query(params)}`);

// ---------------------------------------------------------------- registration stats
interface RegistrationCounts {
  total: number;
  new_today: number;
  new_last_7_days: number;
  previous_7_days: number;
  new_last_30_days: number;
  previous_30_days: number;
}

export interface RegistrationStats {
  as_of: string;
  timezone: string;
  users: RegistrationCounts & { verified: number; unverified: number };
  drivers: RegistrationCounts & { verified: number; pending_verification: number; rejected: number; available_now: number };
  vendors: RegistrationCounts & { active: number; pending_approval: number; suspended: number; inactive: number; kyc_completed: number };
  attention: {
    vendors_pending_approval: number;
    vendors_ready_to_approve: number;
    vendors_with_open_flags: number;
    vendors_with_open_corrections: number;
    drivers_pending_verification: number;
    users_unverified: number;
    orders_stuck_without_driver: number;
    refunds_pending: number;
  };
}

export const getRegistrationStats = () => request<RegistrationStats>("/dashboard/registrations");

// ---------------------------------------------------------------- vendor review
export type ReviewEventType = "CORRECTION_REQUEST" | "FLAG" | "NOTE";

export interface VendorReviewEvent {
  id: string;
  type: ReviewEventType;
  status: "open" | "resolved";
  reason: string;
  fields: string[];
  due_date: string | null;
  resolution: string | null;
  created_by: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface VendorReview {
  events: VendorReviewEvent[];
  history: AuditLog[];
  open_flags: number;
  open_corrections: number;
}

export const getVendorReview = (vendorId: string) => request<VendorReview>(`/vendor/${vendorId}/review`);
export const requestVendorCorrection = (vendorId: string, body: { fields: string[]; reason: string; due_date?: string; notify?: boolean }) =>
  post<{ notified: { email: boolean; in_app: boolean } | null }>(`/vendor/${vendorId}/corrections`, body);
export const flagVendor = (vendorId: string, reason: string) => post(`/vendor/${vendorId}/flags`, { reason });
export const addVendorNote = (vendorId: string, reason: string) => post(`/vendor/${vendorId}/notes`, { reason });
export const resolveVendorReviewEvent = (vendorId: string, eventId: string, resolution: string) =>
  put(`/vendor/${vendorId}/review-events/${eventId}/resolve`, { resolution });

// ---------------------------------------------------------------- support tickets
export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface Ticket {
  id: string;
  vendor_id: string;
  vendor: { id: string; name: string; email: string | null; phone?: string | null };
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string | null;
  assigned_to: string | null;
  first_response_at: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  message_count?: number;
  messages?: { id: string; sender: "vendor" | "support" | "internal"; message: string; created_at: string }[];
}

export interface TicketList {
  tickets: Ticket[];
  summary: {
    by_status: Record<TicketStatus, number>;
    avg_first_response_minutes: number | null;
    avg_resolution_minutes: number | null;
  };
}

export const getTickets = (params: Record<string, string | number | undefined>) => request<TicketList>(`/tickets${query(params)}`);
export const getTicket = (id: string) => request<{ ticket: Ticket }>(`/tickets/${id}`);
export const replyToTicket = (id: string, message: string) => post(`/tickets/${id}/reply`, { message });
export const addTicketNote = (id: string, message: string) => post(`/tickets/${id}/notes`, { message });
export const updateTicket = (id: string, body: Partial<Pick<Ticket, "status" | "priority" | "category" | "assigned_to">>) =>
  put(`/tickets/${id}`, body);

// ---------------------------------------------------------------- finance (read only)
export interface Payout {
  id: string;
  vendor_id: string | null;
  vendor_name: string | null;
  gross_amount: number;
  commission_amount: number;
  processing_fee: number;
  net_amount: number;
  orders_count: number;
  status: string;
  period_start_date: string;
  period_end_date: string;
  processed_date: string | null;
  provider_reference: string | null;
  failure_reason: string | null;
  retry_count: number;
  created_at: string;
}

export const getPayouts = (params: Record<string, string | number | undefined>) =>
  request<{ payouts: Payout[]; summary: { status: string; count: number; net_amount: number }[] }>(`/payouts${query(params)}`);

export interface WalletRow {
  id: string;
  owner_id: string | number;
  owner_name: string;
  owner_email: string | null;
  balance: number;
  updated_at: string;
}

export const getWallets = (params: Record<string, string | number | undefined>) =>
  request<{ type: "vendor" | "driver"; wallets: WalletRow[]; summary: { wallets: number; total_balance: number } }>(
    `/wallets${query(params)}`
  );

// ---------------------------------------------------------------- user, driver, voucher detail
export interface UserDetail {
  user: {
    id: number;
    short_code: string;
    first_name: string | null;
    last_name: string | null;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    picture: string | null;
    provider: string;
    is_verified: boolean;
    otp_verified: boolean;
    is_login: boolean;
    is_agree: boolean | null;
    welcome_voucher_used: boolean;
    created_at: string;
    last_login_at: string | null;
    deleted_at: string | null;
    suspended_at: string | null;
    suspended_reason: string | null;
    referral_code: string | null;
    referral_used: number | null;
    earn_referral: number | null;
  };
  orders: {
    total: number;
    by_status: Record<string, number>;
    recent: { id: number; order_number: string | null; order_status: string; payment_status: string; price_fees: number | null; created_at: string }[];
  };
  spend: { delivered_total: number; discounts_received: number };
  vouchers: { id: string; name: string; code: string | null; amount: number; used: number; remaining: number; used_at: string | null; expires_at: string }[];
  referrals: { given: Record<string, number>; referred_by: { id: number; name: string } | null };
}

export const getUserDetail = (id: string | number) => request<UserDetail>(`/user/${id}`);
export const suspendUser = (id: string | number, reason: string) => put(`/user/${id}/suspend`, { reason });
export const unsuspendUser = (id: string | number) => put(`/user/${id}/unsuspend`, {});

export interface DriverPerformance {
  deliveries: {
    assigned: number;
    delivered: number;
    in_progress: number;
    cancelled_by_driver: number;
    cancelled_total: number;
    completion_rate: number | null;
    cancellation_rate: number | null;
  };
  rating: { average: number | null; reviews: number };
  earnings: { total: number; deliveries_paid: number; average_per_delivery: number | null; recent: { id: string; amount: number; order_id: number; created_at: string }[] };
  wallet: { balance: number | null; movements: { type: string; status: string; count: number; amount: number }[] };
}

export const getDriverPerformance = (id: string | number) => request<DriverPerformance>(`/driver/${id}/performance`);

export interface VoucherUsage {
  voucher: { id: string; name: string; code: string | null; amount: number; expiry_type: string };
  totals: { assigned: number; redeemed: number; discount_given: number; unspent_balance: number; expired_with_balance: number };
  holders: { id: string; user_id: number; name: string | null; email: string | null; used: number; remaining: number; used_at: string | null; expires_at: string }[];
}

export const getVoucherUsage = (id: string) => request<VoucherUsage>(`/voucher/${id}/usage`);

// ---------------------------------------------------------------- vendor catalogue and finance
export interface CatalogueItem {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  category: string | null;
  in_stock: boolean;
  stock_count: number;
  is_active: boolean;
}

export const getVendorCatalogue = (vendorId: string) =>
  request<{ items: CatalogueItem[]; summary: { total: number; active: number; missing_images: number; out_of_stock: number } }>(
    `/vendor/${vendorId}/catalogue`
  );

export interface VendorFinance {
  wallet_balance: number | null;
  payouts: {
    id: string;
    status: string;
    gross_amount: number;
    net_amount: number;
    orders_count: number;
    period_start_date: string;
    period_end_date: string;
    processed_date: string | null;
    failure_reason: string | null;
  }[];
  totals: { status: string; count: number; net_amount: number }[];
}

export const getVendorFinance = (vendorId: string) => request<VendorFinance>(`/vendor/${vendorId}/finance`);

// ---------------------------------------------------------------- vendor queue and reporting

export interface RegistrationTrend {
  days: number;
  timezone: string;
  series: { date: string; users: number; drivers: number; vendors: number }[];
}

export const getRegistrationTrend = (days = 30) => request<RegistrationTrend>(`/dashboard/registrations/trend?days=${days}`);

export const getVendorLocalities = () => request<{ localities: { name: string; vendors: number }[] }>("/vendor/localities");

export const getNextPendingVendor = (exclude?: string) =>
  request<{ next: { id: string; short_code: string; name: string } | null; remaining: number }>(
    `/vendor/next-pending${exclude ? `?exclude=${encodeURIComponent(exclude)}` : ""}`,
  );

// ---------------------------------------------------------------- admin team

export interface TeamAdmin {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "super_admin" | "operations" | "support";
  status: "active" | "pending" | "disabled";
  invite_expired: boolean;
  invite_expires_at: string | null;
  created_at: string;
}

export const getTeam = () => request<{ admins: TeamAdmin[] }>("/admins");

export const inviteAdmin = (body: { email: string; first_name: string; last_name: string; role: TeamAdmin["role"] }) =>
  request<{ admin: TeamAdmin; email_sent: boolean; expires_at: string }>("/admins/invite", { method: "POST", body: JSON.stringify(body) });

export const resendAdminInvite = (id: string) =>
  request<{ email_sent: boolean; expires_at: string }>(`/admins/${id}/resend-invite`, { method: "POST", body: "{}" });

export const revokeAdminInvite = (id: string) => request<object>(`/admins/${id}/invite`, { method: "DELETE" });

export const changeAdminRole = (id: string, role: TeamAdmin["role"]) =>
  request<{ admin: TeamAdmin }>(`/admins/${id}/role`, { method: "PUT", body: JSON.stringify({ role }) });

export const setAdminDisabled = (id: string, disabled: boolean) =>
  request<{ admin: TeamAdmin }>(`/admins/${id}/${disabled ? "disable" : "enable"}`, { method: "PUT", body: "{}" });

// Public: used by the set-password page, no sign-in needed
const publicPost = async <T>(path: string, body: object): Promise<T> => {
  const res = await fetch(`${apiUrl}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || `Request failed (${res.status})`);
  return json.data as T;
};

export const checkAdminInvite = (token: string) => publicPost<{ email: string; first_name: string; role: TeamAdmin["role"] }>("/invite/check", { token });
export const acceptAdminInvite = (token: string, password: string) => publicPost<{ email: string }>("/accept-invite", { token, password });

// ---------------------------------------------------------------- vendor categories

export interface VendorCategories {
  primary: string | null;
  additional: string[];
  max_additional: number;
  live_in_customer_app: boolean;
  history: {
    id: string;
    admin_email: string | null;
    reason: string | null;
    created_at: string;
    before: { primary: string | null; additional: string[] } | null;
    after: { primary: string | null; additional: string[] } | null;
  }[];
}

export const getVendorCategories = (vendorId: string) => request<VendorCategories>(`/vendor/${vendorId}/categories`);

export const saveVendorCategories = (vendorId: string, additional: string[], reason: string) =>
  request<{ primary: string | null; additional: string[] }>(`/vendor/${vendorId}/categories`, {
    method: "PUT",
    body: JSON.stringify({ additional_business_types: additional, reason }),
  });

// ---------------------------------------------------------------- list cards

export const getListStats = (kind: "users" | "drivers" | "orders") =>
  request<{ kind: string; counts: Record<string, number> }>(`/list-stats/${kind}`);
