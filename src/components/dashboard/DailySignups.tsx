"use client";

export interface DailySignupCount {
  today: number;
  yesterday: number;
  yesterday_same_time: number;
}

export interface DailySignupStats {
  date: string;
  new_vendors: DailySignupCount;
  new_users: DailySignupCount;
  new_drivers: DailySignupCount;
}

interface DailySignupsProps {
  daily: DailySignupStats | null;
  loading: boolean;
}

function formatDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short" });
}

function SignupCard({ label, icon, tint, count }: { label: string; icon: string; tint: string; count: DailySignupCount }) {
  const diff = count.today - count.yesterday_same_time;
  return (
    <div className="flex flex-col justify-center gap-3 p-4 rounded-2xl border border-[#E1E4EA] bg-white">
      <div className="flex justify-between items-center gap-2">
        <div className="flex flex-col gap-1 flex-1 overflow-hidden">
          <h3 className="text-[#525866] text-[11px] font-medium uppercase tracking-wider">{label}</h3>
          <p className="text-[20px] md:text-[24px] font-bold text-[#111827]">{count.today.toLocaleString()}</p>
        </div>
        <div className={`w-[36px] h-[36px] md:w-[40px] md:h-[40px] rounded-full flex items-center justify-center flex-shrink-0 ${tint}`}>
          <i className={`pi ${icon} w-5 h-5`} />
        </div>
      </div>
      <p className="text-[#525866] text-[11px]">
        <span
          className={`font-semibold ${diff > 0 ? "text-[#059669]" : diff < 0 ? "text-[#DC2626]" : "text-[#525866]"}`}
        >
          {diff > 0 && "+"}
          {diff}
        </span>{" "}
        vs same time yesterday · yesterday total {count.yesterday.toLocaleString()}
      </p>
    </div>
  );
}

export default function DailySignups({ daily, loading }: DailySignupsProps) {
  if (loading || !daily) return null;

  return (
    <section aria-label="Signups today">
      <h2 className="text-[#525866] text-[11px] font-medium uppercase tracking-wider mb-2">
        New today · {formatDate(daily.date)}
      </h2>
      <div className="grid grid-cols-3 gap-3 w-full">
        <SignupCard label="NEW VENDORS" icon="pi-shop" tint="bg-[#EDE9FE] text-[#7C3AED]" count={daily.new_vendors} />
        <SignupCard label="NEW CUSTOMERS" icon="pi-user" tint="bg-[#D1FAE5] text-[#059669]" count={daily.new_users} />
        <SignupCard label="NEW DRIVERS" icon="pi-users" tint="bg-[#CFFAFE] text-[#0891B2]" count={daily.new_drivers} />
      </div>
    </section>
  );
}
