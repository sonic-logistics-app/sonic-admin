"use client";

import { useEffect, useState } from "react";
import Button from "@/components/shared/Button";
import { VoucherUsage, getVoucherUsage } from "@/lib/api/admin/ops";

const naira = (value: number) => `₦${value.toLocaleString("en-NG")}`;
const day = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "—");

interface Props {
  voucherId: string | null;
  onClose: () => void;
}

/** Who holds a voucher, how much of it was spent and what is left. */
export default function VoucherUsageDialog({ voucherId, onClose }: Props) {
  // Tagged with the voucher it belongs to, so opening another voucher shows loading without a reset in the effect
  const [loaded, setLoaded] = useState<{ id: string; usage?: VoucherUsage; error?: string } | null>(null);
  const mine = loaded && loaded.id === voucherId ? loaded : null;
  const usage = mine?.usage ?? null;
  const error = mine?.error ?? null;

  useEffect(() => {
    if (!voucherId) return;
    let cancelled = false;
    getVoucherUsage(voucherId)
      .then(({ data }) => !cancelled && setLoaded({ id: voucherId, usage: data }))
      .catch((e: Error) => !cancelled && setLoaded({ id: voucherId, error: e.message }));
    return () => {
      cancelled = true;
    };
  }, [voucherId]);

  useEffect(() => {
    if (!voucherId) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [voucherId, onClose]);

  if (!voucherId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-[18px] font-semibold text-[#111827]">{usage ? usage.voucher.name : "Voucher usage"}</h2>
            {usage && (
              <p className="text-[12px] text-[#525866]">
                {usage.voucher.code ? `Code ${usage.voucher.code} · ` : ""}Face value {naira(usage.voucher.amount)}
              </p>
            )}
          </div>
          <Button size="sm" variant="ghost" onClick={onClose}>Close</Button>
        </div>

        {error && <p className="text-[13px] text-[#DC2626]">{error}</p>}
        {!usage && !error && <p className="text-[13px] text-[#525866]">Loading...</p>}

        {usage && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                ["Given to", `${usage.totals.assigned} users`],
                ["Redeemed by", `${usage.totals.redeemed} users`],
                ["Discount given", naira(usage.totals.discount_given)],
                ["Unspent balance", naira(usage.totals.unspent_balance)],
                ["Expired unspent", `${usage.totals.expired_with_balance} users`],
              ].map(([k, v]) => (
                <div key={k} className="border border-[#E1E4EA] rounded-lg p-3">
                  <p className="text-[11px] uppercase tracking-wider text-[#525866]">{k}</p>
                  <p className="text-[15px] font-bold text-[#111827]">{v}</p>
                </div>
              ))}
            </div>

            {usage.holders.length === 0 ? (
              <p className="text-center py-8 bg-[#F9FAFB] rounded-lg text-[13px] text-[#525866]">Nobody holds this voucher yet.</p>
            ) : (
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wider text-[#525866]">
                    <th className="py-2">User</th>
                    <th className="py-2">Spent</th>
                    <th className="py-2">Left</th>
                    <th className="py-2">Last used</th>
                    <th className="py-2">Expires</th>
                  </tr>
                </thead>
                <tbody>
                  {usage.holders.map((h) => (
                    <tr key={h.id} className="border-t border-[#E1E4EA]">
                      <td className="py-2">
                        <a href={`/user/${h.user_id}`} className="text-[#2563EB] hover:underline">{h.name || h.email || `User ${h.user_id}`}</a>
                      </td>
                      <td className="py-2">{naira(h.used)}</td>
                      <td className="py-2">{naira(h.remaining)}</td>
                      <td className="py-2">{day(h.used_at)}</td>
                      <td className="py-2">{day(h.expires_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {usage.holders.length >= 100 && <p className="text-[11px] text-[#9CA3AF]">Showing the first 100 holders.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
