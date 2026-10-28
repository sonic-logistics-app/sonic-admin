"use client";

import { useState } from "react";

interface ExcelExportButtonProps {
  /** Runs the export and resolves once the file is handed to the browser. The page shows any toast. */
  onExport: () => Promise<void>;
  disabled?: boolean;
}

/** Secondary button that sits next to a page's Create button. */
export default function ExcelExportButton({ onExport, disabled = false }: ExcelExportButtonProps) {
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await onExport();
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy || disabled}
      className="px-4 py-2 bg-white text-[#111827] border border-[#E1E4EA] rounded-lg text-[13px] font-semibold hover:bg-[#F3F4F6] transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <i className={`pi ${busy ? "pi-spinner pi-spin" : "pi-file-excel"} text-sm`} />
      {busy ? "Exporting..." : "Export to Excel"}
    </button>
  );
}
