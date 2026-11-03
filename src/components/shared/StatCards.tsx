"use client";

export interface StatCard {
  key: string;
  label: string;
  /** A count. Shown with thousands separators; a dash while it has not loaded. */
  value?: number;
  /** Shown instead of `value`, for money and durations ("₦12,500", "4h 20m") */
  text?: string;
  /** A small extra line under the number */
  hint?: string;
  /** Highlights the number when there is something to act on */
  tone?: "default" | "warn" | "bad" | "good";
  /** A card with a click handler is a filter. Without one it is just a figure. */
  active?: boolean;
  onClick?: () => void;
}

const TONE: Record<NonNullable<StatCard["tone"]>, string> = {
  default: "text-[#111827]",
  warn: "text-[#B45309]",
  bad: "text-[#B91C1C]",
  good: "text-[#047857]",
};

/**
 * The one card used at the top of every admin list: label, a number, optional small hint. Cards with a click
 * handler filter the list (click again to clear); cards without one only show a figure.
 */
export default function StatCards({ cards }: { cards: StatCard[] }) {
  return (
    <div role="group" aria-label="Summary" className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(170px,1fr))]">
      {cards.map((card) => {
        const shown = card.text ?? (card.value === undefined ? "—" : card.value.toLocaleString());
        const hasValue = card.text !== undefined || !!card.value;
        const body = (
          <>
            <span className="block text-[11px] uppercase tracking-wider text-[#525866] leading-snug">{card.label}</span>
            <span className={`block text-[24px] font-bold leading-tight mt-1 ${hasValue ? TONE[card.tone ?? "default"] : "text-[#9CA3AF]"}`}>{shown}</span>
            {card.hint && <span className="block text-[11px] text-[#525866] leading-snug mt-1">{card.hint}</span>}
          </>
        );
        const size = "text-left border rounded-xl px-4 py-3";
        if (!card.onClick) {
          return (
            <div key={card.key} className={`${size} border-[#E1E4EA] bg-white`}>
              {body}
            </div>
          );
        }
        return (
          <button
            key={card.key}
            type="button"
            onClick={card.onClick}
            aria-pressed={!!card.active}
            className={`${size} transition-colors ${card.active ? "border-[#2563EB] bg-[#F8FAFF]" : "border-[#E1E4EA] bg-white hover:border-[#93C5FD]"}`}
          >
            {body}
          </button>
        );
      })}
    </div>
  );
}
