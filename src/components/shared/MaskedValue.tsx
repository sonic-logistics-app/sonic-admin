"use client";

import { useState } from "react";

interface MaskedValueProps {
  value: string;
  /** How many trailing characters stay visible while hidden. */
  visibleEnd?: number;
  className?: string;
}

/** Shows a sensitive number (BVN, NIN, account number) hidden until the admin chooses to reveal it. */
export default function MaskedValue({ value, visibleEnd = 3, className = "" }: MaskedValueProps) {
  const [shown, setShown] = useState(false);
  const hidden = value.length > visibleEnd ? `${"•".repeat(value.length - visibleEnd)}${value.slice(-visibleEnd)}` : "•".repeat(value.length);

  return (
    <span className="inline-flex items-center gap-2">
      <span className={className}>{shown ? value : hidden}</span>
      <button
        type="button"
        onClick={() => setShown((v) => !v)}
        className="text-[11px] text-[#2563EB] hover:underline font-medium"
        aria-label={shown ? "Hide value" : "Reveal value"}
      >
        {shown ? "Hide" : "Reveal"}
      </button>
    </span>
  );
}
