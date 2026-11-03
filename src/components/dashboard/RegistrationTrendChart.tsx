"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RegistrationTrend, getRegistrationTrend } from "@/lib/api/admin/ops";

const SERIES = [
  { key: "users", label: "Customers", color: "#2563EB", href: "/user" },
  { key: "drivers", label: "Drivers", color: "#9C27B0", href: "/driver" },
  { key: "vendors", label: "Vendors", color: "#F59E0B", href: "/vendor" },
] as const;

const RANGES = [7, 30, 90];

const shortDay = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-NG", { day: "numeric", month: "short" });

/** New accounts per day, stacked by account type. Click a day to open that day's records. */
export default function RegistrationTrendChart() {
  const [days, setDays] = useState(30);
  const [trend, setTrend] = useState<RegistrationTrend | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setTrend(null);
    getRegistrationTrend(days)
      .then(({ data }) => !cancelled && setTrend(data))
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [days]);

  if (error) return <p className="text-[13px] text-[#DC2626]">Registration trend unavailable: {error}</p>;
  if (!trend) return <div className="h-56 rounded-2xl border border-[#E1E4EA] bg-white animate-pulse" />;

  const totals = trend.series.map((d) => d.users + d.drivers + d.vendors);
  const max = Math.max(1, ...totals);
  const width = 900;
  const height = 180;
  const gap = days > 30 ? 1 : 3;
  const bar = (width - gap * (trend.series.length - 1)) / trend.series.length;
  const selected = trend.series.find((d) => d.date === picked) ?? null;
  const sum = (key: (typeof SERIES)[number]["key"]) => trend.series.reduce((a, d) => a + d[key], 0);

  return (
    <div className="p-4 rounded-2xl border border-[#E1E4EA] bg-white flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-[13px] font-semibold text-[#111827]">New accounts per day</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-[12px] text-[#525866]">
            {SERIES.map((s) => (
              <span key={s.key} className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: s.color }} />
                {s.label} <strong className="text-[#111827]">{sum(s.key)}</strong>
              </span>
            ))}
          </div>
          <div role="tablist" aria-label="Chart range" className="inline-flex rounded-lg border border-[#E1E4EA] p-0.5">
            {RANGES.map((r) => (
              <button
                key={r}
                role="tab"
                aria-selected={days === r}
                onClick={() => {
                  setDays(r);
                  setPicked(null);
                }}
                className={`px-2.5 py-1 rounded-md text-[12px] font-medium ${days === r ? "bg-[#2563EB] text-white" : "text-[#525866] hover:text-[#111827]"}`}
              >
                {r}d
              </button>
            ))}
          </div>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height + 22}`} className="w-full h-auto" role="img" aria-label={`New accounts per day over the last ${days} days`}>
        {[0, 0.5, 1].map((f) => (
          <g key={f}>
            <line x1="0" x2={width} y1={height - f * height} y2={height - f * height} stroke="#EEF0F3" strokeWidth="1" />
            <text x="0" y={height - f * height - 3} fontSize="10" fill="#9CA3AF">{Math.round(max * f)}</text>
          </g>
        ))}
        {trend.series.map((d, i) => {
          const x = i * (bar + gap);
          let y = height;
          const total = totals[i];
          return (
            <g key={d.date} onClick={() => setPicked(picked === d.date ? null : d.date)} className="cursor-pointer">
              <title>{`${shortDay(d.date)}: ${d.users} customers, ${d.drivers} drivers, ${d.vendors} vendors`}</title>
              <rect x={x} y={0} width={bar} height={height} fill={picked === d.date ? "#EFF6FF" : "transparent"} />
              {SERIES.map((s) => {
                const h = (d[s.key] / max) * height;
                y -= h;
                return h > 0 ? <rect key={s.key} x={x} y={y} width={bar} height={h} fill={s.color} rx={days > 30 ? 0 : 2} /> : null;
              })}
              {total === 0 && <rect x={x} y={height - 1} width={bar} height={1} fill="#E1E4EA" />}
              {(days <= 7 || i % Math.ceil(days / 8) === 0) && (
                <text x={x + bar / 2} y={height + 14} fontSize="10" textAnchor="middle" fill="#9CA3AF">{shortDay(d.date)}</text>
              )}
            </g>
          );
        })}
      </svg>

      {selected ? (
        <div className="flex flex-wrap items-center gap-2 border-t border-[#E1E4EA] pt-3 text-[13px]">
          <strong className="text-[#111827]">{shortDay(selected.date)}</strong>
          {SERIES.map((s) => (
            <Link
              key={s.key}
              href={`${s.href}?created_from=${selected.date}&created_to=${selected.date}`}
              className="px-2.5 py-1 rounded-full border border-[#E1E4EA] text-[#525866] hover:border-[#2563EB] hover:text-[#2563EB]"
            >
              {selected[s.key]} {s.label.toLowerCase()}
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-[#9CA3AF]">Days are Lagos calendar days. Click a day to open its records.</p>
      )}
    </div>
  );
}
