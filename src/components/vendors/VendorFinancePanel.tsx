"use client";

import { useEffect, useState } from "react";
import StatusBadge from "@/components/shared/StatusBadge";
import { VendorFinance, getVendorFinance } from "@/lib/api/admin/ops";

const naira = (value: number) => `₦${value.toLocaleString("en-NG")}`;
const day = (iso: string) => new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

/** Wallet balance and payout history for one vendor (read only). */
export default function VendorFinancePanel({ vendorId }: { vendorId: string }) {
  const [finance, setFinance] = useState<VendorFinance | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getVendorFinance(vendorId)
      .then(({ data }) => !cancelled && setFinance(data))
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [vendorId]);

  if (error) return <p className="text-[13px] text-[#DC2626]">{error}</p>;
  if (!finance) return <p className="text-[13px] text-[#525866]">Loading wallet and payouts...</p>;

  return (
    <div className="space-y-4">
      <div className="border border-[#E1E4EA] rounded-lg p-6">
        <h3 className="text-[15px] font-semibold text-[#111827] mb-3">Wallet and payouts</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-[#F9FAFB] rounded-lg p-4">
            <p className="text-[11px] uppercase tracking-wider text-[#525866]">Wallet balance</p>
            <p className="text-[18px] font-bold text-[#111827]">{finance.wallet_balance === null ? "No wallet" : naira(finance.wallet_balance)}</p>
          </div>
          {finance.totals.map((t) => (
            <div key={t.status} className="bg-[#F9FAFB] rounded-lg p-4">
              <p className="text-[11px] uppercase tracking-wider text-[#525866]">{t.status} payouts ({t.count})</p>
              <p className="text-[18px] font-bold text-[#111827]">{naira(t.net_amount)}</p>
            </div>
          ))}
        </div>

        {finance.payouts.length === 0 ? (
          <p className="text-[13px] text-[#525866]">No payouts yet.</p>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-[#525866]">
                <th className="py-2">Period</th>
                <th className="py-2">Orders</th>
                <th className="py-2">Gross</th>
                <th className="py-2">Net</th>
                <th className="py-2">Status</th>
                <th className="py-2">Paid on</th>
              </tr>
            </thead>
            <tbody>
              {finance.payouts.map((p) => (
                <tr key={p.id} className="border-t border-[#E1E4EA]">
                  <td className="py-2">{day(p.period_start_date)} to {day(p.period_end_date)}</td>
                  <td className="py-2">{p.orders_count}</td>
                  <td className="py-2">{naira(p.gross_amount)}</td>
                  <td className="py-2 font-semibold">{naira(p.net_amount)}</td>
                  <td className="py-2">
                    <StatusBadge status={p.status} />
                    {p.failure_reason && <p className="text-[11px] text-[#DC2626] mt-1">{p.failure_reason}</p>}
                  </td>
                  <td className="py-2">{p.processed_date ? day(p.processed_date) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
