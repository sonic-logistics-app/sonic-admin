"use client";

import { useEffect } from "react";
import Button from "./Button";

interface ConfirmDialogProps {
  visible: boolean;
  onHide: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "primary" | "danger" | "success";
  icon?: string;
}

export default function ConfirmDialog({
  visible,
  onHide,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "primary",
  icon = "pi-question-circle",
}: ConfirmDialogProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && visible) {
        onHide();
      }
    };

    if (visible) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [visible, onHide]);

  if (!visible) return null;

  const handleConfirm = () => {
    onConfirm();
    onHide();
  };

  const getIconColor = () => {
    switch (confirmVariant) {
      case "danger":
        return "text-[#DC2626]";
      case "success":
        return "text-[#059669]";
      default:
        return "text-[#2563EB]";
    }
  };

  const getButtonVariant = () => {
    switch (confirmVariant) {
      case "danger":
        return "danger";
      case "success":
        return "success";
      default:
        return "primary";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onHide}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl border border-[#E1E4EA] w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b border-[#E1E4EA]">
          <i className={`pi ${icon} text-2xl ${getIconColor()}`} />
          <h2 className="text-[18px] font-semibold text-[#111827]">{title}</h2>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-[13px] text-[#525866] leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 p-6 border-t border-[#E1E4EA]">
          <Button
            variant="outline"
            onClick={onHide}
            className="px-4 py-2"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={getButtonVariant()}
            onClick={handleConfirm}
            className="px-4 py-2"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}