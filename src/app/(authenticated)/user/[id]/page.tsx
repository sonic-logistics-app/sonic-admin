"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/shared/Button";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import StatusBadge from "@/components/shared/StatusBadge";
import SkeletonLoader from "@/components/shared/SkeletonLoader";
import Toast, { ToastRef } from "@/components/shared/Toast";
import { UserDetail, getUserDetail, suspendUser, unsuspendUser } from "@/lib/api/admin/ops";
import CustomerService from "@/lib/api/admin/customers";
import { usePermissions } from "@/lib/auth/permissions";

const naira = (value: number | null | undefined) => `₦${(value ?? 0).toLocaleString("en-NG")}`;
const day = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "—";

const customerService = new CustomerService();

interface Confirm {
  title: string;
  message: string;
  variant: "primary" | "danger" | "success";
  run: () => Promise<void>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-1">{label}</label>
      {children}
    </div>
  );
}

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { can } = usePermissions();
  const toast = useRef<ToastRef>(null);
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [suspending, setSuspending] = useState(false);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone: "" });
  const [confirm, setConfirm] = useState<Confirm | null>(null);

  const load = () =>
    getUserDetail(params.id as string)
      .then(({ data }) => setDetail(data))
      .catch((e: Error) => setError(e.message));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const notify = (severity: "success" | "error" | "warn", summary: string, detailText: string) =>
    toast.current?.show({ severity, summary, detail: detailText, life: 4000 });

  const run = async (work: () => Promise<void>) => {
    try {
      setSaving(true);
      await work();
    } catch (e: any) {
      notify("error", "Could not complete", e.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const applySuspension = (suspend: boolean) =>
    run(async () => {
      if (suspend) await suspendUser(params.id as string, reason);
      else await unsuspendUser(params.id as string);
      notify("success", suspend ? "Suspended" : "Reinstated", suspend ? "The user is signed out and cannot sign in." : "The user can sign in again.");
      setSuspending(false);
      setReason("");
      await load();
    });

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-[14px] text-[#DC2626] mb-4">{error}</p>
        <Button variant="outline" onClick={() => router.push("/user")}>Back to users</Button>
      </div>
    );
  }
  if (!detail) return <SkeletonLoader type="table" rows={6} />;

  const { user, orders, spend, vouchers, referrals } = detail;
  const name = user.full_name || [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email || `User ${user.id}`;
  const initials = ((user.first_name?.charAt(0) || "") + (user.last_name?.charAt(0) || "")).toUpperCase() || "?";
  const given = Object.values(referrals.given).reduce((a, b) => a + b, 0);

  const startEdit = () => {
    setForm({ first_name: user.first_name ?? "", last_name: user.last_name ?? "", email: user.email ?? "", phone: user.phone ?? "" });
    setEditing(true);
  };

  const saveEdit = () =>
    run(async () => {
      await customerService.updateCustomer(user.id, {
        first_name: form.first_name.trim() || null,
        last_name: form.last_name.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
      });
      notify("success", "Saved", "User details updated.");
      setEditing(false);
      await load();
    });

  const verify = () =>
    run(async () => {
      await customerService.verifyCustomer(user.id);
      await load();
      notify("success", "Verified", `${name} is verified.`);
    });

  const ensureVoucher = () =>
    run(async () => {
      await customerService.ensureVoucher(user.id);
      await load();
      notify("success", "Done", "Welcome voucher ensured for this user.");
    });

  const remove = () =>
    run(async () => {
      await customerService.deleteCustomer(user.id);
      router.push("/user");
    });

  const input = "w-full px-3 py-2 border border-[#E1E4EA] rounded-lg text-[13px] focus:outline-none focus:border-[#2563EB]";
  const value = "text-[13px] text-[#111827]";

  return (
    <div className="flex flex-col gap-6">
      <Toast ref={toast} />
      <ConfirmDialog
        visible={!!confirm}
        onHide={() => setConfirm(null)}
        onConfirm={() => {
          const action = confirm?.run;
          setConfirm(null);
          action?.();
        }}
        title={confirm?.title ?? ""}
        message={confirm?.message ?? ""}
        confirmVariant={confirm?.variant ?? "primary"}
        icon="pi-exclamation-triangle"
      />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push("/user")} className="px-3 py-2">
            <i className="pi pi-arrow-left mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-[24px] font-bold text-[#111827]">User Details</h1>
            <p className="text-[13px] text-[#525866]">Code: {user.short_code}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {user.deleted_at ? (
            <span className="text-[11px] px-2 py-1 rounded-full bg-[#FEE2E2] text-[#991B1B] font-semibold">Deleted {day(user.deleted_at)}</span>
          ) : editing ? (
            <>
              <Button variant="outline" onClick={() => setEditing(false)} disabled={saving}>Cancel</Button>
              <Button loading={saving} onClick={saveEdit}>
                <i className="pi pi-check mr-2" />
                Save changes
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" disabled={!can("account.edit")} onClick={startEdit}>
                <i className="pi pi-pencil mr-2" />
                Edit
              </Button>
              {!user.is_verified && can("account.verify") && (
                <Button
                  variant="success"
                  disabled={saving}
                  onClick={() => setConfirm({ title: "Confirm Verification", message: `Are you sure you want to verify ${name}?`, variant: "success", run: verify })}
                >
                  <i className="pi pi-check mr-2" />
                  Verify user
                </Button>
              )}
              {user.is_verified && can("account.edit") && (
                <Button variant="outline" disabled={saving} onClick={ensureVoucher}>
                  <i className="pi pi-ticket mr-2" />
                  Ensure welcome voucher
                </Button>
              )}
              {can("account.suspend") &&
                (user.suspended_at ? (
                  <Button variant="success" loading={saving} onClick={() => applySuspension(false)}>Reinstate</Button>
                ) : (
                  <Button variant="outline" onClick={() => setSuspending(true)}>Suspend</Button>
                ))}
              <Button
                variant="danger"
                disabled={!can("account.delete") || saving}
                onClick={() =>
                  setConfirm({ title: "Confirm Deletion", message: `Are you sure you want to delete ${name}? This action cannot be undone.`, variant: "danger", run: remove })
                }
              >
                <i className="pi pi-trash mr-2" />
                Delete user
              </Button>
            </>
          )}
        </div>
      </div>

      {user.suspended_at && user.suspended_reason && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-[13px] text-orange-800">
          Suspended {day(user.suspended_at)}: {user.suspended_reason}. The user is signed out and cannot sign in until reinstated.
        </div>
      )}

      {suspending && (
        <div className="border border-[#DC2626] rounded-lg p-4 bg-[#FEF2F2] space-y-3">
          <p className="text-[13px] text-[#991B1B]">
            Suspending signs the user out and blocks sign-in. Their account and order history stay intact, and you can reinstate them any time.
          </p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="Reason (required)"
            className="w-full px-3 py-2 border border-[#E1E4EA] rounded-lg text-[13px] bg-white"
          />
          <div className="flex gap-2">
            <Button size="sm" variant="danger" disabled={!reason.trim() || saving} loading={saving} onClick={() => applySuspension(true)}>Suspend user</Button>
            <Button size="sm" variant="ghost" onClick={() => setSuspending(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Details */}
      <div className="border border-[#E1E4EA] rounded-2xl bg-white">
        <div className="flex items-center gap-4 p-6 border-b border-[#E1E4EA]">
          {user.picture ? (
            <img src={user.picture} alt={name} className="w-14 h-14 rounded-full object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-[18px] font-semibold">{initials}</div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-[20px] font-semibold text-[#111827] truncate">{name}</h2>
            <p className="text-[13px] text-[#525866]">
              {user.email || "no email"} · {user.phone || "no phone"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={user.is_verified ? "VERIFIED" : "PENDING"} />
            {user.suspended_at && <span className="text-[11px] px-2 py-1 rounded-full bg-[#FEF3C7] text-[#92400E] font-semibold">Suspended</span>}
          </div>
        </div>

        <div className="p-6 space-y-6">
          <section>
            <h3 className="text-[15px] font-semibold text-[#111827] mb-4">Personal information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="First name">
                {editing ? <input className={input} value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /> : <p className={value}>{user.first_name || "N/A"}</p>}
              </Field>
              <Field label="Last name">
                {editing ? <input className={input} value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /> : <p className={value}>{user.last_name || "N/A"}</p>}
              </Field>
              <Field label="Email">
                {editing ? <input type="email" className={input} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /> : <p className={value}>{user.email || "N/A"}</p>}
              </Field>
              <Field label="Phone">
                {editing ? <input type="tel" className={input} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /> : <p className={value}>{user.phone || "N/A"}</p>}
              </Field>
            </div>
          </section>

          <section>
            <h3 className="text-[15px] font-semibold text-[#111827] mb-4">Account status</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="Verification"><StatusBadge status={user.is_verified ? "VERIFIED" : "PENDING"} /></Field>
              <Field label="Phone verified (OTP)"><StatusBadge status={user.otp_verified ? "VERIFIED" : "PENDING"} /></Field>
              <Field label="Signed up with">
                <span className="text-[11px] px-2 py-1 rounded-full bg-[#F3F4F6] text-[#525866] font-medium">
                  {user.provider === "CREDENTIALS" ? "Email and password" : user.provider}
                </span>
              </Field>
              <Field label="Currently logged in"><StatusBadge status={user.is_login ? "ACTIVE" : "INACTIVE"} /></Field>
            </div>
          </section>

          <section>
            <h3 className="text-[15px] font-semibold text-[#111827] mb-4">Account history</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="Joined"><p className={value}>{day(user.created_at)}</p></Field>
              <Field label="Last login"><p className={value}>{user.last_login_at ? day(user.last_login_at) : "Never logged in"}</p></Field>
              <Field label="Welcome voucher"><p className={value}>{user.welcome_voucher_used ? "Used" : "Not used"}</p></Field>
              <Field label="Terms agreed"><StatusBadge status={user.is_agree ? "AGREED" : "PENDING"} /></Field>
            </div>
          </section>

          {user.referral_code && (
            <section>
              <h3 className="text-[15px] font-semibold text-[#111827] mb-4">Referral information</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Field label="Referral code"><p className={`${value} font-mono bg-[#F3F4F6] px-2 py-1 rounded inline-block`}>{user.referral_code}</p></Field>
                <Field label="Referrals used"><p className={value}>{user.referral_used || 0}</p></Field>
                <Field label="Earnings from referrals"><p className={value}>{naira(user.earn_referral)}</p></Field>
                <Field label="Referred by"><p className={value}>{referrals.referred_by?.name || "—"}</p></Field>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Activity */}
      <div>
        <h2 className="text-[18px] font-semibold text-[#111827]">Activity</h2>
        <p className="text-[13px] text-[#525866]">Orders, spend, vouchers and referrals for this user.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          ["Orders", String(orders.total)],
          ["Delivered", String(orders.by_status.DELIVERED ?? 0)],
          ["Total spent (delivered)", naira(spend.delivered_total)],
          ["Discounts received", naira(spend.discounts_received)],
          ["Referrals made", String(given)],
          ["Vouchers held", String(vouchers.length)],
        ].map(([k, v]) => (
          <div key={k} className="border border-[#E1E4EA] rounded-lg p-4 bg-white">
            <p className="text-[11px] uppercase tracking-wider text-[#525866]">{k}</p>
            <p className="text-[16px] font-bold text-[#111827]">{v}</p>
          </div>
        ))}
      </div>

      <div className="border border-[#E1E4EA] rounded-lg p-6 bg-white">
        <h3 className="text-[15px] font-semibold text-[#111827] mb-3">Recent orders</h3>
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
        <h3 className="text-[15px] font-semibold text-[#111827] mb-3">Vouchers</h3>
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
