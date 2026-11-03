import React from "react";

interface CellStackProps {
  primary: React.ReactNode;
  secondary?: React.ReactNode;
  tertiary?: React.ReactNode;
  /** Renders the primary line in a monospace face (codes, ids) */
  mono?: boolean;
}

/**
 * Two or three stacked lines in one table cell: a bold main line with muted detail lines below.
 * Lets a list page fold related columns together so the table fits without sideways scrolling.
 */
export default function CellStack({ primary, secondary, tertiary, mono }: CellStackProps) {
  return (
    <div className="flex flex-col leading-snug min-w-0">
      <span className={`text-[13px] font-semibold text-[#111827] ${mono ? "font-mono" : ""}`}>{primary}</span>
      {secondary !== undefined && secondary !== null && secondary !== "" && (
        <span className="text-[12px] text-[#525866] break-words">{secondary}</span>
      )}
      {tertiary !== undefined && tertiary !== null && tertiary !== "" && (
        <span className="text-[12px] text-[#9CA3AF] break-words">{tertiary}</span>
      )}
    </div>
  );
}
