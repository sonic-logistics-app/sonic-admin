"use client";

import { useEffect, useState } from "react";
import { DriverPerformance, getDriverPerformance } from "@/lib/api/admin/ops";

const naira = (value: number) => `₦${value.toLocaleString("en-NG")}`;
const pct = (value: number | null) => (value === null ? "—" : `${value}%`);

/** Deliveries, completion and cancellation rates, rating, earnings and wallet for one driver. */
export default function DriverPerformancePanel({ driverId }: { driverId: string | number }) {
  const [perf, setPerf] = useState<DriverPerformance | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getDriverPerformance(driverId)
      .then(({ data }) => !cancelled && setPerf(data))
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [driverId]);

  if (error) return <p className="text-[13px] text-[#DC2626]">Performance unavailable: {error}</p>;
  if (!perf) return <p className="text-[13px] text-[#525866]">Loading performance...</p>;

  const d = perf.deliveries;
  const cards: [string, string, string?][] = [
    ["Deliveries completed", String(d.delivered)],
    ["In progress", String(d.in_progress)],
    ["Completion rate", pct(d.completion_rate), "Delivered ÷ (delivered + driver-cancelled)"],
    ["Cancellation rate", pct(d.cancellation_rate), "Driver-cancelled ÷ (delivered + driver-cancelled)"],
    ["Rating", perf.rating.average === null ? "No reviews" : `${Number(perf.rating.average).toFixed(1)} / 5`, `${perf.rating.reviews} review(s)`],
    ["Total earnings", naira(perf.earnings.total), `${perf.earnings.deliveries_paid} paid deliveries`],
    ["Avg per delivery", perf.earnings.average_per_delivery === null ? "—" : naira(perf.earnings.average_per_delivery)],
    ["Wallet balance", perf.wallet.balance === null ? "No wallet" : naira(perf.wallet.balance)],
  ];

  return (
    <div className="border border-[#E1E4EA] rounded-lg p-6">
      <h4 className="text-[15px] font-semibold text-[#111827] mb-4">Performance and earnings</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(([label, value, hint]) => (
          <div key={label} className="bg-[#F9FAFB] rounded-lg p-4" title={hint}>
            <p className="text-[11px] uppercase tracking-wider text-[#525866]">{label}</p>
            <p className="text-[18px] font-bold text-[#111827]">{value}</p>
            {hint && <p className="text-[10px] text-[#9CA3AF]">{hint}</p>}
          </div>
        ))}
      </div>

      {perf.earnings.recent.length > 0 && (
        <div className="mt-4">
          <p className="text-[12px] font-semibold text-[#111827] mb-2">Recent earnings</p>
          <table className="w-full text-[13px]">
            <tbody>
              {perf.earnings.recent.map((e) => (
                <tr key={e.id} className="border-t border-[#E1E4EA]">
                  <td className="py-1.5 text-[#525866]">Order #{e.order_id}</td>
                  <td className="py-1.5 font-semibold">{naira(e.amount)}</td>
                  <td className="py-1.5 text-[#9CA3AF]">{new Date(e.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
