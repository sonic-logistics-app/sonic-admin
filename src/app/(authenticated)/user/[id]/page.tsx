"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/shared/Button";
import StatusBadge from "@/components/shared/StatusBadge";
import SkeletonLoader from "@/components/shared/SkeletonLoader";
import Toast, { ToastRef } from "@/components/shared/Toast";
import { UserDetail, getUserDetail, suspendUser, unsuspendUser } from "@/lib/api/admin/ops";

const naira = (value: number | null | undefined) => `₦${(value ?? 0).toLocaleString("en-NG")}`;
const day = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "—";

export default function UserActivityPage() {
  const params = useParams();
  const router = useRouter();
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const toast = useRef<ToastRef>(null);
  const [suspending, setSuspending] = useState(false);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () =>
    getUserDetail(params.id as string)
      .then(({ data }) => setDetail(data))
      .catch((e: Error) => setError(e.message));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const applySuspension = async (suspend: boolean) => {
    try {
      setSaving(true);
      if (suspend) await suspendUser(params.id as string, reason);
      else await unsuspendUser(params.id as string);
      toast.current?.show({ severity: "success", summary: suspend ? "Suspended" : "Reinstated", detail: suspend ? "The customer is signed out and cannot sign in." : "The customer can sign in again.", life: 4000 });
      setSuspending(false);
      setReason("");
      await load();
    } catch (e: any) {
      toast.current?.show({ severity: "error", summary: "Could not update", detail: e.message, life: 4000 });
    } finally {
      setSaving(false);
    }
  };

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-[14px] text-[#DC2626] mb-4">{error}</p>
        <Button variant="outline" onClick={() => router.push("/user")}>Back to customers</Button>
      </div>
    );
  }
  if (!detail) return <SkeletonLoader type="table" rows={6} />;

  const { user, orders, spend, vouchers, referrals } = detail;
  const name = user.full_name || [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email || `Customer ${user.id}`;
  const given = Object.values(referrals.given).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col gap-6">
      <Toast ref={toast} />
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push("/user")} className="px-3 py-2">
            <i className="pi pi-arrow-left mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-[24px] font-bold text-[#111827]">Customer Details</h1>
            <p className="text-[13px] text-[#525866]">Code: {user.short_code}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={user.is_verified ? "VERIFIED" : "PENDING"} />
          {user.suspended_at && <span className="text-[11px] px-2 py-1 rounded-full bg-[#FEF3C7] text-[#92400E] font-semibold">Suspended {day(user.suspended_at)}</span>}
          {!user.deleted_at && (user.suspended_at ? (
            <Button size="sm" variant="success" loading={saving} onClick={() => applySuspension(false)}>Reinstate</Button>
          ) : (
            <Button size="sm" variant="danger" onClick={() => setSuspending(true)}>Suspend</Button>
          ))}
          {user.deleted_at && <span className="text-[11px] px-2 py-1 rounded-full bg-[#FEE2E2] text-[#991B1B] font-semibold">Deleted {day(user.deleted_at)}</span>}
        </div>
      </div>

      <div>
        <p className="text-[18px] font-semibold text-[#111827]">{name}</p>
        <p className="text-[13px] text-[#525866]">
          {user.email || "no email"} · {user.phone || "no phone"} · joined {day(user.created_at)}
          {user.last_login_at ? ` · last login ${day(user.last_login_at)}` : " · never logged in"}
        </p>
      </div>

      {user.suspended_at && user.suspended_reason && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-[13px] text-orange-800">
          Suspended: {user.suspended_reason}. The customer is signed out and cannot sign in until reinstated.
        </div>
      )}

      {suspending && (
        <div className="border border-[#DC2626] rounded-lg p-4 bg-[#FEF2F2] space-y-3">
          <p className="text-[13px] text-[#991B1B]">
            Suspending signs the customer out and blocks sign-in. Their account and order history stay intact, and you can reinstate them any time.
          </p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="Reason (required)"
            className="w-full px-3 py-2 border border-[#E1E4EA] rounded-lg text-[13px] bg-white"
          />
          <div className="flex gap-2">
            <Button size="sm" variant="danger" disabled={!reason.trim() || saving} loading={saving} onClick={() => applySuspension(true)}>Suspend customer</Button>
            <Button size="sm" variant="ghost" onClick={() => setSuspending(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          ["Orders", String(orders.total)],
          ["Delivered", String(orders.by_status.DELIVERED ?? 0)],
          ["Total spent (delivered)", naira(spend.delivered_total)],
          ["Discounts received", naira(spend.discounts_received)],
          ["Signed up with", user.provider === "CREDENTIALS" ? "Email and password" : user.provider],
          ["Phone verified (OTP)", user.otp_verified ? "Yes" : "No"],
          ["Referrals made", String(given)],
          ["Referred by", referrals.referred_by?.name || "—"],
        ].map(([k, v]) => (
          <div key={k} className="border border-[#E1E4EA] rounded-lg p-4 bg-white">
            <p className="text-[11px] uppercase tracking-wider text-[#525866]">{k}</p>
            <p className="text-[16px] font-bold text-[#111827]">{v}</p>
          </div>
        ))}
      </div>

      <div className="border border-[#E1E4EA] rounded-lg p-6 bg-white">
        <h2 className="text-[15px] font-semibold text-[#111827] mb-3">Recent orders</h2>
        {orders.recent.length === 0 ? (
          <p className="text-[13px] text-[#525866]">No orders yet.</p>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-[#525866]">
                <th className="py-2">Order</th>
                <th className="py-2">Status</th>
                <th className="py-2">Payment</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.recent.map((o) => (
                <tr key={o.id} className="border-t border-[#E1E4EA]">
                  <td className="py-2">
                    <Link href={`/order/${o.order_number || o.id}`} className="text-[#2563EB] hover:underline">{o.order_number || `#${o.id}`}</Link>
                  </td>
                  <td className="py-2"><StatusBadge status={o.order_status} /></td>
                  <td className="py-2">{o.payment_status}</td>
                  <td className="py-2">{naira(o.price_fees)}</td>
                  <td className="py-2">{day(o.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {orders.total > orders.recent.length && (
          <Link href={`/order?search=${encodeURIComponent(user.email || user.phone || String(user.id))}`} className="inline-block mt-3 text-[13px] text-[#2563EB] hover:underline">
            See all {orders.total} orders
          </Link>
        )}
      </div>

      <div className="border border-[#E1E4EA] rounded-lg p-6 bg-white">
        <h2 className="text-[15px] font-semibold text-[#111827] mb-3">Vouchers</h2>
        {vouchers.length === 0 ? (
          <p className="text-[13px] text-[#525866]">No vouchers.</p>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-[#525866]">
                <th className="py-2">Voucher</th>
                <th className="py-2">Value</th>
                <th className="py-2">Spent</th>
                <th className="py-2">Left</th>
                <th className="py-2">Expires</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map((v) => (
                <tr key={v.id} className="border-t border-[#E1E4EA]">
                  <td className="py-2">{v.name}{v.code ? ` (${v.code})` : ""}</td>
                  <td className="py-2">{naira(v.amount)}</td>
                  <td className="py-2">{naira(v.used)}</td>
                  <td className="py-2">{naira(v.remaining)}</td>
                  <td className="py-2">{day(v.expires_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
