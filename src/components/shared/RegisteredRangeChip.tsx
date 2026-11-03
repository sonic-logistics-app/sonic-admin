"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const label = (day: string) => {
  const parsed = new Date(`${day}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? day : parsed.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
};

/** Reads ?created_from / ?created_to from the address bar (set by the dashboard drill-down). */
export function useRegisteredRange() {
  const params = useSearchParams();
  return { createdFrom: params.get("created_from") || "", createdTo: params.get("created_to") || "" };
}

/** Shows the registration date range a list was opened with, and lets the admin clear it. */
export default function RegisteredRangeChip() {
  const { createdFrom, createdTo } = useRegisteredRange();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  if (!createdFrom && !createdTo) return null;

  const clear = () => {
    const next = new URLSearchParams(params.toString());
    next.delete("created_from");
    next.delete("created_to");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  const text =
    createdFrom && createdTo
      ? createdFrom === createdTo
        ? label(createdFrom)
        : `${label(createdFrom)} to ${label(createdTo)}`
      : createdFrom
        ? `from ${label(createdFrom)}`
        : `up to ${label(createdTo)}`;

  return (
    <button
      type="button"
      onClick={clear}
      className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[12px] font-medium text-[#1D4ED8] hover:bg-[#DBEAFE]"
      title="Clear the date filter"
    >
      Registered {text}
      <i className="pi pi-times text-[10px]" />
    </button>
  );
}
