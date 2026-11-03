"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RegistrationStats, getRegistrationStats } from "@/lib/api/admin/ops";
import RegistrationTrendChart from "@/components/dashboard/RegistrationTrendChart";

interface Counts {
  total: number;
  new_today: number;
  new_last_7_days: number;
  previous_7_days: number;
  new_last_30_days: number;
  previous_30_days: number;
}

const trend = (now: number, before: number) => {
  if (before === 0 && now === 0) return { text: "no change", tone: "text-[#9CA3AF]" };
  if (before === 0) return { text: `+${now} new`, tone: "text-[#059669]" };
  const pct = Math.round(((now - before) / before) * 100);
  return { text: `${pct >= 0 ? "+" : ""}${pct}% vs previous 7 days`, tone: pct >= 0 ? "text-[#059669]" : "text-[#DC2626]" };
};

/** Lagos calendar day (YYYY-MM-DD), `back` days before the stats snapshot. */
const lagosDay = (asOf: string, back: number) =>
  new Date(new Date(asOf).getTime() + 60 * 60 * 1000 - back * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

function AccountCard({
  title,
  icon,
  href,
  asOf,
  counts,
  rows,
}: {
  title: string;
  icon: string;
  href: string;
  asOf: string;
  counts: Counts;
  rows: { label: string; value: number; href?: string; tone?: string }[];
}) {
  const t = trend(counts.new_last_7_days, counts.previous_7_days);
  return (
    <div className="p-4 rounded-2xl border border-[#E1E4EA] bg-white flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Link href={href} className="text-[11px] font-medium uppercase tracking-wider text-[#525866] hover:text-[#2563EB]">
          {title}
        </Link>
        <i className={`pi ${icon} text-[#525866]`} />
      </div>
      <div>
        <p className="text-[24px] font-bold text-[#111827]">{counts.total.toLocaleString()}</p>
        <p className="text-[12px] text-[#525866]">
          {[
            { n: counts.new_today, text: "today", back: 0 },
            { n: counts.new_last_7_days, text: "in 7 days", back: 6 },
            { n: counts.new_last_30_days, text: "in 30 days", back: 29 },
          ].map((w, i) => (
            <span key={w.text}>
              {i > 0 && " · "}
              <Link href={`${href}?created_from=${lagosDay(asOf, w.back)}&created_to=${lagosDay(asOf, 0)}`} className="hover:text-[#2563EB]">
                <strong className="text-[#111827]">{w.n}</strong> {w.text}
              </Link>
            </span>
          ))}
        </p>
        <p className={`text-[11px] ${t.tone}`}>{t.text}</p>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 border-t border-[#E1E4EA] pt-3">
        {rows.map((r) => {
          const body = (
            <>
              <span className="text-[12px] text-[#525866]">{r.label}</span>
              <span className={`text-[13px] font-semibold ${r.tone ?? "text-[#111827]"}`}>{r.value}</span>
            </>
          );
          return r.href ? (
            <Link key={r.label} href={r.href} className="flex items-center justify-between hover:bg-[#F9FAFB] rounded px-1">
              {body}
            </Link>
          ) : (
            <div key={r.label} className="flex items-center justify-between px-1">{body}</div>
          );
        })}
      </div>
    </div>
  );
}

/** Registrations per account type plus what needs an admin's attention. Every number links to its records. */
export default function RegistrationOverview() {
  const [stats, setStats] = useState<RegistrationStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getRegistrationStats()
      .then(({ data }) => !cancelled && setStats(data))
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <p className="text-[13px] text-[#DC2626]">Registrations unavailable: {error}</p>;
  if (!stats) return <div className="h-40 rounded-2xl border border-[#E1E4EA] bg-white animate-pulse" />;

  const a = stats.attention;
  const attention: { label: string; value: number; href: string }[] = [
    { label: "Vendors waiting for approval", value: a.vendors_pending_approval, href: "/vendor?status=pending_approval" },
    { label: "Of those, ready to approve", value: a.vendors_ready_to_approve, href: "/vendor?status=pending_approval&ready=true" },
    { label: "Vendors with open corrections", value: a.vendors_with_open_corrections, href: "/vendor?review=corrections" },
    { label: "Vendors with suspicion flags", value: a.vendors_with_open_flags, href: "/vendor?review=flags" },
    { label: "Drivers awaiting verification", value: a.drivers_pending_verification, href: "/driver?verified=false" },
    { label: "Unverified customers", value: a.users_unverified, href: "/user?verified=false" },
    { label: "Orders stuck without a driver", value: a.orders_stuck_without_driver, href: "/order?stuck=true" },
    { label: "Refunds pending", value: a.refunds_pending, href: "/order?refund=refund_pending" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-semibold text-[#111827]">Registrations</h2>
        <p className="text-[11px] text-[#9CA3AF]">
          As of {new Date(stats.as_of).toLocaleString("en-NG", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short", timeZone: "Africa/Lagos" })} Lagos time
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <AccountCard
          title="Customers"
          icon="pi-user"
          href="/user"
          asOf={stats.as_of}
          counts={stats.users}
          rows={[
            { label: "Verified", value: stats.users.verified },
            { label: "Unverified", value: stats.users.unverified, href: "/user?verified=false", tone: stats.users.unverified ? "text-[#D97706]" : undefined },
          ]}
        />
        <AccountCard
          title="Drivers"
          icon="pi-car"
          href="/driver"
          asOf={stats.as_of}
          counts={stats.drivers}
          rows={[
            { label: "Verified", value: stats.drivers.verified },
            { label: "Pending", value: stats.drivers.pending_verification, href: "/driver?verified=false", tone: stats.drivers.pending_verification ? "text-[#D97706]" : undefined },
            { label: "Rejected", value: stats.drivers.rejected },
            { label: "Available now", value: stats.drivers.available_now, href: "/driver?status=AVAILABLE" },
          ]}
        />
        <AccountCard
          title="Vendors"
          icon="pi-shop"
          href="/vendor"
          asOf={stats.as_of}
          counts={stats.vendors}
          rows={[
            { label: "Active", value: stats.vendors.active, href: "/vendor?status=active" },
            { label: "Pending approval", value: stats.vendors.pending_approval, href: "/vendor?status=pending_approval", tone: stats.vendors.pending_approval ? "text-[#D97706]" : undefined },
            { label: "Suspended", value: stats.vendors.suspended, href: "/vendor?status=suspended" },
            { label: "KYC completed", value: stats.vendors.kyc_completed, href: "/vendor?kyc_status=completed" },
          ]}
        />
      </div>

      <RegistrationTrendChart />

      <div className="p-4 rounded-2xl border border-[#E1E4EA] bg-white">
        <h3 className="text-[13px] font-semibold text-[#111827] mb-3">Needs attention</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2">
          {attention.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg border text-[13px] hover:border-[#2563EB] ${
                item.value > 0 ? "border-[#FDE68A] bg-[#FFFBEB]" : "border-[#E1E4EA] bg-white"
              }`}
            >
              <span className="text-[#525866]">{item.label}</span>
              <span className={`font-bold ${item.value > 0 ? "text-[#92400E]" : "text-[#9CA3AF]"}`}>{item.value}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
