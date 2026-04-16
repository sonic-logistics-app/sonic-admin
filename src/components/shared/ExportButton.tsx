/**
 * ExportButton Component
 * Compliant with design specification
 */

"use client";

import React, { useState } from "react";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { Toast } from "primereact/toast";
import { useRef } from "react";

interface ExportButtonProps {
  onExport: (format: "csv" | "excel" | "pdf") => Promise<void> | void;
  formats?: ("csv" | "excel" | "pdf")[];
  className?: string;
  disabled?: boolean;
}

/**
 * ExportButton with multiple format support
 */
export default function ExportButton({
  onExport,
  formats = ["csv", "excel", "pdf"],
  className = "",
  disabled = false,
}: ExportButtonProps) {
  const [exporting, setExporting] = useState<string | null>(null);
  const toast = useRef<Toast>(null);
  const menu = useRef<Menu>(null);

  const formatLabels = {
    csv: "CSV",
    excel: "Excel",
    pdf: "PDF",
  };

  const formatIcons = {
    csv: "pi pi-file",
    excel: "pi pi-file-excel",
    pdf: "pi pi-file-pdf",
  };

  const handleExport = async (format: "csv" | "excel" | "pdf") => {
    setExporting(format);
    try {
      await onExport(format);
      toast.current?.show({
        severity: "success",
        summary: "Export Successful",
        detail: `${formatLabels[format]} file exported successfully`,
        life: 3000,
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast.current?.show({
        severity: "error",
        summary: "Export Failed",
        detail: `Failed to export ${formatLabels[format]} file`,
        life: 5000,
      });
    } finally {
      setExporting(null);
    }
  };

  const menuItems = formats.map((format) => ({
    label: formatLabels[format],
    icon: formatIcons[format],
    command: () => handleExport(format),
    disabled: exporting !== null,
  }));

  // If only one format, show direct button
  if (formats.length === 1) {
    const format = formats[0];
    return (
      <>
        <Button
          label={`Export ${formatLabels[format]}`}
          icon={formatIcons[format]}
          onClick={() => handleExport(format)}
          loading={exporting === format}
          disabled={disabled || exporting !== null}
          className={className}
        />
        <Toast ref={toast} />
      </>
    );
  }

  // Multiple formats - show dropdown menu
  return (
    <>
      <Button
        label="Export"
        icon="pi pi-download"
        onClick={(e) => menu.current?.toggle(e)}
        disabled={disabled || exporting !== null}
        loading={exporting !== null}
        className={className}
      />
      <Menu ref={menu} model={menuItems} popup />
      <Toast ref={toast} />
    </>
  );
}
