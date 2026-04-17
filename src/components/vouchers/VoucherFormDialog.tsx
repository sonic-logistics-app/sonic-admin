"use client";

import { useState, useEffect } from "react";
import VoucherService, { Voucher } from "@/services/VoucherService";
import { ToastRef } from "@/components/shared/Toast";

interface VoucherFormDialogProps {
  visible: boolean;
  editMode: boolean;
  voucher: Voucher | null;
  onHide: () => void;
  onSave: () => void;
  toast: React.RefObject<ToastRef | null>;
}

const defaultFormData = {
  code: "",
  name: "",
  amount: 0,
  expiry_type: "fixed",
};

export default function VoucherFormDialog({
  visible,
  editMode,
  voucher,
  onHide,
  onSave,
  toast,
}: VoucherFormDialogProps) {
  const voucherService = new VoucherService();

  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    if (visible) {
      if (editMode && voucher) {
        setFormData({
          code: voucher.code,
          name: voucher.name,
          amount: voucher.amount,
          expiry_type: voucher.expiry_type,
        });
      } else {
        setFormData(defaultFormData);
      }
    }
  }, [visible, editMode, voucher]);

  const handleSave = async () => {
    try {
      if (editMode && voucher) {
        await voucherService.updateVoucher(voucher.id, formData);
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: "Voucher updated successfully",
          life: 3000,
        });
      } else {
        await voucherService.createVoucher(formData);
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: "Voucher created successfully",
          life: 3000,
        });
      }
      onHide();
      onSave();
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "Failed to save voucher",
        life: 3000,
      });
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onHide}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl border border-[#E1E4EA] w-full max-w-md shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E1E4EA]">
          <h2 className="text-[18px] font-semibold text-[#111827]">
            {editMode ? "Edit Voucher" : "Create New Voucher"}
          </h2>
          <button
            onClick={onHide}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <i className="pi pi-times text-[#525866]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
              Voucher Code *
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
              placeholder="e.g., WELCOME2024"
              className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
              Voucher Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Welcome Bonus"
              className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
              Amount (NGN) *
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })
              }
              placeholder="e.g., 5000"
              className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
              min="0"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#525866] uppercase tracking-wider mb-2">
              Expiry Type *
            </label>
            <input
              type="text"
              value={formData.expiry_type}
              onChange={(e) =>
                setFormData({ ...formData, expiry_type: e.target.value })
              }
              placeholder="e.g., fixed 31/12/2026 or relative 30d"
              className="w-full px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] text-[#111827] focus:outline-none focus:border-[#2563EB]"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 p-6 border-t border-[#E1E4EA]">
          <button
            onClick={onHide}
            className="px-4 py-2 border border-[#E1E4EA] rounded-lg text-[13px] font-semibold text-[#525866] hover:bg-[#F9FAFB] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-[13px] font-semibold hover:bg-[#1d4ed8] transition-colors"
          >
            {editMode ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
