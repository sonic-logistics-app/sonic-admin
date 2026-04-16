/**
 * ConfirmDialog Component
 * Compliant with design specification
 */

"use client";

import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { ProgressSpinner } from "primereact/progressspinner";

interface ConfirmDialogProps {
  visible: boolean;
  onHide: () => void;
  onConfirm: (reason?: string) => Promise<void> | void;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  requireReason?: boolean;
  reasonPlaceholder?: string;
  loading?: boolean;
}

/**
 * ConfirmDialog with optional reason input and keyboard shortcuts
 */
export default function ConfirmDialog({
  visible,
  onHide,
  onConfirm,
  title = "Confirm Action",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  requireReason = false,
  reasonPlaceholder = "Please provide a reason...",
  loading = false,
}: ConfirmDialogProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when dialog opens
  useEffect(() => {
    if (visible) {
      setReason("");
      setIsSubmitting(false);
    }
  }, [visible]);

  // Handle confirm
  const handleConfirm = async () => {
    if (requireReason && !reason.trim()) {
      return; // Don't proceed if reason is required but empty
    }

    setIsSubmitting(true);
    try {
      await onConfirm(requireReason ? reason : undefined);
      onHide();
    } catch (error) {
      console.error("Confirm action failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (!isSubmitting) {
      onHide();
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    if (!visible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (!requireReason || reason.trim()) {
          handleConfirm();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleCancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [visible, reason, requireReason]);

  const footer = (
    <div className="flex justify-end gap-2">
      <Button
        label={cancelLabel}
        icon="pi pi-times"
        onClick={handleCancel}
        disabled={isSubmitting}
        className="p-button-text"
      />
      <Button
        label={confirmLabel}
        icon={destructive ? "pi pi-trash" : "pi pi-check"}
        onClick={handleConfirm}
        disabled={isSubmitting || (requireReason && !reason.trim())}
        className={destructive ? "p-button-danger" : "p-button-primary"}
        loading={isSubmitting}
      />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={handleCancel}
      header={title}
      footer={footer}
      className="confirm-dialog"
      closable={!isSubmitting}
      closeOnEscape={!isSubmitting}
      modal
    >
      <div className="p-4">
        <p className="mb-4 text-700">{message}</p>

        {requireReason && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Reason <span className="text-red-500">*</span>
            </label>
            <InputTextarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={reasonPlaceholder}
              rows={3}
              className="w-full"
              disabled={isSubmitting}
              autoFocus
            />
          </div>
        )}

        {loading && (
          <div className="flex justify-center mt-4">
            <ProgressSpinner style={{ width: "30px", height: "30px" }} />
          </div>
        )}

        <div className="text-xs text-500 mt-4">
          Press Enter to confirm, Escape to cancel
        </div>
      </div>
    </Dialog>
  );
}
