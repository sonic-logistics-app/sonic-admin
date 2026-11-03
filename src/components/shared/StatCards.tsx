"use client";

export interface StatCard {
  key: string;
  label: string;
  value: number | undefined;
  /** Highlights the number when there is something to act on */
  tone?: "default" | "warn" | "bad" | "good";
  active: boolean;
  onClick: () => void;
}

const TONE: Record<NonNullable<StatCard["tone"]>, string> = {
  default: "text-[#111827]",
  warn: "text-[#B45309]",
  bad: "text-[#B91C1C]",
  good: "text-[#047857]",
};

/**
 * A slim row of counts at the top of a list. Each card is a filter: click one to show just those rows,
 * click it again to clear. A dash means the count has not loaded.
 */
export default function StatCards({ cards }: { cards: StatCard[] }) {
  return (
    <div role="group" aria-label="Quick filters" className="flex flex-wrap gap-2">
      {cards.map((card) => (
        <button
          key={card.key}
          type="button"
          onClick={card.onClick}
          aria-pressed={card.active}
          className={`min-w-[104px] text-left border rounded-lg px-3 py-1.5 transition-colors ${
            card.active ? "border-[#2563EB] bg-[#F8FAFF]" : "border-[#E1E4EA] bg-white hover:border-[#93C5FD]"
          }`}
        >
          <span className="block text-[10px] uppercase tracking-wider text-[#525866] leading-tight">{card.label}</span>
          <span className={`block text-[16px] font-bold leading-tight ${card.value ? TONE[card.tone ?? "default"] : "text-[#9CA3AF]"}`}>
            {card.value === undefined ? "—" : card.value.toLocaleString()}
          </span>
        </button>
      ))}
    </div>
  );
}
